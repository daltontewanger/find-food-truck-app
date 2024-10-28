const FoodTruck = require('../models/FoodTruck');
const User = require('../models/User');
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
    const { role, verificationStatus, userId, emailVerified } = req.user;

    // Check if the user is a business
    if (role !== 'business') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if the email is verified
    if (emailVerified !== true) {
        return res.status(403).json({ message: 'Business not verified. Please verify your email first.' });
    }

    try {
        const { name, description, foodType, menuLink } = req.body;

        // Update the food truck details
        const updatedFoodTruck = await FoodTruck.findOneAndUpdate(
            { owner: userId },
            { name, description, foodType, menuLink },
            { new: true }
        );

        // If the current verification status is 'rejected', update it to 'pending' after resubmission
        if (verificationStatus === 'rejected') {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.verificationStatus = 'pending';
            await user.save();
        }

        res.status(200).json(updatedFoodTruck);
    } catch (error) {
        console.error('Error updating details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSchedule = async (req, res) => {
    const { role, verificationStatus, userId } = req.user;

    // Verify if the user is a business and has proper verification
    if (role !== 'business') {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    if (verificationStatus !== 'verified') {
        return res.status(403).json({ message: 'Business not fully verified. Please wait for admin approval.' });
    }

    try {
        const { schedule } = req.body;

        if (!Array.isArray(schedule) || schedule.length === 0) {
            return res.status(400).json({ message: 'Invalid schedule format or no schedule provided' });
        }

        const updatedSchedules = [];

        for (let item of schedule) {
            const { address, date, startTime, endTime } = item;

            // Validate the day
            if (!date || isNaN(Date.parse(date))) {
                return res.status(400).json({ message: 'Invalid date value provided' });
            }

            if (!address) {
                return res.status(400).json({ message: 'Address is required for all schedules' });
            }

            // Geocode the address to get latitude and longitude
            const geocoded = await geocodeAddress(address);
            if (!geocoded) {
                return res.status(400).json({ message: `Could not find coordinates for address: ${address}` });
            }
            const { latitude, longitude } = geocoded;

            // Add formatted schedule to array
            updatedSchedules.push({
                date, // Use the date as received (YYYY-MM-DD)
                startTime,
                endTime,
                address,
                latitude,
                longitude,
            });
        }

        // Update the food truck with the new schedules
        const updatedFoodTruck = await FoodTruck.findOneAndUpdate(
            { owner: userId },
            { schedules: updatedSchedules },
            { new: true }
        );

        if (!updatedFoodTruck) {
            return res.status(404).json({ message: 'Food truck not found' });
        }

        res.status(200).json(updatedFoodTruck);
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
};