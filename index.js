const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const authRouter = require('./routers/authRouter');
const booksRouter = require('./routers/booksRouter');

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Mongo URI:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connected');

    console.log('Mounting authRouter');
    app.use('/api/users', authRouter);
    console.log('Mounting booksRouter');
    app.use('/api/books', booksRouter);
    app.get('/', (req, res) => {
      res.json({ message: 'Hello from the server' });
    });

    // 404 Middleware
    app.use((req, res, next) => {
      console.log(`Route not found: ${req.method} ${req.url}`);
      res.status(404).json({
        success: false,
        message: 'Route not found',
        method: req.method,
        path: req.url,
      });
    });

    // Error Middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      const statusCode = err.status || 500;
      const message = err.message || 'Something went wrong!';
      
      // In development, include the stack trace for debugging
      if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
          success: false,
          message,
          stack: err.stack,
        });
      } else {
        // In production, hide the stack trace for security
        res.status(statusCode).json({
          success: false,
          message,
        });
      }
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log('listening...');
    });
  })
  .catch((err) => {
    console.log('Database connection error:', err);
    process.exit(1); // Exit the process if the database connection fails
  });