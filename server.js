const Express = require("express");
const pg = require("pg");

const queries = require("./sql/queries");

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "library_v6",
  password: "postgres",
  port: 5432,
});

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    return console.error("Error connecting to server:", err.stack);
  }

  console.log(result.rows);
});

const PORT = 3000;
const app = Express();
app.use(Express.json());

app.get("/home/", (req, res) => {
  return res.json({
    message: "Hello world",
  });
});

app.get("/api/authors/", async (req, res) => {
  try {
    const authors = await pool.query(queries.authors.getAllAuthors);

    return res.json(authors.rows);
  } catch (err) {
    console.error("Cannot fetch users: ", err);
    return res.status(500).json({
      message: "Cannot fetch authors",
    });
  }
});

app.get("/api/authors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const authorResponse = await pool.query(queries.authors.getAuthor, [id]);
    if (authorResponse.rowCount === 0) {
      return res.status(404).json({
        message: "Author does not exist",
      });
    }
    const author = authorResponse.rows[0];
    return res.json(author);
  } catch (err) {
    console.error("Cannot fetch users: ", err);
    return res.status(500).json({
      message: "Cannot fetch author",
    });
  }
});

app.post("/api/authors/", async (req, res) => {
  const { name, year_of_birth } = req.body;

  if (!name || !year_of_birth) {
    return res.status(400).json({ message: "Incrorrect author object" });
  }

  try {
    const author = await pool.query(
      queries.authors.createAuthor,
      [name, year_of_birth],
    );

    return res.status(201).json(author.rows?.[0]);
  } catch (err) {
    console.error("Cannot create author: ", err);
    return res.status(500).json({
      message: "Cannot create author",
    });
  }
});

app.get("/api/books/search", async (req, res) => {
    const {q} = req.query
    console.log(q)
  try {
    if(q && q.length >= 3) {
        console.log("Q is valid")
        const filteredBooks = await pool.query(
            queries.books.getBooksWithSearch(q)
        );
        return res.json(filteredBooks.rows)
    }
    const books = await pool.query(queries.books.getBooks);
    return res.json(books.rows);
  } catch (err) {
    console.error("Cannot fetch users: ", err);
    return res.status(500).json({
      message: "Cannot fetch books",
    });
  }
});

app.listen(PORT, () => {
  console.log("App listening on port: ", PORT);
});
