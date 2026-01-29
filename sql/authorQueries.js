
const authorQueries = {
    getAllAuthors: `SELECT * FROM author`,
    getAuthor: "SELECT * from author where id = $1",
    createAuthor: "INSERT INTO author (name, year_of_birth) VALUES ($1, $2) RETURNING *",
    updateAuthor: "UPDATE author SET name = $1, year_of_birth = $2 WHERE id = $3 RETURNING *",
    deleteAuthor: "DELETE FROM author WHERE id = $1;"
}

module.exports = authorQueries