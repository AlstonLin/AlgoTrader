var PORT = 8080;

var express = require('express');
var path = require('path');
var axios = require('axios');
var bodyParser = require('body-parser')
var api = require('./apis.js')
var app = express();

//middleware
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../public')));

app.use("/api", api)

// TODO: Finish this endpoint to serve the main page
// app.get("/", function(req, res){
//   res.sendFile(path.join(__dirname, '../public', 'index.html'));
// });

app.listen(PORT, function(){
  console.log("Server listening on port " + PORT);
});
