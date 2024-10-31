const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
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
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationExpiry: {
    type: Date,
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },
  rejectionNote: {
    type: String,
  },
});

// Prevent anyone from selecting 'admin' role when creating a new user
UserSchema.pre('save', function (next) {
  if (this.role === 'admin' && !this.isModified('role')) {
    return next(new Error('Cannot create a user with admin role through this method'));
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
