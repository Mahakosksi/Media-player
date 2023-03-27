var express = require('express');
var fs = require('fs');
app = express();
http = require('http');//chargement du module de base http
path = require('path');

const server = http.createServer(function(req,res){
    const fs = require('fs').promises;
      fs.readFile( "image_player.html").then(contents => {
       res.setHeader("Content-Type", "text/html");
       res.writeHead(200);
       res.end(contents);
    })
})    
app.get('/', function (req, res) {
    var im =getImagesFromDir(path.join(__dirname,'images'))
    var img_src ="images/"+im[2]
    console.log(img_src)
    var readStream = fs.createReadStream(img_src);
    readStream.pipe(response);
    })

function getImagesFromDir(dirPath){

    let files =fs.readdirSync(dirPath)
    return files

}


server.listen(8080, () => {
    console.log('listening on *:8080');
  });
