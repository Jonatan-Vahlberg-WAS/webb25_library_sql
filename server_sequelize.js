const express = require("express");
const { Op } = require("sequelize");
// Note: Genre and Book_Genre models need to be created in models.js for Uppgift 4 routes to work
const models = require("./models");
const { Author, Book } = models;
// Optional imports for Uppgift 4 (will be undefined if models don't exist)
const Genre = models.Genre;
const Book_Genre = models.Book_Genre;
const studentRoutes = require("./routes/students"); // Student routes

const app = express();
const PORT = 3000;

// Middleware för att kunna läsa JSON
app.use(express.json());

// --- Routes ---

// Root
app.get("/", (req, res) => {
  res.send("Välkommen till vårt API med Sequelize!");
});

// Uppgift 1: Info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    name: "Node_PSQL_API",
    version: "1.0.0",
    description: "Ett API för att hantera böcker och författare."
  });
});

// Hämta alla författare
app.get("/api/authors", async (req, res) => {
  try {
    const authors = await Author.findAll(); // Sequelize-metod för SELECT *
    if (authors.length === 0) {
      return res.status(404).json({ message: "Inga författare hittades" });
    }
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
    if (books.length === 0) {
      return res.status(404).json({ message: "Inga böcker hittades" });
    }
    res.json(books);
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
    const books = await Book.findAll({
      where: {
        title: {
          [Op.iLike]: `%${q}%`,
        },
      },
      include: Author,
    });
    if (books.length === 0) {
      return res.status(404).json({ message: "Inga böcker hittades" });
    }
    res.json(books);
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
    
    const newBook = await Book.create({ title, author_id });
    res.status(201).json(newBook);
  } catch (err) {
    console.error("Fel vid tillägg av bok:", err);
    res.status(500).send("Ett fel uppstod vid tillägg av bok.");
  }
});

// Uppgift 3: GET /api/books/:id - Get a specific book
app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id, { include: Author });
    
    if (!book) {
      return res.status(404).json({ message: "Bok hittades inte" });
    }
    
    res.json(book);
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
    
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: "Bok hittades inte" });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (author_id !== undefined) updateData.author_id = author_id;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Inga fält att uppdatera" });
    }
    
    await Book.update(updateData, { where: { id } });
    
    const updatedBook = await Book.findByPk(id, { include: Author });
    res.json({
      message: "Bok uppdaterades",
      book: updatedBook,
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
    
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: "Bok hittades inte" });
    }
    
    await Book.destroy({ where: { id } });
    
    res.json({ message: "Bok togs bort" });
  } catch (err) {
    console.error("Fel vid borttagning av bok:", err);
    res.status(500).send("Ett fel uppstod vid borttagning av bok.");
  }
});

// ==========================================
// Uppgift 4: Genre routes
// ==========================================

// GET /api/genres - Get all genres
app.get("/api/genres", async (req, res) => {
  try {
    if (!Genre) {
      return res.status(503).json({ message: "Genre-modellen är inte tillgänglig. Skapa modellen i models.js först." });
    }
    const genres = await Genre.findAll();
    if (genres.length === 0) {
      return res.status(404).json({ message: "Inga genrer hittades" });
    }
    res.json(genres);
  } catch (err) {
    console.error("Fel vid hämtning av genrer:", err);
    res.status(500).send("Ett fel uppstod vid hämtning av genrer.");
  }
});

// POST /api/genres - Create a new genre
app.post("/api/genres", async (req, res) => {
  try {
    if (!Genre) {
      return res.status(503).json({ message: "Genre-modellen är inte tillgänglig. Skapa modellen i models.js först." });
    }
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "name krävs" });
    }
    
    const newGenre = await Genre.create({ name });
    res.status(201).json(newGenre);
  } catch (err) {
    console.error("Fel vid tillägg av genre:", err);
    res.status(500).send("Ett fel uppstod vid tillägg av genre.");
  }
});

