var express = require('express');
var formidable = require('formidable');  // we upload images in forms
//var queries = require('./queries');
var app = express();
// Now we build a pipeline for processing incoming HTTP requests

// Case 1: static files
app.use(express.static('public')); // serve static files from public
// if this succeeds, exits, and rest of the pipeline does not get done

var LIVE = true;
var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// An object that gets stringified and sent to the API in the
// body of an HTTP request

// URL containing the API key 
url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDHVYrCQhcMCTBkWdHBCFZL38qu7oOeqe0';


// fake callback function
function fakeAPIcallback() {
    console.log("fake");
    
	console.log( ` { labelAnnotations:    [ { mid: '/m/026bk', description: 'fakeLabel1', score: 0.89219457 },
     { mid: '/m/05qjc',
       description: 'fakeLabel2',
       score: 0.87477195 },
     { mid: '/m/06ntj', description: 'fakeLabel3', score: 0.7928342 },
     { mid: '/m/02jjt',
       description: 'fakeLabel4',
       score: 0.7739482 },
     { mid: '/m/02_5v2',
       description: 'fakeLabel5',
       score: 0.70231736 } ] }` );
}


// Comment out to make this a module:
//annotateImage();

// Uncomment to make this a module:
// exports.annotateImage = annotateImage;

// Case 2: queries
// An example query URL is "138.68.25.50:???/query?img=hula"
app.get('/query', function (request, response){
    console.log("query");
    query = request.url.split("?")[1]; // get query string
    if (query) {
        answer(query, response);
    } else {
        sendCode(400,response,'query not recognized');
    }
});

// Case 3: upload images
// Responds to any POST request
app.post('/', function (request, response)
{
    var form = new formidable.IncomingForm();
    form.parse(request); // figures out what files are in form
    var filename = null;

    // callback for when a file begins to be processed
    form.on('fileBegin', function (name, file){
        // put it in /public
      filename = file.name;
      file.path = __dirname + '/public/' + file.name;
      console.log("uploading ",file.name,name);
     
       //exports.annotateImage = annotateImage;

      var sqlite3 = require("sqlite3").verbose();  // use sqlite
      var dbFile = "photos.db"
      var db = new sqlite3.Database(dbFile);  // new object, old DB

      function errorCallback(err) {
        if (err) {
          console.log("error: ",err,"\n");
        }
      }

      function dataCallback(err, tableData) {
        if (err) {
          console.log("error: ",err,"\n");
        } else {
          console.log("got: ",tableData,"\n");
        }
      }

      db.serialize( function () {
        console.log("starting DB operations");

        // Insert or replace rows into the table
        db.run('INSERT OR REPLACE INTO photoLabels VALUES (?, "", 0)',[file.name],errorCallback);
        db.get('SELECT labels FROM photoLabels WHERE fileName = ?', [file.name],dataCallback);        
        db.close();
        // to db.serialize 
      });
    }); //end of form.on
  
    // callback for when file is fully recieved
    form.on('end', function (){
       console.log('success' + filename);
        
       requestObject = {
        "requests": [
        {
        "image": {
          "source": {"imageUri": "http://138.68.25.50:11015/" + filename}
          },
        "features": [{ "type": "LABEL_DETECTION" }]
        }
        ]
      }
      //console.log("url: " +requestObject.requests.image.source.imageUri);

      function APIcallback(err, APIresponse, body) {
        if ((err) || (APIresponse.statusCode != 200)) {
          console.log("Got API error");
          console.log(body.error.message);
          console.log(body.responses[0].error.message);
        } else {
            APIresponseJSON = body.responses[0];
            console.log(APIresponseJSON);
            responseParse(APIresponseJSON);
            }
       }

       function responseParse(object){
         var length = object.labelAnnotations.length;
         var labelStr = "";
         
         for(var i = 0; i < length; i++)
         {
           var newlabel = object.labelAnnotations[i].description;
	   console.log(newlabel);

           if(labelStr == ""){
             labelStr = newlabel;
           }
           else{
             labelStr = labelStr + "," + newlabel;
           }
         }
	   console.log(labelStr);
           db.get(
                'SELECT labels FROM photoLabels WHERE fileName = ?',
                filename, getCallbackAPI);

            function getCallbackAPI(err,data) {
                console.log("getting labels from " +filename);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    if (data.labels.length == 0)
                    {
                      db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [labelStr, filename],
                        updateCallbackAPI);
console.log("LABELS ARE EMPTY SO NO TRAILING COMMA");

                    }
                    else{
                    // good response...so let's update labels
                    db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [data.labels+","+labelStr, filename],
                        updateCallbackAPI);
                    }
                }
            }

            // Also define this inside queries so it knows about
            // response object
            function updateCallbackAPI(err) {
                console.log("updating labels for "+filename+ "with" +labelStr +"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
console.log("no error");
                   response.status(200);
                    response.type("text/plain");
                    //response.send("added label "+newLabel+" to "+imageFile);
                    response.send(labelStr);
		    console.log("updated successfully");
                }
            }

          }
  
      function annotateImage() {
        if (LIVE) {
        // The code that makes a request to the API
        // Uses the Node request module, which packs up and sends off
        // an XMLHttpRequest.
console.log("in annotateImage");
        var request = require('request');
            request({ // HTTP header stuff
                url: 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDHVYrCQhcMCTBkWdHBCFZL38qu7oOeqe0',
                method: "POST",
                headers: {"content-type": "application/json"},
                // stringifies object and puts into HTTP request body as JSON 
                json: requestObject,
            },

            // callback function for API request
            APIcallback
            );
         }else {  // not live! return fake response
           // call fake callback in 2 seconds
           console.log("not live");
           setTimeout(fakeAPIcallback, 2000);
         }
       }
       annotateImage();   
    });
}); //end of post

