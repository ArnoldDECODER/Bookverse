const express = require('express');
const booksController = require('../controllers/booksControllers');
const { identifier } = require('../middlewares/identification');
const router = express.Router();

router.get('/all-books', booksController.getBooks);
router.get('/single-book', booksController.singleBook);
router.post('/create-book', identifier, booksController.createBook);
router.put('/update-book', identifier, booksController.updateBook);
router.delete('/delete-book', identifier, booksController.deleteBook);

module.exports = router;