// GET /api/genres/:id - Get a specific genre
app.get("/api/genres/:id", async (req, res) => {
  try {
    if (!Genre) {
      return res.status(503).json({ message: "Genre-modellen är inte tillgänglig. Skapa modellen i models.js först." });
    }
    const { id } = req.params;
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      return res.status(404).json({ message: "Genre hittades inte" });
    }
    
    res.json(genre);
  } catch (err) {
    console.error("Fel vid hämtning av genre:", err);
    res.status(500).send("Ett fel uppstod.");
  }
});

// ==========================================
// Uppgift 4: Book_Genre routes (Many-to-Many)
// ==========================================

// POST /api/books/:bookId/genres/:genreId - Add a genre to a book
app.post("/api/books/:bookId/genres/:genreId", async (req, res) => {
  try {
    if (!Genre || !Book_Genre) {
      return res.status(503).json({ message: "Genre eller Book_Genre-modellerna är inte tillgängliga. Skapa modellerna i models.js först." });
    }
    const { bookId, genreId } = req.params;
    
    // Check if book and genre exist
    const book = await Book.findByPk(bookId);
    const genre = await Genre.findByPk(genreId);
    
    if (!book) {
      return res.status(404).json({ message: "Bok hittades inte" });
    }
    if (!genre) {
      return res.status(404).json({ message: "Genre hittades inte" });
    }
    
    // Check if relationship already exists
    const existing = await Book_Genre.findOne({
      where: { book_id: bookId, genre_id: genreId }
    });
    
    if (existing) {
      return res.status(400).json({ message: "Genren är redan kopplad till boken" });
    }
    
    const bookGenre = await Book_Genre.create({
      book_id: bookId,
      genre_id: genreId
    });
    
    res.status(201).json({
      message: "Genre kopplad till bok",
      book_genre: bookGenre
    });
  } catch (err) {
    console.error("Fel vid koppling av genre till bok:", err);
    res.status(500).send("Ett fel uppstod vid koppling av genre till bok.");
  }
});

// GET /api/books/:bookId/genres - Get all genres for a book
app.get("/api/books/:bookId/genres", async (req, res) => {
  try {
    if (!Genre || !Book_Genre) {
      return res.status(503).json({ message: "Genre eller Book_Genre-modellerna är inte tillgängliga. Skapa modellerna i models.js först." });
    }
    const { bookId } = req.params;
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Bok hittades inte" });
    }
    
    const bookGenres = await Book_Genre.findAll({
      where: { book_id: bookId },
      include: Genre
    });
    
    res.json(bookGenres);
  } catch (err) {
    console.error("Fel vid hämtning av genrer för bok:", err);
    res.status(500).send("Ett fel uppstod.");
  }
});

// DELETE /api/books/:bookId/genres/:genreId - Remove a genre from a book
app.delete("/api/books/:bookId/genres/:genreId", async (req, res) => {
  try {
    if (!Book_Genre) {
      return res.status(503).json({ message: "Book_Genre-modellen är inte tillgänglig. Skapa modellen i models.js först." });
    }
    const { bookId, genreId } = req.params;
    
    const bookGenre = await Book_Genre.findOne({
      where: { book_id: bookId, genre_id: genreId }
    });
    
    if (!bookGenre) {
      return res.status(404).json({ message: "Koppling hittades inte" });
    }
    
    await Book_Genre.destroy({
      where: { book_id: bookId, genre_id: genreId }
    });
    
    res.json({ message: "Genre togs bort från bok" });
  } catch (err) {
    console.error("Fel vid borttagning av genre från bok:", err);
    res.status(500).send("Ett fel uppstod vid borttagning av genre från bok.");
  }
});

// ==========================================
// Student routes (separate route file)
// ==========================================
app.use("/api/students", studentRoutes);

// Starta servern
app.listen(PORT, () => {
  console.log(`🚀 Server körs på http://localhost:${PORT}`);
});

