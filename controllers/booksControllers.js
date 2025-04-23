const { createBookSchema } = require('../middlewares/validator');
const Book = require('../models/booksModel');

exports.getBooks = async (req, res) => {
	const { page, title, author, genre } = req.query;
	const booksPerPage = 10;
  
	try {
	  let pageNum = 0;
	  if (page <= 1) {
		pageNum = 0;
	  } else {
		pageNum = page - 1;
	  }
  
	  const query = {};
	  if (title) query.title = { $regex: title, $options: 'i' };
	  if (author) query.author = { $regex: author, $options: 'i' };
	  if (genre) query.genre = { $regex: genre, $options: 'i' };
  
	  const result = await Book.find(query)
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
	const { id } = req.params;
  
	try {
    const existingBook = await Book.findOne({ _id: new mongoose.Types.ObjectId(id) }).populate({
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
	const { id } = req.params;
	const { userId } = req.user;
	const { title, description, author, ISBN, genre, price, stockQuantity } = req.body;
  
	try {
	  const existingBook = await Book.findOne({ _id: new mongoose.Types.ObjectId(id) });
	  if (!existingBook) {
		return res.status(404).json({ success: false, message: 'Book not found' });
	  }
	  if (existingBook.userId.toString() !== userId) {
		return res.status(403).json({ success: false, message: 'Unauthorized' });
	  }
  
	  existingBook.title = title || existingBook.title;
	  existingBook.description = description || existingBook.description;
	  existingBook.author = author || existingBook.author;
	  existingBook.ISBN = ISBN || existingBook.ISBN;
	  existingBook.genre = genre || existingBook.genre;
	  existingBook.price = price || existingBook.price;
	  existingBook.stockQuantity = stockQuantity || existingBook.stockQuantity;
  
	  await existingBook.save();
	  res.status(200).json({ success: true, message: 'Updated', data: existingBook });
	} catch (error) {
	  console.log(error);
	  res.status(500).json({ success: false, message: 'Server error' });
	}
};

exports.deleteBook = async (req, res) => {
	const { id } = req.params;
	const { userId } = req.user;
  try {
	const existingBook = await Book.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!existingBook) {
      return res
        .status(404)
        .json({ success: false, message: 'Book already unavailable' });
    }
    if (existingBook.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Book.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.status(200).json({ success: true, message: 'deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};