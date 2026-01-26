const express = require("express");
const { Author, Book } = require("./models"); // Importera modellerna

const app = express();
const PORT = 3000;

// Middleware för att kunna läsa JSON
app.use(express.json());

// --- Routes ---

// Root
app.get("/", (req, res) => {
  res.send("Välkommen till vårt API med Sequelize!");
});

// Hämta alla författare
app.get("/api/authors", async (req, res) => {
  try {
    const authors = await Author.findAll(); // Sequelize-metod för SELECT *
    res.json(authors);
  } catch (err) {
    console.error("Fel vid hämtning av författare:", err);
    res.status(500).send("Ett fel uppstod vid hämtning av författare.");
  }
});

// Lägg till en ny författare
app.post("/api/authors", async (req, res) => {
  const { name, year_of_birth } = req.body;

  try {
    // Sequelize-metod för INSERT INTO
    const newAuthor = await Author.create({ name, year_of_birth }); 
    res.json({
      message: "Författaren lades till",
      author: newAuthor,
    });
  } catch (err) {
    console.error("Fel vid tillägg av författare:", err);
    res.status(500).send("Ett fel uppstod vid tillägg av författare.");
  }
});

// Hämta alla böcker (förberedelse för uppgift 4/6)
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.findAll({ include: Author }); // Inkluderar författardata
    res.json(books);
  } catch (err) {
    console.error("Fel vid hämtning av böcker:", err);
    res.status(500).send("Ett fel uppstod.");
  }
});

// Starta servern
app.listen(PORT, () => {
  console.log(`🚀 Server körs på http://localhost:${PORT}`);
});