app.listen(11015);

// sends off an HTTP response with the given status code and message
function sendCode(code, response, message) {
    response.status(code);
    response.send(message);
}

var sqlite3 = require("sqlite3").verbose();  // use sqlite
var dbFile = "photos.db"
var db = new sqlite3.Database(dbFile);  // new object, old DB

// SERVER CODE
// Handle request to add a label
var querystring = require('querystring'); // handy for parsing query strings

function answer(query, response) {
    // query looks like: op=add&img=[image filename]&label=[label to add]
    
        var newLabel = queryObj.label;
        var imageFile = queryObj.img;
        if (newLabel && imageFile) {
            // go to database! 
            db.get(
                'SELECT labels FROM photoLabels WHERE fileName = ?',
                [imageFile], getCallback);

            function getCallback(err,data) {
                console.log("getting labels from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    if (data.labels === "")
                    {
     		      db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [newLabel, imageFile],
                        updateCallback);

                    }
                    else{
                    // good response...so let's update labels
                    db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [data.labels+","+ newLabel, imageFile],
                        updateCallback);
                    }
                }
            }

            // Also define this inside queries so it knows about
            // response object
            function updateCallback(err) {
                console.log("updating labels for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    //response.send("added label "+newLabel+" to "+imageFile);
		    response.send(newLabel);
                }
            }

        }
    } //end of add
    
    else if(queryObj.op == "delete")
    {
        console.log("going into delete");
        var delLabel = queryObj.label;
        var imageFile = queryObj.img;
        if (delLabel && imageFile) {
            // good add query
            // go to database!
            db.get(
                'SELECT labels FROM photoLabels WHERE fileName = ?',
                [imageFile], getCallback1);

            // define callback inside queries so it knows about imageFile
            // because closure!
            function getCallback1(err,data) {
                console.log("deleting labels from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    // good response...so let's update labels
                    labelslist = data.labels.split(",");
 		    var j = 0;
                    var temp = [];
		    var labelStr = "";
                    for ( var i = 0; i < labelslist.length; i++)
                    {
                      if (labelslist[i] != delLabel)
                      {
                        console.log(labelslist[i]);
                        labelStr = labelStr + labelslist[i] + ",";
                        //temp[j] = labelslist[i];
                        j++;
		      }
                    }
                    labelStr = labelStr.substring(0, labelStr.length - 1);
                    //temp.toString();
                    console.log("This is labelStr" +labelStr);
                    db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [labelStr, imageFile],
                        updateCallback1);
                }
            }

            // Also define this inside queries so it knows about
            // response object
            function updateCallback1(err) {
                console.log("updating labels for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send("deleted label "+delLabel+" from "+imageFile);
                }
            }

        }
    }//end of delete

  
    else if(queryObj.op == "editfav")
    {
console.log("going into fav");
      var imageFile = queryObj.img;
      var flag = queryObj.favorite;

      if (imageFile && flag)
      {
            db.get(
                'SELECT favorite FROM photoLabels WHERE fileName = ?', [imageFile], getCallback2);  
      }
      
            function getCallback2(err,data) {
                console.log("getting favorite flag from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    // good response...so let's update labels
                    db.run(
                        'UPDATE photoLabels SET favorite = ? WHERE fileName = ?',
                        [flag, imageFile],
                        updateCallback2);
                }
            }

            // Also define this inside queries so it knows about
            // response object
            function updateCallback2(err) {
                console.log("updating favorites for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send("added" +imageFile+ " to favorites");
                }
            }
    }

    else if(queryObj.op == "dump"){
       db.all('SELECT * FROM photoLabels',dataCallback);
       
       function dataCallback(err, data){
         if (err) {
           console.log("error: ",err,"\n");
         } else {
           var dataArr = JSON.stringify(data);
	   response.status(200);
           response.type("text/plain");
           response.send(dataArr);
         
         }      
       }

    }

   /*else if (queryObj.op == "fetch"){
	console.log("going into fetch");
   	var filename = queryObj.img;
    if (imageFile) {
    db.get(
                'SELECT labels FROM photoLabels WHERE fileName = ?',
                filename, getCallbackAPI);

            /*function getCallbackAPI(err,data) {
                //console.log("getting labels from " +filename);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    /*if (data.labels === "")
                    {
                      db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [labelStr, filename],
                        updateCallbackAPI);

                    }
                    else{
                    console.log("these are the data.labels:" + data.labels);
                    console.log("this is labelstr:" + labelStr);
                    // good response...so let's update labels
                    db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',
                        [data.labels+","+labelStr, filename],
                        updateCallbackAPI);
                    }
                }
            }
	
	    function getCallbackAPI(err, data) {
                //console.log("updating labels for "+filename+ "with" +labelStr +"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
console.log("query no error");
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    //response.send("added label "+newLabel+" to "+imageFile);
                    var labelArr = JSON.stringify(data.labels);
                    response.send(labelArr);
console.log("query no error2");
                }
            }

	}
  }*/

