const express = require("express");
const morgan = require("morgan");
const database = require("./database");

const app = express();

app.use(morgan("common"));
app.use(express.json());

// wrap async handlers so errors reach the error handler
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

app.get("/", wrap(async (req, res) => {
    const [rows] = await database.raw("select VERSION() version");
    res.json({ message: `Hello from MySQL ${rows[0].version}` });
}));

app.get("/healthz", (req, res) => {
    res.send("I am happy and healthy\n");
});

// READ all
app.get("/notes", wrap(async (req, res) => {
    const notes = await database("notes").orderBy("id", "desc");
    res.json(notes);
}));

// CREATE
app.post("/notes", wrap(async (req, res) => {
    const { title, content } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: "title is required" });
    }
    const [id] = await database("notes").insert({ title, content });
    const note = await database("notes").where({ id }).first();
    res.status(201).json(note);
}));

// UPDATE
app.put("/notes/:id", wrap(async (req, res) => {
    const { title, content } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: "title is required" });
    }
    const updated = await database("notes")
        .where({ id: req.params.id })
        .update({ title, content });
    if (!updated) {
        // MySQL reports 0 if nothing changed, so check the row exists
        const exists = await database("notes").where({ id: req.params.id }).first();
        if (!exists) return res.status(404).json({ error: "not found" });
    }
    const note = await database("notes").where({ id: req.params.id }).first();
    res.json(note);
}));

// DELETE
app.delete("/notes/:id", wrap(async (req, res) => {
    const deleted = await database("notes").where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: "not found" });
    res.status(204).end();
}));

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
});

module.exports = app;