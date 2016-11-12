var PORT = 8080;

var express = require('express');
var app = express();

// TODO: Finish this endpoint to serve the main page
app.get("/", function(req, res){
});

app.get("/test", function(req, res){
  res.send("Hello World!");
});

app.listen(PORT, function(){
  console.log("Server listening on port " + PORT);
});
