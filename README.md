Bookverse
Overview
Bookverse is a Node.js/Express application designed for book enthusiasts to manage their reading lists, wishlists, and user accounts. It provides features for user authentication, profile management, and book-related functionalities, with a MongoDB backend for data storage.
Features

User Authentication:
Sign up with email and password.
Sign in and sign out securely using JWT tokens.
Email verification with a code sent via email.
Password management (change password, forgot password with verification code).


Wishlist Management:
Add books to a wishlist.
Remove books from a wishlist.
View your wishlist with book details.


User Profile Management:
Update user profile (email, username).
Retrieve user details by ID.
Delete user account.


Book Management (assumed based on file structure):
Create, read, update, and delete books (CRUD operations).
Filter books by genre, author, or other criteria (to be confirmed).



Tech Stack

Backend: Node.js, Express
Database: MongoDB (using Mongoose)
Authentication: JSON Web Tokens (JWT), bcrypt for password hashing
Validation: Joi for request validation
Email Service: Nodemailer for sending verification codes
Environment Variables: Managed via .env file

Setup Instructions

Clone the Repository:
git clone https://github.com/ArnoldDECODER/Bookverse.git
cd Bookverse


Install Dependencies:
npm install


Set Up Environment Variables:

Create a .env file in the root directory.

Add the following variables (replace with your values):
PORT=8000
MONGO_URI=mongodb://localhost:27017/bookverse
JWT_SECRET=your_jwt_secret
TOKEN_SECRET=your_token_secret
HMAC_VERIFICATION_CODE_SECRET=your_hmac_secret
NODE_CODE_SENDING_EMAIL_ADDRESS=your_email@example.com
NODE_ENV=development




Run MongoDB:

Ensure MongoDB is running on your machine (e.g., mongod).


Start the Server:
node index.js

The server will run on http://localhost:8000.


API Endpoints

User Authentication:
POST /api/users: Sign up a new user.
POST /api/users/signin: Sign in a user.
POST /api/users/signout: Sign out a user (requires authentication).
POST /api/users/send-verification-code: Send a verification code to the user’s email (requires authentication).
POST /api/users/verify-verification-code: Verify the code to activate the account (requires authentication).
POST /api/users/change-password: Change the user’s password (requires authentication).
POST /api/users/send-forgot-password-code: Send a forgot password code.
POST /api/users/verify-forgot-password-code: Verify the code and reset the password.


Wishlist:
POST /api/users/:id/wishlist: Add a book to the wishlist (requires authentication).
DELETE /api/users/:id/wishlist/:bookId: Remove a book from the wishlist (requires authentication).
GET /api/users/wishlist: Get the user’s wishlist (requires authentication).


User Profile:
PUT /api/users/:id: Update user profile (requires authentication).
GET /api/users/:id: Retrieve user details by ID (requires authentication).
DELETE /api/users/:id: Delete a user by ID (requires authentication).


Books (assumed):
POST /api/books: Create a new book (to be confirmed).
GET /api/books: Get all books (to be confirmed).



