const mongoose = require('mongoose');

const foodTruckSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    schedule: [{ day: String, hours: String }],
    foodTypes: [{ type: String }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' }
    },
    menuLink: { type: String }
});

const FoodTruck = mongoose.model('FoodTruck', foodTruckSchema);
module.exports = FoodTruck;
