const { createBookSchema } = require('../middlewares/validator');
const Book = require('../models/booksModel');

exports.getBooks = async (req, res) => {
  const { page } = req.query;
  const booksPerPage = 10;

  try {
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0;
    } else {
      pageNum = page - 1;
    }
    const result = await Book.find()
      .sort({ createdAt: -1 })
      .skip(pageNum * booksPerPage)
      .limit(booksPerPage)
      .populate({
        path: 'userId',
        select: 'email',
      });
    res.status(200).json({ success: true, message: 'books', data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.singleBook = async (req, res) => {
  const { _id } = req.query;

  try {
    const existingBook = await Book.findOne({ _id }).populate({
      path: 'userId',
      select: 'email',
    });
    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: 'Book unavailable' });
    }
    res
      .status(200)
      .json({ success: true, message: 'single book', data: existingBook });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBook = async (req, res) => {
  const { title, description, author, ISBN, genre, price, stockQuantity } = req.body;
  const { userId } = req.user;
  try {
    const { error, value } = createBookSchema.validate({
      title,
      description,
      userId,
      author,
      ISBN,
      genre,
      price,
      stockQuantity,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const result = await Book.create({
      title,
      description,
      userId,
      author,
      ISBN,
      genre,
      price,
      stockQuantity,
    });
    res.status(201).json({ success: true, message: 'created', data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBook = async (req, res) => {
  const { _id } = req.query;
  const { title, description, author, ISBN, genre, price, stockQuantity } = req.body;
  const { userId } = req.user;
  try {
    const { error, value } = createBookSchema.validate({
      title,
      description,
      userId,
      author,
      ISBN,
      genre,
      price,
      stockQuantity,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const existingBook = await Book.findOne({ _id });
    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: 'Book unavailable' });
    }
    if (existingBook.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    existingBook.title = title;
    existingBook.description = description;
    existingBook.author = author;
    existingBook.ISBN = ISBN;
    existingBook.genre = genre;
    existingBook.price = price;
    existingBook.stockQuantity = stockQuantity;

    const result = await existingBook.save();
    res.status(200).json({ success: true, message: 'Updated', data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBook = async (req, res) => {
  const { _id } = req.query;
  const { userId } = req.user;
  try {
    const existingBook = await Book.findOne({ _id });
    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: 'Book already unavailable' });
    }
    if (existingBook.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Book.deleteOne({ _id });
    res.status(200).json({ success: true, message: 'deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};