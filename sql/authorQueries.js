
const authorQueries = {
    getAllAuthors: `SELECT * FROM author`,
    getAuthor: "SELECT * from author where id = $1"
}

module.exports = authorQueries