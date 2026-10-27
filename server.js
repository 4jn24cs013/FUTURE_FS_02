const express = require("express");
const cors = require("cors");

const leadsRouter = require("./leads");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Mini CRM Backend is running!");
});

app.use("/api/leads", leadsRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});