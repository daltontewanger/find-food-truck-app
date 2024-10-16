const User = require('../models/User');

// Get pending businesses
const getPendingBusinesses = async (req, res) => {
  try {
    const pendingBusinesses = await User.find({ role: 'business', isVerified: false });
    res.status(200).json(pendingBusinesses);
  } catch (error) {
    console.error('Error fetching pending businesses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify business (approve/deny)
const verifyBusiness = async (req, res) => {
  const { userId, action } = req.body;

  try {
    const business = await User.findById(userId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (action === 'approve') {
      business.isVerified = true;
    } else if (action === 'deny') {
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: 'Business denied and deleted' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await business.save();
    res.status(200).json({ message: 'Business successfully verified' });
  } catch (error) {
    console.error('Error verifying business:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPendingBusinesses,
  verifyBusiness,
};
