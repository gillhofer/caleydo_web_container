var express = require('express');
var csv = require("fast-csv");

var app = express();

app.use('/', express.static('static'));

app.get('/about', function(req, res){
  res.send('Caleydo Web 0.0.1');
});

app.get('/data', function(req,res){
  
  var records = [];

  csv
    .fromPath("data/test_10x10.csv")
    .on("record", function(data){
      records.push(data);
    })
    .on("end", function(){
      res.send(records);  
    });


})

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});