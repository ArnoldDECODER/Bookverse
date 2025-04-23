# Bookverse

## Overview
Bookverse is a Node.js/Express application designed for book enthusiasts to manage their reading lists, wishlists, and user accounts. It provides features for user authentication, profile management, and book-related functionalities, with a MongoDB backend for data storage.

## Features

### User Authentication:
- Sign up with email and password.
- Sign in and sign out securely using JWT tokens.
- Email verification with a code sent via email.
- Password management (change password, forgot password with verification code).

### Wishlist Management:
- Add books to a wishlist.
- Remove books from a wishlist.
- View your wishlist with book details.

### User Profile Management:
- Update user profile (email, username).
- Retrieve user details by ID.
- Delete user account.

### Book Management (assumed based on file structure):
- Create, read, update, and delete books (CRUD operations).
- Filter books by genre, author, or other criteria (to be confirmed).

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB (using Mongoose)
- **Authentication:** JSON Web Tokens (JWT), bcrypt for password hashing
- **Validation:** Joi for request validation
- **Email Service:** Nodemailer for sending verification codes
- **Environment Variables:** Managed via `.env` file

## Setup Instructions

### Clone the Repository:
```bash
git clone https://github.com/ArnoldDECODER/Bookverse.git
cd Bookverse
```

### Install Dependencies:
```bash
npm install
```

### Set Up Environment Variables:

Create a `.env` file in the root directory and add the following variables:
```
PORT=8000
MONGO_URI=mongodb://localhost:27017/bookverse
JWT_SECRET=your_jwt_secret
TOKEN_SECRET=your_token_secret
HMAC_VERIFICATION_CODE_SECRET=your_hmac_secret
NODE_CODE_SENDING_EMAIL_ADDRESS=your_email@example.com
NODE_ENV=development
```

### Run MongoDB:
Ensure MongoDB is running on your machine (e.g., `mongod`).

### Start the Server:
```bash
node index.js
```

Server will run on [http://localhost:8000](http://localhost:8000).

## API Endpoints

### User Authentication:
- `POST /api/users`: Sign up a new user
- `POST /api/users/signin`: Sign in a user
- `POST /api/users/signout`: Sign out a user
- `POST /api/users/send-verification-code`: Send a verification code
- `POST /api/users/verify-verification-code`: Verify the email code
- `POST /api/users/change-password`: Change user password
- `POST /api/users/send-forgot-password-code`: Send forgot password code
- `POST /api/users/verify-forgot-password-code`: Verify forgot password code and reset

### Wishlist:
- `POST /api/users/:id/wishlist`: Add book to wishlist
- `DELETE /api/users/:id/wishlist/:bookId`: Remove book from wishlist
- `GET /api/users/wishlist`: View wishlist

### User Profile:
- `PUT /api/users/:id`: Update user
- `GET /api/users/:id`: Get user by ID
- `DELETE /api/users/:id`: Delete user

### Books:
- `POST /api/books`: Create a book
- `GET /api/books`: Get all books

## Testing with Postman

Ensure the server is running on [http://localhost:8000](http://localhost:8000).

### 1. Sign Up
**POST** `/api/users`
```json
{
  "email": "testuser@example.com",
  "password": "Testpass123"
}
```
**Response**: 201 Created
```json
{
  "success": true,
  "message": "Your account has been created successfully",
  "result": { ... },
  "token": "..."
}
```

### 2. Sign In
**POST** `/api/users/signin`
```json
{
  "email": "testuser@example.com",
  "password": "Testpass123"
}
```
**Response**: 200 OK
```json
{
  "success": true,
  "token": "...",
  "message": "logged in successfully"
}
```

### 3. Sign Out
**POST** `/api/users/signout`
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "logged out successfully"
}
```

### 4. Send Verification Code
**POST** `/api/users/send-verification-code`
```json
{
  "email": "testuser@example.com"
}
```
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Code sent!"
}
```

### 5. Verify Verification Code
**POST** `/api/users/verify-verification-code`
```json
{
  "email": "testuser@example.com",
  "providedCode": 123456
}
```
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "your account has been verified!"
}
```

### 6. Change Password
**POST** `/api/users/change-password`
```json
{
  "oldPassword": "Testpass123",
  "newPassword": "Newpass123"
}
```
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Password updated!!"
}
```

### 7. Send Forgot Password Code
**POST** `/api/users/send-forgot-password-code`
```json
{
  "email": "testuser@example.com"
}
```
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Code sent!"
}
```

### 8. Verify Forgot Password Code
**POST** `/api/users/verify-forgot-password-code`
```json
{
  "email": "testuser@example.com",
  "providedCode": 123456,
  "newPassword": "Newpass123"
}
```
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Password updated!!"
}
```

### Wishlist

#### Add to Wishlist
**POST** `/api/users/:id/wishlist`
```json
{
  "bookId": "664d8f9b2e5f4a1b2c3d4e60"
}
```
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book added to wishlist"
}
```

#### Remove from Wishlist
**DELETE** `/api/users/:id/wishlist/:bookId`
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Book removed from wishlist"
}
```

#### Get Wishlist
**GET** `/api/users/wishlist`
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Wishlist retrieved",
  "data": [
    {
      "_id": "...",
      "title": "Sample Book",
      "author": "John Doe",
      "description": "A sample book description",
      "price": 29.99,
      "stockQuantity": 10
    }
  ]
}
```

### User Profile

#### Update User
**PUT** `/api/users/:id`
```json
{
  "email": "newemail@example.com",
  "username": "newusername"
}
```
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

#### Get User
**GET** `/api/users/:id`
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "User retrieved",
  "data": { ... }
}
```

#### Delete User
**DELETE** `/api/users/:id`
**Headers**: `Authorization: Bearer <token>`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "User deleted"
}
```

### Books

#### Create Book
**POST** `/api/books`
```json
{
  "title": "Sample Book",
  "description": "A sample book description",
  "userId": "...",
  "author": "John Doe",
  "ISBN": "1234567890",
  "genre": "Fiction",
  "price": 29.99,
  "stockQuantity": 10
}
```
**Headers**: `Authorization: Bearer <token>`
**Response**: 201 Created
```json
{
  "success": true,
  "message": "Book created",
  "data": { ... }
}
```

#### Get All Books
**GET** `/api/books`
**Response**: 200 OK
```json
{
  "success": true,
  "message": "Books retrieved",
  "data": [ ... ]
}
```

---

Feel free to fork this repo and contribute via pull requests. Happy coding!

