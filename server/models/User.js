const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'business', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: function () {
      return this.role === 'business';
    },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
});

// Prevent anyone from selecting 'admin' role when creating a new user
UserSchema.pre('save', function (next) {
  if (this.role === 'admin' && !this.isModified('role')) {
    return next(new Error('Cannot create a user with admin role through this method'));
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
