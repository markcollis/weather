const request = require('request');

const DARKSKY_API_KEY = 'e4d25953366b5737ce54b5f8262c3a7e';

const getWeather = (lat, long, callback) => {
  request({
    url: `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${lat},${long}?units=si`,
    json: true,
  }, (error, response, body) => {
    if (error) {
      callback(`Error connecting to weather server: ${error.code}`);
      return 'WEATHER_CONNECTION_ERROR';
    }
    if (body.code === 400) {
      callback('No weather available for this location.');
      return 'WEATHER_NONE_AVAILABLE';
    }
    callback(undefined, body);
    return 'WEATHER_SUCCESS';
  });
};

module.exports.getWeather = getWeather;
