const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel'); // Use the correct import (remove duplicate)
const Book = require('../models/booksModel');
const {
  signinSchema,
  acceptCodeSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
  addToWishlistSchema,
  removeFromWishlistSchema,
  updateProfileSchema,
} = require('../middlewares/validator');
const { doHash, doHashValidation, hmacProcess } = require('../utils/hashing');
const transport = require('../middlewares/sendMail');

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = signupSchema.validate({ email, password });
    if (error) {
      console.log('Validation error:', error.details[0].message); // Add this log
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await doHash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Your account has been created successfully',
      result: user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// Rest of the file remains unchanged
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signinSchema.validate({ email, password });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select('+password');
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: 'User does not exists!' });
    }
    const result = await doHashValidation(password, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials!' });
    }
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: '8h',
      }
    );

    res
      .cookie('Authorization', 'Bearer ' + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        success: true,
        token,
        message: 'logged in successfully',
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.signout = async (req, res) => {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'logged out successfully' });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exists!' });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: 'You are already verified!' });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: 'verification code',
      html: '<h1>' + codeValue + '</h1>',
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Code sent!' });
    }
    res.status(400).json({ success: false, message: 'Code sent failed!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      '+verificationCode +verificationCodeValidation'
    );

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exists!' });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: 'you are already verified!' });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'something is wrong with the code!' });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: 'code has been expired!' });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: 'your account has been verified!' });
    }
    return res
      .status(400)
      .json({ success: false, message: 'unexpected occurred!!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const { error, value } = changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: 'You are not verified user!' });
    }
    const existingUser = await User.findOne({ _id: userId }).select(
      '+password'
    );
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exists!' });
    }
    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials!' });
    }
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return res
      .status(200)
      .json({ success: true, message: 'Password updated!!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exists!' });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: 'Forgot password code',
      html: '<h1>' + codeValue + '</h1>',
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Code sent!' });
    }
    res.status(400).json({ success: false, message: 'Code sent failed!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error, value } = acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      '+forgotPasswordCode +forgotPasswordCodeValidation'
    );

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User does not exists!' });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'something is wrong with the code!' });
    }

    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'code has been expired!' });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: 'Password updated!!' });
    }
    return res
      .status(400)
      .json({ success: false, message: 'unexpected occurred!!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    if (id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const { bookId } = req.body;

    const { error } = addToWishlistSchema.validate({ bookId });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ success: false, message: 'Book already in wishlist' });
    }

    user.wishlist.push(bookId);
    await user.save();

    res.status(200).json({ success: true, message: 'Book added to wishlist' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { id, bookId } = req.params;
    const { userId } = req.user;
    if (id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { error } = removeFromWishlistSchema.validate({ bookId });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bookIndex = user.wishlist.indexOf(bookId);
    if (bookIndex === -1) {
      return res.status(400).json({ success: false, message: 'Book not in wishlist' });
    }

    user.wishlist.splice(bookIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: 'Book removed from wishlist' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Wishlist retrieved', data: user.wishlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    if (id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const { email, username } = req.body;

    const { error } = updateProfileSchema.validate({ email, username });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    if (username) {
      user.username = username;
    }

    await user.save();

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User retrieved', data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    if (id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};