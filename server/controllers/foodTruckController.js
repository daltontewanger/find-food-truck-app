const FoodTruck = require('../models/FoodTruck');
const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
});

// Add a new food truck
exports.addFoodTruck = async (req, res) => {
  const { name, address, description, foodType, schedule } = req.body;
  try {
    const geocodeResult = await geocoder.geocode(address);
    if (!geocodeResult.length) {
      return res.status(400).json({ message: 'Invalid address' });
    }
    const { latitude, longitude } = geocodeResult[0];

    const newFoodTruck = new FoodTruck({
      name,
      latitude,
      longitude,
      address,
      description,
      foodType,
      schedule,
      owner: req.user.id,
    });
    await newFoodTruck.save();
    res.status(201).json(newFoodTruck);
  } catch (error) {
    console.error('Error adding food truck:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update food truck info
exports.updateFoodTruck = async (req, res) => {
  const { id } = req.params;
  const { name, address, description, foodType, schedule } = req.body;
  try {
    const foodTruck = await FoodTruck.findById(id);
    if (!foodTruck) {
      return res.status(404).json({ message: 'Food truck not found' });
    }

    if (address) {
      const geocodeResult = await geocoder.geocode(address);
      if (!geocodeResult.length) {
        return res.status(400).json({ message: 'Invalid address' });
      }
      foodTruck.latitude = geocodeResult[0].latitude;
      foodTruck.longitude = geocodeResult[0].longitude;
      foodTruck.address = address;
    }

    // Update other fields
    foodTruck.name = name || foodTruck.name;
    foodTruck.description = description || foodTruck.description;
    foodTruck.foodType = foodType || foodTruck.foodType;
    foodTruck.schedule = schedule || foodTruck.schedule;

    await foodTruck.save();
    res.status(200).json(foodTruck);
  } catch (error) {
    console.error('Error updating food truck:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all food trucks
exports.getFoodTrucks = async (req, res) => {
  try {
    const foodTrucks = await FoodTruck.find();
    res.status(200).json(foodTrucks);
  } catch (error) {
    console.error('Error fetching food trucks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
