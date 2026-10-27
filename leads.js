const express = require("express");
const db = require("./db");

const router = express.Router();

// Get all leads
router.get("/", (req, res) => {
    db.query("SELECT * FROM leads ORDER BY id DESC", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add a new lead
router.post("/", (req, res) => {
    const { name, email, phone, company, source, message } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "Name and email are required"
        });
    }

    const sql = `
        INSERT INTO leads
        (name, email, phone, company, source, message)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, phone || null, company || null, source || null, message || null],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Lead added successfully",
                id: result.insertId
            });
        }
    );
});

// Edit lead details and update status
router.put("/:id", (req, res) => {
    const { name, 
        email, 
        phone, 
        company,
        source,
        status, 
        message,
        follow_up_notes,
        follow_up_date } = req.body;
    const { id } = req.params;
    const followUpDate=
    follow_up_date ? String(follow_up_date).slice(0,10)
    :null;
    

    const validStatuses = ["New", "Contacted", "Converted"];

    if (!name || !email) {
        return res.status(400).json({
            error: "Name and email are required"
        });
    }

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid lead status"
        });
    }

    const sql = `
        UPDATE leads
        SET name = ?, email = ?, phone = ?, company = ?,
            source = ?, status = ?, message = ?, follow_up_notes = ?,
            follow_up_date= ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name, 
            email,
             phone || null,
             company || null,
            source || null, 
            status || "New",
             message || null,
            follow_up_notes || null, 
            followUpDate,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Lead not found" });
            }

            res.json({ message: "Lead updated successfully" });
        }
    );
});

// Delete a lead
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM leads WHERE id = ?", [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Lead not found" });
        }

        res.json({ message: "Lead deleted successfully" });
    });
});

module.exports = router;