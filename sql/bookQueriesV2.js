const bookQueries = require("./bookQueries");

const bookQueriesV2 = {
    _withAuthor: `
    json_build_object(
        'id', a.id,
        'name', a.name,
        'year_of_birth', a.year_of_birth
    ) as author
    `,
    _joinAuthor: `
    INNER JOIN author as a on b.author_id = a.id`,
    getBooks: `SELECT * FROM BOOK;`,
    getBooksWithAuthor: `
        SELECT 
            b.id,
            b.name,
            b.price,
            b.stock,
            ${bookQueriesV2._withAuthor}
        FROM book as b
        ${bookQueriesV2._joinAuthor}`,
    getBookWithAuthor: `
        ${bookQueries.getBooksWithAuthor}
        WHERE b.id = $1
    `,
}

module.exports = bookQueriesV2