// lib
const http = require('http'),
      cp = require('child_process'),
      fs = require('fs');

// server listener
const port = process.env.PORT || 8000;
http.createServer((req, res) => {
  
  // send cors headers
  if (req.method == 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
      'Connection': 'timeout',
      'Access-Control-Request-Methods': '*',
      'Allow': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Allowed': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Content-Length': '0'
    });
    res.end();
  } // manage post requests
  else if (req.method == 'POST') {
    if (req.url == '/run') {
      res.writeHead(200, {
        'access-control-allow-origin': '*',
        'content-type': 'text/plain'
      });
      let code = '';
      req.on('data', (byte) => {
        code += byte;
      }).on('end', () => {
        fs.writeFile('./.data/temp.cpp', code, (err) => {
          if(err){
            console.error(err);
            res.end(err);
          }
        });
        cp.exec('g++ ./.data/temp.cpp -o ./.data/temp; ./.data/temp; rm -f ./.data/temp.cpp ./.data/temp', (error, stdout, stderr) =>
        {
          if(error){
            console.log('Error:\n' + error);
            res.end(error);
          } else if (stderr){
            console.log('Std-err:\n' + stderr);
            res.end(stderr);
          } else {
            res.end(stdout);
          }
        });
      }).on('error', (err) =>{
        console.log(err);
        res.end(err);
      });
    }
  } else if (req.method == 'GET') {
    if (req.url == '/') {
      res.writeHead(200, {
        'access-control-allow-origin': '*',
        'content-type': 'text/html'
      });
      fs.readFile('./index.html', (err, out) => {
        if (err) {
          console.error(err);
          res.end(err);
        } else {
          res.end(out);
        }
      });
    }
  }
}).listen(port);

console.log('Listening at port: ' + port);

// repetitive logging to keep the app online
setInterval(()=>{
  http.get('http://onlinecompiler.glitch.me', ()=>{
    console.log('Ping!');
  })
}, 5000);