const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("AI-Chatterbox Server is Running");
});

app.listen(PORT, () => {
    console.log(`AI-Chatterbox running on http://localhost:${PORT}`);
});