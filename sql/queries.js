const authorQueries = require('./authorQueries')
const bookQueries = require('./bookQueries')
const bookQueriesV2 = require('./bookQueriesV2')
module.exports = {
    authors: authorQueries,
    books: {
        ...bookQueries,
        v2: bookQueriesV2
    }
}