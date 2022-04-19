// PACKAGES
const fs = require('fs');

// pre-loading appropriate 404 message
let res404 = 'Oops, it seems like the page requested is not available, ERROR: 404';
fs.readFile('./public/pages/404.html', (error, out) => {
  if (error) {
    console.error(error);
  } else {
    res404 = out;
  }
});

class Server {
  static assetTypes = {
    txt: 'text/plain',
    text: 'text/plain',
    js: 'text/javascript',
    json: 'application/json',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
    ogv: 'video/ogg',
    ogx: 'application/ogg',
    otf: 'font/otf',
    png: 'image/png',
    pdf: 'application/pdf',
    svg: 'image/svg+xml',
    ttf: 'font/ttf',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    wav: 'audio/wav',
    weba: 'audio/webm',
    webm: 'audio/webm',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    css: 'text/css',
    bmp: 'image/bmp',
    bin: 'application/octet-stream',
    aac: 'audio/aac'
  };
  
  constructor(server) {
    this.server = server;
    
    // the actual listener
    this.server.addListener('request', (req, res) => {
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
      } else if(req.method == 'GET') {
        if(req.url.startsWith('/public')) {
          this.servePublic(req, res);
        } else if (req.url == '/') {
          this.servePublic(req, res, true);
        } else if (req.url.startsWith('/assets')) {
          this.serveAssets(req, res);
        } else {
          res.writeHead(200, {
            'access-control-allow-origin': '*', // PRODUCTION CHANGE -> change this to the domain name
          });
          res.end(res404);
        }
      }
    });
  }
  
  // manage requests to html contents
  servePublic(req, res, rootReq = false) {
    res.writeHead(200, {
      'access-control-allow-origin': '*', // PRODUCT CHANGE -> change this to the domain name
      'content-type': 'text/html'
    });
    if(rootReq) {
      fs.readFile('./public/pages/index.html', (error, out) => {
        if(error) {
          console.error(error);
          res.end(res404);
        } else {
          res.end(out);
        }
      });
    } else {
      // example - https://example/public/test
      // actual path = ./public/test.html
      fs.readFile('./public/pages' + req.url.substring(req.url.indexOf('/public') + 7) + '.html', (error, out) => {
        if (error) {
          console.error(error);
          res.end(res404);
        } else {
          res.end(out);
        }
      });
    }
  }
  
  // manage requests to assets
  serveAssets(req, res) {
    // get positions for extraction
    let path = './public/assets' + req.url.substring(req.url.indexOf('/assets') + 7);
    fs.readFile(path, (error, out) => {
      if(error) {
        console.error(error);
        res.writeHead(404, {
          'access-control-allow-origin': '*' // PRODUCTION CHANGE -> change this to domain name
        });
        res.end();
      } else {
        res.writeHead(200, {
          'access-control-allow-origin': '*', // PRODUCTION CHANGE -> change this to domain name
          'content-type': this.getAssetType(req)
        });
        
        res.end(out);
      }
    });
  }
  
  // get asset type
  getAssetType(req) {
    let dotPos = req.url.lastIndexOf('.') + 1,
        extension = req.url.substring(dotPos),
        fileType = Server.assetTypes[extension];
    if (fileType == undefined) {
      console.error('File type error: No such file type exists with extension = ' + extension);
      fileType = 'application/octet-stream';
    }
    return fileType;
  }
}

// exports
module.exports = {Server};
