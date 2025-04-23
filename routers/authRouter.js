console.log('authRouter loaded');
const express = require('express');
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');
const router = express.Router();

console.log('Defining signup route');
router.post('/', (req, res, next) => {
  console.log('Signup route hit');
  authController.signup(req, res, next);
});
router.post('/signin', authController.signin);
router.post('/signout', identifier, authController.signout);

router.post(
  '/send-verification-code',
  identifier,
  authController.sendVerificationCode
);
router.post(
  '/verify-verification-code',
  identifier,
  authController.verifyVerificationCode
);
router.post('/change-password', identifier, authController.changePassword);
router.post(
  '/send-forgot-password-code',
  authController.sendForgotPasswordCode
);
router.post(
  '/verify-forgot-password-code',
  authController.verifyForgotPasswordCode
);

// Wishlist routes
router.post('/:id/wishlist', identifier, authController.addToWishlist);
router.delete('/:id/wishlist/:bookId', identifier, authController.removeFromWishlist);
router.get('/wishlist', identifier, authController.getWishlist);

// User update route
router.put('/:id', identifier, authController.updateProfile);
//retrieve user details by ID
router.get('/:id', identifier, authController.getUserById);
//delete a user by ID
router.delete('/:id', identifier, authController.deleteUser);
console.log('Registered auth routes:', router.stack.map(layer => ({
	path: layer.route?.path,
	methods: layer.route?.methods
  })));
module.exports = router;