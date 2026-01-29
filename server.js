const Express = require('express')
const pg = require('pg')
const authorQueries = require('./sql/authorQueries')
const bookQueries = require('./sql/bookQueries')

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'library_v6',
    password: 'postgres',
    port: 5432,
})

pool.query("SELECT NOW()", (err, result) => {
    if(err) {
        return console.error("Error connecting to server:", err.stack)
    }

    console.log(result.rows)
})

const PORT = 3000;
const app = Express();

app.get("/home/", (req, res) => {
    return res.json({
        message: "Hello world" 
    })
})

app.get("/api/authors/", async (req, res) => {
    try {
        const authors = await pool.query(authorQueries.getAllAuthors)

        return res.json(authors.rows)
    } catch (err) {
        console.error("Cannot fetch users: ", err)
        return res.status(500).json({
            message: "Cannot fetch users"
        })
    }
})

app.get("/api/authors/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const authorResponse = await pool.query(authorQueries.getAuthor,[id])
        if(authorResponse.rowCount === 0) {
            return res.status(404).json({
                message: "Author does not exist"
            })
        }
        const author = authorResponse.rows[0]
        return res.json(author)
    } catch (err) {
        console.error("Cannot fetch users: ", err)
        return res.status(500).json({
            message: "Cannot fetch user"
        })
    }
})

app.listen(PORT, () => {
    console.log("App listening on port: ", PORT)
})


// const pg = require("pg");

// const pool = new pg.Pool({
//   user: "din-användare", // PostgreSQL-användare
//   host: "localhost",     // Värden där databasen körs
//   database: "library",   // Namn på din databas
//   password: "ditt-lösenord", // Ditt lösenord för databasen
//   port: 5432,            // Standardport för PostgreSQL
// });