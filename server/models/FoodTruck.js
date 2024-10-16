const mongoose = require('mongoose');
const ScheduleSchema = new mongoose.Schema({
  address: String,
  latitude: Number,
  longitude: Number,
  day: String,
  startTime: String,
  endTime: String,
});

const FoodTruckSchema = new mongoose.Schema({
  name: String,
  description: String,
  foodType: String,
  menuLink: String,
  schedules: [ScheduleSchema],
});

module.exports = mongoose.model('FoodTruck', FoodTruckSchema);