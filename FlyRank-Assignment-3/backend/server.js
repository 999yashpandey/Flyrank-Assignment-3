require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("./openapi.json");
const PostgresTodoRepository = require("./postgresTodoRepository");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Postgres Repository
const todoRepository = new PostgresTodoRepository(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// Root and health endpoints
// ------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ------------------------------------------------------------------
// Read
// ------------------------------------------------------------------

app.get("/tasks", async (req, res) => {
  try {
    const rows = await todoRepository.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await todoRepository.getById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Create
// ------------------------------------------------------------------

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const newTask = await todoRepository.create(title.trim());
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Update and delete
// ------------------------------------------------------------------

app.put("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await todoRepository.getById(id);
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { title, done } = req.body || {};

    if (title === undefined && done === undefined) {
      return res.status(400).json({ error: "Provide title and/or done to update" });
    }
    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return res.status(400).json({ error: "title must be a non-empty string" });
    }
    if (done !== undefined && typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be a boolean" });
    }

    const updatedTask = await todoRepository.update(id, {
      title: title !== undefined ? title.trim() : undefined,
      done: done !== undefined ? done : undefined,
    });

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await todoRepository.getById(id);
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    await todoRepository.delete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Swagger UI, served from static openapi.json
// ------------------------------------------------------------------

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log(`Swagger UI at http://localhost:${PORT}/docs`);
  console.log(`Data stored in PostgreSQL`);
});