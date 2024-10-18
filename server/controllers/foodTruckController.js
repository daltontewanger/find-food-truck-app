const FoodTruck = require('../models/FoodTruck');
const { geocodeAddress } = require('../utils/geocode');
const dayjs = require('dayjs');

exports.getFoodTrucks = async (req, res) => {
    try {
        const foodTrucks = await FoodTruck.find({ verificationStatus: 'verified' });
        res.status(200).json(foodTrucks);
    } catch (error) {
        console.error('Error fetching food trucks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOpenFoodTrucks = async (req, res) => {
    try {
        const now = dayjs();
        const currentDay = now.format('YYYY-MM-DD');
        const currentTime = now.format('HH:mm');

        console.log('Current Day:', currentDay);
        console.log('Current Time:', currentTime);

        const openTrucks = await FoodTruck.find({
            schedules: {
                $elemMatch: {
                    date: currentDay,
                    startTime: { $lte: currentTime },
                    endTime: { $gte: currentTime }
                }
            },
            verificationStatus: 'verified'
        });

        // Extract the relevant schedule information for each truck
        const trucksWithCoordinates = openTrucks.map((truck) => {
            const currentSchedule = truck.schedules.find((schedule) => {
                console.log('Checking Schedule Day:', schedule.date);
                console.log('Expected Current Day:', currentDay);
                return (
                    schedule.date === currentDay &&
                    schedule.startTime <= currentTime &&
                    schedule.endTime >= currentTime
                );
            });

            return currentSchedule
                ? {
                    id: truck._id,
                    name: truck.name,
                    description: truck.description,
                    foodType: truck.foodType,
                    menuLink: truck.menuLink,
                    latitude: currentSchedule.latitude,
                    longitude: currentSchedule.longitude,
                }
                : null;
        }).filter((truck) => truck !== null && truck.latitude !== undefined && truck.longitude !== undefined); // Filter out trucks without coordinates

        console.log('Trucks With Coordinates:', trucksWithCoordinates);

        res.status(200).json(trucksWithCoordinates);
    } catch (error) {
        console.error('Error fetching open food trucks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFoodTruckDetails = async (req, res) => {
    try {
        const { userId, role } = req.user;

        // Only allow business users to access their food truck details
        if (role !== 'business') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const foodTruck = await FoodTruck.findOne({ owner: userId });
        if (!foodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        res.status(200).json(foodTruck);
    } catch (error) {
        console.error('Error fetching food truck details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateDetails = async (req, res) => {
    const { role, verificationStatus, userId } = req.user;

    console.log('User Role:', role); // This should now print the correct role
    console.log('Verification Status:', verificationStatus);
    console.log('User ID:', userId);

    if (role !== 'business') {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    if (verificationStatus !== 'verified') {
        return res.status(403).json({ message: 'Business not verified. Please wait for admin approval.' });
    }

    try {
        const { name, description, foodType, menuLink } = req.body;
        const updatedFoodTruck = await FoodTruck.findOneAndUpdate(
            { owner: userId },
            { name, description, foodType, menuLink },
            { new: true }
        );

        res.status(200).json(updatedFoodTruck);
    } catch (error) {
        console.error('Error updating details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSchedule = async (req, res) => {
    const { role, verificationStatus } = req.user;
    if (role !== 'business') {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    if (verificationStatus !== 'verified') {
        return res.status(403).json({ message: 'Business not verified. Please wait for admin approval.' });
    }

    try {
        const schedules = req.body.schedule;
    
        // Validate and format the schedules
        const updatedSchedules = [];
    
        for (let schedule of schedules) {
          const { address, date, startTime, endTime } = schedule;
    
          if (!date || isNaN(Date.parse(day))) {
            return res.status(400).json({ message: 'Invalid day value provided' });
          }
    
          // Geocode the address to get latitude and longitude
          const { latitude, longitude } = await geocodeAddress(address);
    
          updatedSchedules.push({
            date, // Use the day as received (YYYY-MM-DD)
            startTime,
            endTime,
            address,
            latitude,
            longitude,
          });
        }
    
        // Update the food truck with the new schedules
        const updatedFoodTruck = await FoodTruck.findOneAndUpdate(
          { owner: req.user.userId },
          { schedules: updatedSchedules },
          { new: true }
        );
    
        res.status(200).json(updatedFoodTruck);
      } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Server error' });
      }
    };