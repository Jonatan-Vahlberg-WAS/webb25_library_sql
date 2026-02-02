const express = require('express');
const app = express();
const port = 3000;

const pg = require('pg');
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'library_v5',
    password: 'postgres',
    port: 5432,
});

app.use(express.json());

pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        return console.error('Error executing query', err.stack);
    }
    console.log(result.rows);
});

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Uppgift 1: Info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: "Node_PSQL_API",
        version: "1.0.0",
        description: "Ett API för att hantera böcker och författare."
    });
});

app.get("/api/authors", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM author");
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inga författare hittades" });
        }
        res.json(result.rows);
    } catch (err) {
        console.error("Fel vid hämtning av författare:", err);
        res.status(500).send("Ett fel uppstod.");
    }
});

app.post("/api/authors", async (req, res) => {
    const { name, year_of_birth } = req.body;
  
    try {
      const result = await pool.query(
        "INSERT INTO author (name, year_of_birth) VALUES ($1, $2) RETURNING id",
        [name, year_of_birth]
      );
  
      res.json({
        message: "Författaren lades till",
        author_id: result.rows[0].id,
      });
    } catch (err) {
      console.error("Fel vid tillägg av författare:", err);
      res.status(500).send("Ett fel uppstod vid tillägg av författare.");
    }
  });

app.get("/api/books", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM book");
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inga böcker hittades" });
        }
        res.json(result.rows);
    } catch (err) {
        console.error("Fel vid hämtning av böcker:", err);
        res.status(500).send("Ett fel uppstod.");
    }
});

// Uppgift 2: Search endpoint
app.get("/api/books/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: "Sökparameter 'q' krävs" });
        }
        const result = await pool.query(
            `SELECT * FROM book WHERE name ILIKE '%${q}%'`
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Inga böcker hittades" });
        }
        res.json(result.rows);
    } catch (err) {
        console.error("Fel vid sökning av böcker:", err);
        res.status(500).send("Ett fel uppstod.");
    }
});

// Uppgift 3: POST /api/books - Create a new book
app.post("/api/books", async (req, res) => {
    try {
        const { title, author_id } = req.body;
        
        if (!title || !author_id) {
            return res.status(400).json({ message: "title och author_id krävs" });
        }
        
        const result = await pool.query(
            "INSERT INTO book (name, author_id) VALUES ($1, $2) RETURNING *",
            [title, author_id]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Fel vid tillägg av bok:", err);
        res.status(500).send("Ett fel uppstod vid tillägg av bok.");
    }
});

// Uppgift 3: GET /api/books/:id - Get a specific book
app.get("/api/books/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM book WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Bok hittades inte" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Fel vid hämtning av bok:", err);
        res.status(500).send("Ett fel uppstod.");
    }
});

// Uppgift 3: PUT /api/books/:id - Update a book
app.put("/api/books/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author_id } = req.body;
        
        // Check if book exists
        const checkResult = await pool.query("SELECT * FROM book WHERE id = $1", [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: "Bok hittades inte" });
        }
        
        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (title !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(title);
        }
        if (author_id !== undefined) {
            updates.push(`author_id = $${paramCount++}`);
            values.push(author_id);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: "Inga fält att uppdatera" });
        }
        
        values.push(id);
        const result = await pool.query(
            `UPDATE book SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        
        res.json({
            message: "Bok uppdaterades",
            book: result.rows[0]
        });
    } catch (err) {
        console.error("Fel vid uppdatering av bok:", err);
        res.status(500).send("Ett fel uppstod vid uppdatering av bok.");
    }
});

// Uppgift 3: DELETE /api/books/:id - Delete a book
app.delete("/api/books/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if book exists
        const checkResult = await pool.query("SELECT * FROM book WHERE id = $1", [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: "Bok hittades inte" });
        }
        
        await pool.query("DELETE FROM book WHERE id = $1", [id]);
        
        res.json({ message: "Bok togs bort" });
    } catch (err) {
        console.error("Fel vid borttagning av bok:", err);
        res.status(500).send("Ett fel uppstod vid borttagning av bok.");
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
