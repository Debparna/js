var http = require('http');
const express = require('express')  
const app = express()  
app.use(express.static('public')); // serve static files from public

var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//url = 'http://api.openweathermap.org/pollution/v1/co/0.0,10.0/current.json?appid={d455af8ff19bdcd0c8c4ef3a4dc23408}';
var options = {
  host: 'api.openweathermap.org',
  path: '/pollution/v1/co/0.0,10.0/current.json?appid=d455af8ff19bdcd0c8c4ef3a4dc23408'
};

app.get('/query', function (request, response){

    console.log("GetQuery");
    query = request.url.split("?")[1]; // get query string
    if (query) {
        data  = answer(query, response);
        response.send(data);
    } else {
        sendCode(400,response,'query not recognized');
    }
});

//-----ANSWER------//

var querystring = require('querystring'); // handy for parsing query strings

function answer(query, response) {
  console.log("answer");
  queryObj = querystring.parse(query);
  
  if(queryObj.op == "dump"){

    callback = function(response) {
      var str = '';
        response.on('data', function (chunk) {
        str += chunk;
        
      });

      response.on('end', function () {
        console.log(str);

      });

        //response.status(200);
        //response.type("text/plain");
       
    }

    http.request(options, callback).end();
  } // end if 
} // end answer


//PORT//
const port = 3000
app.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${3000}`)
})



