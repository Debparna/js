//dumbDB();
function readFile() {
    console.log("in readFile function");
    var queryurl = "http://localhost:3000/query?op=dump";
      function reqListener () {
        //var dataArray = JSON.parse(this.responseText);
        console.log("in reqListener function");
        var data = this.responseText;
        addPhotostoDOM(data);
      }  
      
      console.log("after reqListener function");
      var tagReq = new XMLHttpRequest();
      tagReq.addEventListener("load", reqListener);
      tagReq.open("GET", queryurl);
      tagReq.send(); 
      console.log("end of readFile");   
}

function addPhotostoDOM(object){
  console.log(object);
  var newlabel = document.createElement("div");
}

