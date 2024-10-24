const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let lastRequestTime = 0;

exports.geocodeAddress = async (address) => {
  try {
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - lastRequestTime;

    // Enforce a minimum delay of 500ms between requests (2 requests per second)
    if (timeSinceLastRequest < 500) {
      await delay(500 - timeSinceLastRequest);
    }

    // Make the API request
    const response = await axios.get(`https://us1.locationiq.com/v1/search.php`, {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        q: address,
        format: 'json',
        limit: 1,
      },
    });

    lastRequestTime = Date.now();

    if (response.data.length === 0) {
      throw new Error('No results found for the given address');
    }

    const { lat, lon } = response.data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
};