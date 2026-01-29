const authorQueries = require('./authorQueries')
const bookQueries = require('./bookQueries')
const bookQueriesV2 = require('./bookQueriesV2')

const queries = {
    authors: authorQueries,
    books: {
        ...bookQueries,
        v2: bookQueriesV2
    }
}

module.exports = queries