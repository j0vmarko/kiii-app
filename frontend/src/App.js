import React, { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = "/api/notes";
const headers = { "Content-Type": "application/json" };

function App() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);

    const loadNotes = useCallback(async () => {
        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            setNotes(await res.json());
            setError(null);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const resetForm = () => {
        setTitle("");
        setContent("");
        setEditingId(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!title.trim()) return;
        const url = editingId ? `${API}/${editingId}` : API;
        const method = editingId ? "PUT" : "POST";
        try {
            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            resetForm();
            loadNotes();
        } catch (e) {
            setError(e.message);
        }
    };

    const startEdit = note => {
        setEditingId(note.id);
        setTitle(note.title);
        setContent(note.content || "");
    };

    const handleDelete = async id => {
        try {
            const res = await fetch(`${API}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            if (editingId === id) resetForm();
            loadNotes();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="app">
            <h1>Notes</h1>
            {error && <p className="error">Error: {error}</p>}

            <form onSubmit={handleSubmit} className="note-form">
                <input
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <div>
                    <button type="submit">{editingId ? "Save" : "Add note"}</button>
                    {editingId && (
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <ul className="note-list">
                {notes.map(note => (
                    <li key={note.id}>
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>
                        <small>{new Date(note.created_at).toLocaleString()}</small>
                        <div>
                            <button onClick={() => startEdit(note)}>Edit</button>
                            <button onClick={() => handleDelete(note.id)}>Delete</button>
                        </div>
                    </li>
                ))}
                {notes.length === 0 && !error && <p>No notes yet.</p>}
            </ul>
        </div>
    );
}

export default App;