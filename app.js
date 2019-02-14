const request = require('request');
const yargs = require('yargs');

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

request({
  url: 'https://nominatim.openstreetmap.org/search.php?format=jsonv2&limit=1&q=prazsky%20hrad',
  json: true,
  headers: {
    'User-Agent': 'simple weather app demo',
  }, // must be set to comply with Nominatim terms of use
}, (error, response, body) => {
  console.log('Status:', response.statusCode, response.statusMessage);
  console.log('Error:', error);
  const newBody = convertToGoogleApi(body);
  console.log('newBody:', newBody);
  console.log(`Address: ${newBody.results[0].formatted_address}`);
  console.log(`Latitude: ${newBody.results[0].geometry.location.lat}`);
  console.log(`Longitude: ${newBody.results[0].geometry.location.lng}`);
});
