const axios = require('axios');

exports.geocodeAddress = async (address) => {
    try {
      const response = await axios.get(`https://us1.locationiq.com/v1/search.php`, {
        params: {
          key: process.env.LOCATIONIQ_API_KEY,
          q: address,
          format: 'json',
          limit: 1,
        },
      });
  
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