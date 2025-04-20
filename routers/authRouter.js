console.log('authRouter loaded');
const express = require('express');
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');
const router = express.Router();

console.log('Defining signup route');
router.post('/signup', (req, res, next) => {
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
router.post('/wishlist/add', identifier, authController.addToWishlist);
router.delete('/wishlist/remove/:bookId', identifier, authController.removeFromWishlist);
router.get('/wishlist', identifier, authController.getWishlist);

// User update route
router.patch('/update-profile', identifier, authController.updateProfile);

module.exports = router;