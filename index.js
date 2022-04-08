// lib
const http = require('http'),
      {Server} = require('./server.js'),
      cp = require('child_process'),
      fs = require('fs'),
      {WebSocketServer} = require('ws');

// a simple function to delete files and handle errors
function rm(paths) {
  for(let path of paths) {
    fs.rm(path, (error) => {
      if(error) {
        console.error(error);
      }
    });
  }
}

// server listener
const port = process.env.PORT || 8000;
const SERVER = http.createServer((req, res) => {
  
  // send cors headers
if (req.method == 'POST') {
    if (req.url == '/run') {
      res.writeHead(200, {
        'access-control-allow-origin': '*',
        'content-type': 'text/plain'
      });
      let code = '';
      req.on('data', (byte) => {
        code += byte;
      }).on('end', () => {
        try {
          fs.writeFileSync('./sources/temp.cpp', code);
        } catch (error) {
          console.error('Internal error: ' + error);
          res.send('Internal error, failed to save file\n');
          res.end('Please try again later or contact developer majirouvik@gmail.com')
        }
        
        // compile the code here
        try {
        // cp.execSync('g++ ./sources/temp.cpp -o ./sources/temp') -- PRODUCTION VERSION
          cp.execSync('g++ ./sources/temp.cpp -o $HOME/temp');
        } catch (error) {
          res.end(error.toString());
          rm(['./sources/temp.cpp']); // remove the generated file
          return;
        }
        
        // handle program
        // let.prog = cp.spawn('./sources/temp') -- PRODUCTION VERSION
        let prog = cp.spawn(process.env.HOME + '/temp');
        
        prog.stdout.on('data', (byte) => {
          res.write(byte);
        });
        
        /*prog.stdout.on('end', () => {
          // console.log(data);
          // res.write(data);
        });*/
        
        prog.on('close', (id) => {
          res.end('\n[Terminated with code: ' + id + ']');
        });
        
        prog.on('error', (error) => {
          console.error('Failed to execute program: ' + error);
        });
        
        // delete the source files and binaries here
        // rm(['./sources/temp', './sources/temp.cpp']) -- PRODUCTION VERSION
        rm([process.env.HOME + '/temp', './sources/temp.cpp']);
      });
    }
    
  }
});

SERVER.listen(port); // start listening here

new Server(SERVER); // setup asset server

console.log('Listening at port: ' + port);
