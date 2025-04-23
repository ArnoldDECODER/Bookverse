console.log('booksRouter loaded');
const express = require('express');
const booksController = require('../controllers/booksControllers');
const { identifier } = require('../middlewares/identification');
const router = express.Router();

router.get('/', booksController.getBooks);
router.get('/:id', booksController.singleBook);
router.post('/', identifier, booksController.createBook);
router.put('/:id', identifier, booksController.updateBook);
router.delete('/:id', identifier, booksController.deleteBook);

module.exports = router;