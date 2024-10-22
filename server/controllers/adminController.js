const User = require('../models/User');

exports.getPendingBusinesses = async (req, res) => {
  try {
    const pendingBusinesses = await User.find({ role: 'business', verificationStatus: 'pending' });
    res.status(200).json(pendingBusinesses);
  } catch (error) {
    console.error('Error fetching pending businesses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyBusiness = async (req, res) => {
  try {
    const { businessId } = req.body;

    // Check if businessId is provided
    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    const business = await User.findById(businessId);

    // Check if the business exists and is indeed a business
    if (!business || business.role !== 'business') {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Update verification status to verified
    business.verificationStatus = 'verified';
    await business.save();

    console.log(`Business verified: ${business.email}`);

    res.status(200).json({ message: 'Business verified successfully' });
  } catch (error) {
    console.error('Error verifying business:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

exports.rejectBusiness = async (req, res) => {
  try {
    const { businessId, note } = req.body;

    // Check if businessId and note are provided
    if (!businessId || !note) {
      return res.status(400).json({ message: 'Business ID and rejection note are required' });
    }

    const business = await User.findById(businessId);

    // Check if the business exists and is indeed a business
    if (!business || business.role !== 'business') {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Update verification status to rejected and add the rejection note
    business.verificationStatus = 'rejected';
    business.rejectionNote = note; // Ensure your User model includes a `rejectionNote` field

    await business.save();

    console.log(`Business rejected: ${business.email}`);

    res.status(200).json({ message: 'Business rejected successfully' });
  } catch (error) {
    console.error('Error rejecting business:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};
