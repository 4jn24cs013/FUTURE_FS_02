const API_URL = "http://localhost:5000/api/leads";

const leadForm = document.getElementById("leadForm");
const leadsContainer = document.getElementById("leadsContainer");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let allLeads = [];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Update dashboard statistics
function updateDashboard(leads) {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === "New").length;
    const contactedCount = leads.filter(l => l.status === "Contacted").length;
    const convertedCount = leads.filter(l => l.status === "Converted").length;
    const rate = total ? ((convertedCount / total) * 100).toFixed(1) : "0.0";

    document.getElementById("totalLeads").textContent = total;
    document.getElementById("newLeads").textContent = newCount;
    document.getElementById("contactedLeads").textContent = contactedCount;
    document.getElementById("convertedLeads").textContent = convertedCount;
    document.getElementById("conversionRate").textContent = rate + "%";
}

// Search and filter leads
function renderLeads() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const selectedStatus = statusFilter?.value || "All";

    const filteredLeads = allLeads.filter(lead => {
        const matchesSearch = [
            lead.name,
            lead.email,
            lead.company,
            lead.phone
        ].some(value => String(value || "").toLowerCase().includes(query));

        const matchesStatus =
            selectedStatus === "All" || lead.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredLeads.length === 0) {
        leadsContainer.innerHTML = allLeads.length
            ? "<p>No leads match your search or filter.</p>"
            : "<p>No leads found. Add your first lead!</p>";
        return;
    }

    leadsContainer.innerHTML = filteredLeads.map(lead => `
        <div class="lead-card">
            <h3>${escapeHTML(lead.name)}</h3>
            <p><strong>Email:</strong> ${escapeHTML(lead.email)}</p>
            <p><strong>Phone:</strong> ${escapeHTML(lead.phone || "N/A")}</p>
            <p><strong>Company:</strong> ${escapeHTML(lead.company || "N/A")}</p>
            <p><strong>Source:</strong> ${escapeHTML(lead.source || "N/A")}</p>
            <p><strong>Message:</strong> ${escapeHTML(lead.message || "N/A")}</p>

            <label for="status-${Number(lead.id)}">Status:</label>
            <select id="status-${Number(lead.id)}">
                ${["New", "Contacted", "Converted"].map(status => `
                    <option value="${status}" ${lead.status === status ? "selected" : ""}>
                        ${status}
                    </option>
                `).join("")}
            </select>

            <p><strong>Follow-up notes:</strong>
    ${escapeHTML(lead.follow_up_notes || "No notes yet")}
</p>

<p><strong>Follow-up date:</strong>
    ${escapeHTML(lead.follow_up_date
        ? String(lead.follow_up_date).slice(0, 10)
        : "Not scheduled")}
</p>

            <div class="lead-actions">
                <button type="button" onclick="editLead(${Number(lead.id)})">Edit</button>
                <button type="button" onclick="updateStatus(${Number(lead.id)})">Update Status</button>
                <button type="button" onclick="deleteLead(${Number(lead.id)})">Delete</button>
            </div>
        </div>
    `).join("");
}

// Load leads from backend
async function loadLeads() {
    try {
        const response = await fetch(API_URL);
        const leads = await response.json();

        if (!response.ok) {
            throw new Error(leads.error || "Could not load leads");
        }

        if (!Array.isArray(leads)) {
            throw new Error("Unexpected response from backend");
        }

        allLeads = leads;
        updateDashboard(allLeads);
        renderLeads();

    } catch (error) {
        console.error("Error loading leads:", error);
        leadsContainer.innerHTML = "<p>Unable to load leads. Check the backend server.</p>";
    }
}

// Search/filter events
searchInput?.addEventListener("input", renderLeads);
statusFilter?.addEventListener("change", renderLeads);

// Add a lead
leadForm.addEventListener("submit", async event => {
    event.preventDefault();

    const lead = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        company: document.getElementById("company").value.trim(),
        source: document.getElementById("source").value,
        message: document.getElementById("message").value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lead)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not add lead");
        }

        alert("Lead added successfully!");
        leadForm.reset();
        if (searchInput) searchInput.value = "";
        if (statusFilter) statusFilter.value = "All";
        await loadLeads();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

// Edit a lead
async function editLead(id) {
    try {
        const lead = allLeads.find(item => Number(item.id) === id);
        if (!lead) throw new Error("Lead not found");

        const name = prompt("Enter name:", lead.name);
        if (name === null) return;

        const email = prompt("Enter email:", lead.email);
        if (email === null) return;

        const phone = prompt("Enter phone:", lead.phone || "");
        if (phone === null) return;

        const company = prompt("Enter company:", lead.company || "");
        if (company === null) return;

        const source = prompt(
            "Enter source (Website, LinkedIn, Referral, Other):",
            lead.source || ""
        );
        if (source === null) return;

        const message = prompt("Enter message:", lead.message || "");
        if (message === null) return;

        const notes = prompt("Enter follow-up notes:", lead.follow_up_notes || "");
        if (notes === null) return;
        const followUpDate = prompt(
    "Enter follow-up date (YYYY-MM-DD), or leave blank:",
    lead.follow_up_date
        ? String(lead.follow_up_date).slice(0, 10)
        : ""
);

if (followUpDate === null) return;

        await saveLead(id, {
            ...lead,
            name: name.trim(),
            email: email.trim(),
            phone,
            company,
            source,
            message,
            follow_up_notes: notes,
            follow_up_date:followUpDate.trim()||null
        });

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Save edits
async function saveLead(id, lead) {
    if (!lead.name || !lead.email) {
        alert("Name and email are required.");
        return;
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Could not update lead");
    }

    alert("Lead updated successfully!");
    await loadLeads();
}

// Update status
async function updateStatus(id) {
    try {
        const lead = allLeads.find(item => Number(item.id) === id);
        const statusSelect = document.getElementById(`status-${id}`);

        if (!lead || !statusSelect) return;

        await saveLead(id, {
            ...lead,
            status: statusSelect.value
        });

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Delete a lead
async function deleteLead(id) {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not delete lead");
        }

        alert("Lead deleted successfully!");
        await loadLeads();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

loadLeads();