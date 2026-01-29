
const bookQueries = {
    getBooks: "SELECT * FROM BOOK;",
    getBooksWithAuthor: `SELECT 
        b.id,
        b.name,
        b.price,
        b.stock,
        json_build_object(
            'id', a.id,
            'name', a.name,
            'year_of_birth', a.year_of_birth
        ) as author
        FROM book as b
        INNER JOIN author as a on b.author_id = a.id;
    `
}

module.exports = bookQueries