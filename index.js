var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
var uuid = require('node-uuid');
app.use(express.static("public"));

server.listen(4004);