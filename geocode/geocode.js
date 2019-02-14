const request = require('request');

const convertToGoogleApi = (fromNominatimApi) => {
  const place = fromNominatimApi[0];
  return ({
    results: [{
      formatted_address: place.display_name,
      geometry: {
        bounds: {
          northeast: {
            lat: place.boundingbox[1],
            lng: place.boundingbox[3],
          },
          southwest: {
            lat: place.boundingbox[0],
            lng: place.boundingbox[2],
          },
        },
        location: {
          lat: place.lat,
          lng: place.lon,
        },
      },
      types: [place.category, place.type],
    }],
  });
};

const geocodeAddress = (address, callback) => {
  const encodedAddress = encodeURIComponent(address);
  request({
    url: `https://nominatim.openstreetmap.org/search.php?format=jsonv2&limit=1&q=${encodedAddress}`,
    json: true,
    headers: { // this must be set to comply with Nominatim's Terms of Use
      'User-Agent': 'simple weather app demo',
    },
  }, (error, response, body) => {
    if (error) {
      callback('Error connecting to geocoding server:', error.code);
      return 'GEOCODE_CONNECTION_ERROR';
    }
    if (body.length === 0) {
      callback('Sorry, no corresponding location was found.');
      return 'GEOCODE_LOCATION_ERROR';
    }
    // console.log('Status:', response.statusCode, response.statusMessage);
    const newBody = convertToGoogleApi(body);
    callback(undefined, {
      address: newBody.results[0].formatted_address,
      latitude: newBody.results[0].geometry.location.lat,
      longitude: newBody.results[0].geometry.location.lng,
    });
    // console.log(`Address: ${newBody.results[0].formatted_address}`);
    // console.log(`Latitude: ${newBody.results[0].geometry.location.lat}`);
    // console.log(`Longitude: ${newBody.results[0].geometry.location.lng}`);
    return 'GEOCODE_SUCCESS';
  });
};

module.exports.geocodeAddress = geocodeAddress;
