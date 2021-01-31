/*
//--------------------- OpenWeatherMap ----------------//
var http = require('http');
//http://api.openweathermap.org/pollution/v1/o3/0.0,10.0/2016-01-02T15:04:05Z.json?appid={your-api-key}
  
  var lat = 0.0;
  var lng = 10.0;
  //var location = ['lat', 'long'];

var options = {
  host: 'api.openweathermap.org',
  //path: '/pollution/v1/co/'+lat+','+lng+'/current.json?appid=d455af8ff19bdcd0c8c4ef3a4dc23408'
  path: '/pollution/v1/o3/0.0,10.0/2016Z.json?appid=d455af8ff19bdcd0c8c4ef3a4dc23408'
};

function callback(response) {
  var body = '';
  response.on('data', function (data) {
    //var precision = chunk.data;
    body += data;
    console.log(body);
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {

    //console.log(body.data.data);

  });
}

http.request(options, callback).end();

//--------------------- OpenWeatherMap Long----------------//

var http = require('http');
  
  var lat = 0.0;
  var lng = 10.0;

var options = {
  host: 'api.openweathermap.org',
  //path: '/pollution/v1/co/'+lat+','+lng+'/current.json?appid=d455af8ff19bdcd0c8c4ef3a4dc23408'
  path: '/pollution/v1/o3/0.0,10.0/2016Z.json?appid=d455af8ff19bdcd0c8c4ef3a4dc23408'
};

function callback(response) {
  var body = '';
  response.on('data', 
    function (data) 
    {
      //var precision = chunk.data;
      body += data;
      console.log(body);
    }
  );

  //the whole response has been recieved, so we just print it out here
  response.on('end', 
    function () {
    //console.log(body.data.data);
    }
  );
} // end of call back

http.request(options, callback).end();

//--------------------- AirVisual API ----------------//
var http = require("http");

var lat = 37.3688300;
var lng = -122.0363500;

var options = {
  host: 'api.airvisual.com',
  path: '//v2/nearest_city?lat=lat&lon=lng&rad=1000&key=79RgqhjmiJrAnvHSF'

};

function callback(response){
   var body = ' ';
    response.on('data', function(data){
    body += data;
    console.log(body.current.pollution.aqius);
  });
  response.on('end', function () {
    //console.log(body.pollution[2].aqius);
    //var pollution = body.current;
    //console.log(pollution);
  });
}

http.request(options, callback).end();


//------------------Forcast -----------------------//

//var http = require('http');
var ForecastIo = require('forecastio');
var forecastIo = new ForecastIo('6b7f32cac7b68ab04a67a970f5b81be8');

var lat = 37.3688300;
var lng = -122.0363500;

//ozone optional
//The columnar density of total atmospheric ozone at the given time in Dobson units.
var options = {
  exclude: 'flags, daily, time'
};
forecastIo.forecast(lat, lng, options).then(function(data) {
  var ozone = data.currently.ozone;
  var Ozone = JSON.stringify(ozone);
  console.log(Ozone);
});

//-------------------EXPRESS + NODE---------------------------//

var http = require('http');
var app = express();

app.get('/', function (request, response){
    if (query) {
        answer(query, response);
    } else {
        sendCode(400,response,'query not recognized');
    }
});


var http = require("http");

var lat = 41.4925;
var lng = 99.9018;

var options = {
  host: 'api.airvisual.com',
  path: '//v2/nearest_city?lat=41.4925&lon=99.9018&rad=1000&key=79RgqhjmiJrAnvHSF'

};

function callback(response){
   var body = ' ';
    response.on('data', function(data){
    body += data;
    console.log(body);
  });
  response.on('end', function () {
    //console.log(body.pollution[2].aqius);
    //var pollution = body.current;
    //console.log(pollution);
  });
}

http.request(options, callback).end();

*/











