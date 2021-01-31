
var http = require('http'); //Brings in the http module


var static = require('node-static');
var file = new static.Server('/home/dpratihe/public');

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
        

        
        //if ( pathname  == '/home/dpratihe/public'){
	// response.writeHead(200, {"Content-Type": "text/html"}); //Builds an http response
	//	 response.write("<h1> 404 Error </h1>");
	//} 
   }


//     request.addListener('end', function () {
//        fileServer.serve(request, response, function (err, result) {
//            if (err) { // There was an error serving the file 
//                console.error("Error serving " + request.url + " - " + err.message);
 
//                response.writeHead(err.status, err.headers);
//                response.end();
//            }
//        });
//    }).resume();

  request.addListener('end', handlerEnd);
  request.resume();
}



var server = http.createServer(handlerStart); //Calling function createServer from the http module
server.listen(9761);
