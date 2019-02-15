const yargs = require('yargs');
const geocode = require('./geocode/geocode');
const weather = require('./weather/weather');

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

geocode.geocodeAddress(argv.address, (errorMessageGeocode, resultsGeocode) => {
  if (errorMessageGeocode) {
    console.log(errorMessageGeocode);
  } else {
    const { address, latitude, longitude } = resultsGeocode;
    console.log(`Here is the weather forecast for ${address}.`);
    console.log(` (which is at latitude ${latitude}, longitude ${longitude}.)`);
    weather.getWeather(latitude, longitude, (errorMessageWeather, resultsWeather) => {
      if (errorMessageWeather) {
        console.log(errorMessageWeather);
      } else {
        const { currently, hourly } = resultsWeather;
        if (currently.temperature === currently.apparentTemperature) {
          console.log(`The current temperature is ${currently.temperature}°C.`);
        } else {
          console.log(`The current temperature is ${currently.temperature}°C, though it feels like ${currently.apparentTemperature}°C.`);
        }
        console.log(`It is currently ${currently.summary.toLowerCase()}.`);
        console.log(`It will be ${hourly.summary.toLowerCase()}`);
      }
    });
  }
});
