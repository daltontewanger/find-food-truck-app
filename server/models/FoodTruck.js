const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

const FoodTruckSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: '', 
  },
  description: {
    type: String,
    default: '',
  },
  foodType: {
    type: [String],
    default: [],
  },
  menuLink: {
    type: String,
    default: '',
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending',
  },
  schedules: {
    type: [ScheduleSchema],
    default: [], // Default empty schedule
  },
});

module.exports = mongoose.model('FoodTruck', FoodTruckSchema);