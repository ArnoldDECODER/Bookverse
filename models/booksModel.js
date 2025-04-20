const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required!'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'description is required!'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      type: String,
      trim: true,
    },
    ISBN: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
    },
    stockQuantity: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);