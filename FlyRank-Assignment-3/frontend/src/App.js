import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState("");

  const loadTasks = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setTasks)
      .catch(() => setError("Could not reach the API. Is the backend running on :3000?"));
  };

  useEffect(loadTasks, []);

  const createTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then((res) => res.json())
      .then((task) => {
        setTasks((prev) => [...prev, task]);
        setTitle("");
      });
  };

  const toggleDone = (task) => {
    fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    })
      .then((res) => res.json())
      .then((updated) =>
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      );
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditingId(null);
      });
  };

  const deleteTask = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(() =>
      setTasks((prev) => prev.filter((t) => t.id !== id))
    );
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>To-Do List</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={createTask} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <input type="checkbox" checked={task.done} onChange={() => toggleDone(task)} />
            {editingId === task.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button onClick={() => saveEdit(task.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    textDecoration: task.done ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </span>
                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