Testing with Postman
Below are examples of how to test each API endpoint using Postman. Ensure the server is running (http://localhost:8000) and MongoDB is connected. For authenticated routes, you’ll need a JWT token, which you can obtain by signing in (POST /api/users/signin).
User Authentication
1. Sign Up (POST /api/users)

Method: POST

URL: http://localhost:8000/api/users

Headers:

Content-Type: application/json


Body (raw, JSON):
{
    "email": "testuser@example.com",
    "password": "Testpass123"
}


Expected Response:

Status: 201 Created

Body:
{
    "success": true,
    "message": "Your account has been created successfully",
    "result": {
        "_id": "664d8f9b2e5f4a1b2c3d4e5f",
        "email": "testuser@example.com",
        "verified": false,
        "wishlist": [],
        "createdAt": "2025-04-23T07:00:00.000Z",
        "updatedAt": "2025-04-23T07:00:00.000Z",
        "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}





2. Sign In (POST /api/users/signin)

Method: POST

URL: http://localhost:8000/api/users/signin

Headers:

Content-Type: application/json


Body (raw, JSON):
{
    "email": "testuser@example.com",
    "password": "Testpass123"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "logged in successfully"
}


Note: Save the token from the response for authenticated requests (e.g., add it as Authorization: Bearer <token> in the headers).




3. Sign Out (POST /api/users/signout)

Method: POST
URL: http://localhost:8000/api/users/signout
Headers:
Authorization: Bearer <token>


Body: None
Expected Response:
Status: 200 OK

Body:
{
    "success": true,
    "message": "logged out successfully"
}





4. Send Verification Code (POST /api/users/send-verification-code)

Method: POST

URL: http://localhost:8000/api/users/send-verification-code

Headers:

Authorization: Bearer <token>
Content-Type: application/json


Body (raw, JSON):
{
    "email": "testuser@example.com"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "Code sent!"
}


Note: Check the email for the verification code (requires a configured email service in .env).




5. Verify Verification Code (POST /api/users/verify-verification-code)

Method: POST

URL: http://localhost:8000/api/users/verify-verification-code

Headers:

Authorization: Bearer <token>
Content-Type: application/json


Body (raw, JSON):
{
    "email": "testuser@example.com",
    "providedCode": 123456
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "your account has been verified!"
}





6. Change Password (POST /api/users/change-password)

Method: POST

URL: http://localhost:8000/api/users/change-password

Headers:

Authorization: Bearer <token>
Content-Type: application/json


Body (raw, JSON):
{
    "oldPassword": "Testpass123",
    "newPassword": "Newpass123"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "Password updated!!"
}





7. Send Forgot Password Code (POST /api/users/send-forgot-password-code)

Method: POST

URL: http://localhost:8000/api/users/send-forgot-password-code

Headers:

Content-Type: application/json


Body (raw, JSON):
{
    "email": "testuser@example.com"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "Code sent!"
}





8. Verify Forgot Password Code (POST /api/users/verify-forgot-password-code)

Method: POST

URL: http://localhost:8000/api/users/verify-forgot-password-code

Headers:

Content-Type: application/json


Body (raw, JSON):
{
    "email": "testuser@example.com",
    "providedCode": 123456,
    "newPassword": "Newpass123"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "Password updated!!"
}





Wishlist
1. Add Book to Wishlist (POST /api/users/:id/wishlist)

Method: POST

URL: http://localhost:8000/api/users/664d8f9b2e5f4a1b2c3d4e5f/wishlist

Headers:

Authorization: Bearer <token>
Content-Type: application/json


Body (raw, JSON):
{
    "bookId": "664d8f9b2e5f4a1b2c3d4e60"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "Book added to wishlist"
}





2. Remove Book from Wishlist (DELETE /api/users/:id/wishlist/:bookId)

Method: DELETE
URL: http://localhost:8000/api/users/664d8f9b2e5f4a1b2c3d4e5f/wishlist/664d8f9b2e5f4a1b2c3d4e60
Headers:
Authorization: Bearer <token>


Body: None
Expected Response:
Status: 200 OK

Body:
{
    "success": true,
    "message": "Book removed from wishlist"
}





3. Get Wishlist (GET /api/users/wishlist)

Method: GET
URL: http://localhost:8000/api/users/wishlist
Headers:
Authorization: Bearer <token>


Body: None
Expected Response:
Status: 200 OK

Body:
{
    "success": true,
    "message": "Wishlist retrieved",
    "data": [
        {
            "_id": "664d8f9b2e5f4a1b2c3d4e60",
            "title": "Sample Book",
            "author": "John Doe",
            "description": "A sample book description",
            "price": 29.99,
            "stockQuantity": 10
        }
    ]
}





User Profile
1. Update User Profile (PUT /api/users/:id)

Method: PUT

URL: http://localhost:8000/api/users/664d8f9b2e5f4a1b2c3d4e5f

Headers:

Authorization: Bearer <token>
Content-Type: application/json


Body (raw, JSON):
{
    "email": "newemail@example.com",
    "username": "newusername"
}


Expected Response:

Status: 200 OK

Body:
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "_id": "664d8f9b2e5f4a1b2c3d4e5f",
        "email": "newemail@example.com",
        "username": "newusername",
        "verified": true,
        "wishlist": [],
        "createdAt": "2025-04-23T07:00:00.000Z",
        "updatedAt": "2025-04-23T07:00:00.000Z",
        "__v": 0
    }
}





2. Retrieve User Details (GET /api/users/:id)

Method: GET
URL: http://localhost:8000/api/users/664d8f9b2e5f4a1b2c3d4e5f
Headers:
Authorization: Bearer <token>


Body: None
Expected Response:
Status: 200 OK

Body:
{
    "success": true,
    "message": "User retrieved",
    "data": {
        "_id": "664d8f9b2e5f4a1b2c3d4e5f",
        "email": "newemail@example.com",
        "username": "newusername",
        "verified": true,
        "wishlist": [],
        "createdAt": "2025-04-23T07:00:00.000Z",
        "updatedAt": "2025-04-23T07:00:00.000Z",
        "__v": 0
    }
}





3. Delete User (DELETE /api/users/:id)

Method: DELETE
URL: http://localhost:8000/api/users/664d8f9b2e5f4a1b2c3d4e5f
Headers:
Authorization: Bearer <token>


Body: None
Expected Response:
Status: 200 OK

Body:
{
    "success": true,
    "message": "User deleted"
}





Books (Assumed)
1. Create a Book (POST /api/books)

Method: POST

URL: http://localhost:8000/api/books

Headers:

Authorization: Bearer <token> (if authentication is required)
Content-Type: application/json


Body (raw, JSON):
{
    "title": "Sample Book",
    "description": "A sample book description",
    "userId": "664d8f9b2e5f4a1b2c3d4e5f",
    "author": "John Doe",
    "ISBN": "1234567890",
    "genre": "Fiction",
    "price": 29.99,
    "stockQuantity": 10
}


Expected Response:

Status: 201 Created

Body (assumed based on createBookSchema in validator.js):
{
    "success": true,
    "message": "Book created successfully",
    "data": {
        "_id": "664d8f9b2e5f4a1b2c3d4e60",
        "title": "Sample Book",
        "description": "A sample book description",
        "userId": "664d8f9b2e5f4a1b2c3d4e5f",
        "author": "John Doe",
        "ISBN": "1234567890",
        "genre": "Fiction",
        "price": 29.99,
        "stockQuantity": 10,
        "createdAt": "2025-04-23T07:00:00.000Z",
        "updatedAt": "2025-04-23T07:00:00.000Z",
        "__v": 0
    }
}





2. Get All Books (GET /api/books)

Method: GET
URL: http://localhost:8000/api/books
Headers:
Authorization: Bearer <token> (if authentication is required)


Body: None
Expected Response:
Status: 200 OK

Body (assumed):
{
    "success": true,
    "message": "Books retrieved",
    "data": [
        {
            "_id": "664d8f9b2e5f4a1b2c3d4e60",
            "title": "Sample Book",
            "description": "A sample book description",
            "userId": "664d8f9b2e5f4a1b2c3d4e5f",
            "author": "John Doe",
            "ISBN": "1234567890",
            "genre": "Fiction",
            "price": 29.99,
            "stockQuantity": 10,
            "createdAt": "2025-04-23T07:00:00.000Z",
            "updatedAt": "2025-04-23T07:00:00.000Z",
            "__v": 0
        }
    ]
}





Recent Changes

April 2025:
Fixed 400 Bad Request in POST /api/users (In Progress):
Debugged validation issues in the signup endpoint.
Added debug logs to authController.js to identify the root cause of validation failures.
Working on resolving schema conflicts and ensuring proper response body display in Postman.


Git Workflow Improvements:
Excluded node_modules from the repository by updating .gitignore.
Resolved LF will be replaced by CRLF warnings by removing node_modules from Git tracking.
Fixed git push rejection by pulling remote changes and merging them locally.




Previous Updates (assumed based on project structure):
Added wishlist functionality for users to manage their favorite books.
Implemented email verification and forgot password workflows using Nodemailer.
Enhanced user profile management with update, retrieve, and delete operations.




.
