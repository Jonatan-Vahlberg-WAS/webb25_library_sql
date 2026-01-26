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

app.get("/api/authors", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM author");
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
        res.json(result.rows);
    } catch (err) {
        console.error("Fel vid hämtning av böcker:", err);
        res.status(500).send("Ett fel uppstod.");
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});