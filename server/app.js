var PORT = 8080;

var express = require('express');
var path = require('path');
var app = express();

// TODO: Finish this endpoint to serve the main page
app.get("/", function(req, res){
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get("/test", function(req, res){
  res.send("Hello World!");
});

app.listen(PORT, function(){
  console.log("Server listening on port " + PORT);
});
