var http = require('http'); //Brings in the http module


var static = require('node-static');
var file = new static.Server('/Users/Debparna/Documents/Comp/ECS/ECS 189H/WeatherAppp/code');

function handlerStart (request, response) { //All node.js servers use a handler function, which is a new kind of event handler – for incoming requests to the server.
   
   function handlerEnd(){
    	var urlStr = request.url; //Get whatever data we need out of request object
    	var urlList = urlStr.split("?");
    	var pathname = urlList[0];
    	var query = urlList[1];
      
   	if ( query != undefined){
    		response.writeHead(200, {"Content-Type": "text/html"}); //Builds an http response
    		response.write("<h1>Bad Query</h1>");
    		response.write("<p>Pathname was <code>" + pathname + "</code></p>");
    		response.write("<p>Query was <code>" + query + "</code></p>");
    		response.end(); //Calling response.end() tells node.js that we have finished filling in the response object, and it is OK to send the response back to the browse
    	}
        //else if {
		//response.writeHead(200, {"Content-Type": "text/html"}); //Builds an http response
	//	response.write("<h1>404 Error</h1>");
	//}	
    	else{
    		//console.log("here");
		//request.url = "index.html";
		file.serve(request, response);
    	}
   }

  request.addListener('end', handlerEnd);
  request.resume();
}

var server = http.createServer(handlerStart); //Calling function createServer from the http module
server.listen(3000);