
const bookQueries = {
    getBooks: "SELECT * FROM BOOK;",
    getBooksWithSearch: (query) => `SELECT * FROM BOOK WHERE name ILIKE '%${query}%'`,
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
    `,
    createBook: "INSERT INTO book (name, price, stock, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
    updateBook: "UPDATE book SET name = $1, price = $2, stock = $3, author_id = $4 WHERE id = $5 RETURNING *",
    deleteBook: "DELETE FROM book WHERE id = $1;"
}

module.exports = bookQueries