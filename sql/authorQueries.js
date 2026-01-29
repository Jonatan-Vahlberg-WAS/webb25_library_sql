
const authorQueries = {
    getAllAuthors: `SELECT * FROM author`,
    getAuthor: "SELECT * from author where id = $1",
    createAuthor: "INSERT INTO author (name, year_of_birth) VALUES ($1, $2) RETURNING *"
}

module.exports = authorQueries