else if(queryObj.op == "filter")
{
  console.log("going into filter");
  var filterlabel = queryObj.label;
  //if ( filterlabel)
  //{
   
    db.all('SELECT * FROM photoLabels', getCallbackFilter);

    function getCallbackFilter(err, data){
      if (err){
        console.log("error: ", err, "\n");
        console.log(err+"\n");
          sendCode(400,response,"requested photo not found");
      }
      else
      {
        console.log("GOING INTO FILTER QUERY");
        var filterednames = [];
        var k = 0;
        for ( var i = 0; i < data.length; i++)
        {
          var currfile = data[i].fileName;
          var currlabels = data[i].labels;
          var flag = 0;
          currlabels = currlabels.split(",");
          for ( var j = 0; j < currlabels.length; j++)
          {
             if ( filterlabel == currlabels[j])
             {
               //filterednames[k] = currfile;
               //k++;
               flag = 1;
               break;
             }
           }
              if(flag == 1){
                continue;
              }

               filterednames[k] = currfile;
               k++;
          }
        
      
      filterednames = filterednames.toString();
console.log("filtered names is " +filterednames);

      response.status(200);
        response.type("text/plain");
        response.send(filterednames);
      }
      }
    //}
  }

  else if (queryObj.op == "weird")
  {
    db.all('SELECT * FROM photoLabels', getCallback7);
    function getCallback7(err,data){
      if (err){
        console.log("error: ", err, "\n");
        console.log(err+"\n");
        sendCode(400,response,"error in filterfav");      
      }

      else {
        var filterednames = [];
        var k = 0;
        for ( var i = 0; i < data.length; i++)
        {
          var currfile = data[i].fileName;
          var currfav = data[i].favorite;
             if ( currfav == 0)
             {
               filterednames[k] = currfile;
               k++;
             }
          }
          filterednames= filterednames.toString();
console.log("filtered names for FAVFILTER is " +filterednames);

        response.status(200);
        response.type("text/plain");
        response.send(filterednames);
        }  
      }
   }
}