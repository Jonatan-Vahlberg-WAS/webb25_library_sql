const _abstracts = {
    _joinAuthor: `
    INNER JOIN author as a on b.author_id = a.id`,
    _joinGenres: `
    INNER JOIN book_genre as bg on bg.book_id = b.id
    INNER JOIN genre as g on g.id = bg.genre_id`,
    _withAuthor: `
    json_build_object(
        'id', a.id,
        'name', a.name,
        'year_of_birth', a.year_of_birth
    ) as author
    `,
    _withGenres: `
    json_agg(
        json_build_object(
            'id', g.id,
            'name', g.name
        )
    ) as genres
    `,
    _groupByBookAndAuthor: `
    GROUP BY b.id, a.id
    `,
}

const bookQueriesV2 = {
    getBooks: `SELECT * FROM BOOK;`,
    getBooksWithAuthor: `
        SELECT 
            b.id,
            b.name,
            b.price,
            b.stock,
            ${_abstracts._withAuthor}
        FROM book as b
        ${_abstracts._joinAuthor}`,
    getBooksWithAuthorAndGenres: `
        SELECT 
            b.id,
            b.name,
            b.price,
            b.stock,
            ${_abstracts._withAuthor},
            ${_abstracts._withGenres}
        FROM book as b
        ${_abstracts._joinAuthor} ${_abstracts._joinGenres}
        ${_abstracts._groupByBookAndAuthor}`,
    getBookWithAuthor: `
        SELECT 
            b.id,
            b.name,
            b.price,
            b.stock,
            ${_abstracts._withAuthor}
        FROM book as b
        ${_abstracts._joinAuthor}
        WHERE b.id = $1
    `,
    getBookWithAuthorAndGenres: `
        SELECT 
            b.id,
            b.name,
            b.price,
            b.stock,
            ${_abstracts._withAuthor},
            ${_abstracts._withGenres}
        FROM book as b
        ${_abstracts._joinAuthor} ${_abstracts._joinGenres}
        ${_abstracts._groupByBookAndAuthor}
        WHERE b.id = $1
    `,
}

module.exports = bookQueriesV2