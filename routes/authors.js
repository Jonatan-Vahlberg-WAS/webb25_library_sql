const { Router } = require('express')
const queries = require('../sql/queries')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const authors = await pool.query(queries.authors.getAllAuthors)
        return res.json(authors.rows)
    } catch (err) {
        console.error("Cannot fetch users: ", err)
        return res.status(500).json({
            message: "Cannot fetch users"
        })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const author = await pool.query(queries.authors.getAuthor, [id])
        if(author.rowCount === 0) {
            return res.status(404).json({
                message: "Author does not exist"
            })
        }   
        return res.json(author.rows[0])
    } catch (err) {
        console.error("Cannot fetch user: ", err)
        return res.status(500).json({
            message: "Cannot fetch user"
        })
    }
})

router.post('/', async (req, res) => {
    const { name, year_of_birth } = req.body
    try {
        const author = await pool.query(queries.authors.createAuthor, [name, year_of_birth])
        return res.status(201).json(author.rows[0])
    } catch (err) {
        console.error("Cannot create author: ", err)
        return res.status(500).json({
            message: "Cannot create author"
        })
    }
})

module.exports = router