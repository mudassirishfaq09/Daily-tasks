const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
const schedule = require('node-schedule');

app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite database
let db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT,
        status TEXT
    )`);
});

// Fetch all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Fetch completed tasks
app.get('/tasks/completed/today', (req, res) => {
    db.all(`SELECT * FROM tasks WHERE status = 'completed'`, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Fetch pending tasks
app.get('/tasks/pending/today', (req, res) => {
    db.all(`SELECT * FROM tasks WHERE status = 'pending'`, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add task
app.post('/tasks', (req, res) => {
    const { task } = req.body;
    db.run(`INSERT INTO tasks (task, status) VALUES (?, 'pending')`, [task], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Complete task
app.patch('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`UPDATE tasks SET status = 'completed' WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ changed: this.changes });
    });
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Reset tasks at midnight
schedule.scheduleJob('0 0 * * *', () => {
    db.run(`DELETE FROM tasks`, [], (err) => {
        if (err) {
            console.error('Failed to reset tasks:', err.message);
        } else {
            console.log('Tasks reset at midnight.');
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
