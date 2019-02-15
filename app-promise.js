require('dotenv').config();
const yargs = require('yargs');
const axios = require('axios');

const { argv } = yargs
  .options({
    a: {
      demand: true,
      alias: 'address',
      describe: 'Address or place to fetch weather for',
      string: true,
    },
  })
  .help()
  .alias('help', 'h');

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

const encodedAddress = encodeURIComponent(argv.address);
const geocodeUrl = `https://nominatim.openstreetmap.org/search.php?format=jsonv2&limit=1&q=${encodedAddress}`;

axios.get(geocodeUrl, {
  headers: {
    'User-Agent': 'simple weather app demo',
  },
}).then((res) => {
  // console.log('Result:', res.data);
  if (res.data.length === 0) throw new Error('Sorry, no corresponding location was found.');
  const newBody = convertToGoogleApi(res.data);
  return {
    address: newBody.results[0].formatted_address,
    latitude: newBody.results[0].geometry.location.lat,
    longitude: newBody.results[0].geometry.location.lng,
  };
}).then((res) => {
  const { address, latitude, longitude } = res;
  console.log(`Here is the weather forecast for ${address}.`);
  console.log(` (which is at latitude ${latitude}, longitude ${longitude}.)`);
  const weatherUrl = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}?units=si`;
  return axios.get(weatherUrl);
}).then((resWeather) => {
  const { currently, hourly } = resWeather.data;
  if (currently.temperature === currently.apparentTemperature) {
    console.log(`The current temperature is ${currently.temperature}°C.`);
  } else {
    console.log(`The current temperature is ${currently.temperature}°C, though it feels like ${currently.apparentTemperature}°C.`);
  }
  console.log(`It is currently ${currently.summary.toLowerCase()}.`);
  console.log(`It will be ${hourly.summary.toLowerCase()}`);
})
  .catch((err) => {
    console.log(err.message);
    if (err.message.slice(0, 5) === 'Sorry') {
      console.log(err);
    } else {
      console.log('Error connecting to server:', err.code);
    }
  });
