// This makes the server and client use HTTP to access the server
var https = require('http');

// Provides filesystem-related functionality
var fs = require('fs');

// Provides Path functionality for filesystem
var path = require('path');

// Add-on mime module provides ability to derive a MIME type based on a filename extension
var mime = require('mime');

// This makes an empty object that stores files that get sent to the Cache
var cache = {};

// This function sends a 404 if the client requests a page that dosen't exist
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: Resource not found.');
  response.end();
}

// This function sends the data that is requested to the client
function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// This function determins wheather or not a file is cached
// and if so, serves it to the client

function serverStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

// For the http server, an anonymous function is provided as an argument to
// create-Server, acting as a callback that defines how each HTTP request
// should be handled
var server = https.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
  filePath = 'public' + request.url;
  }
  var absPath = './' + filePath;
  serverStatic(response, cache, absPath)
});

// This creates the logic to start the HTTP server
server.listen(3000, function() {
  console.log("Server listening on port 3000.");
})
