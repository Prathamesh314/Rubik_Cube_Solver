import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  bestTime: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  // Additional fields for game statistics
  totalSolves: {
    type: Number,
    default: 0
  },
  averageTime: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Prevent model overwrite in Next.js hot-reload
export default models.User || model('User', UserSchema);