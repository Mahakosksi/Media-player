

var express = require('express');
app = express();
http = require('http');
server = http.createServer(app);
var fs = require('fs');
const { Server } = require("socket.io");
const io = new Server(server);
path = require('path');
util = require('util');
upload = require('express-fileupload')


//Déclaration des variables nécessaires 

var listImage //liste des images disponibles
var ok = false;
var nombre = 0;



//connexion avec la base de donnée sql
var connection = require('mysql2').createConnection({
  host: 'localhost',
  user: 'root',
  port: 3306,
  database: 'videos'
});
connection.connect(function (err) {
  if (err) {
    //si connexion impossible
    return console.error('error: ' + err.message);
  }
  console.log('Connexion etablie avec succes');//connexion reussie
});

//connexion avec socket.io
console.log(__dirname)
var socket1 = io.sockets.on('connection', function (socket) {

  //chargement des images à partir du répertoire
  var image = getImagesFromDir(path.join(__dirname, 'images'))
  listImage = image

  //affichage du premiere image disponible
  socket.emit('firstimage', listImage[0]);

  var longeurListe = listImage.length
  socket.emit('length', longeurListe)
  socket.on('nb', (arg) => {

    console.log('image numero  : ' + arg + ' est chargee ')
    nombre = arg;
    //affichage de l'image
    console.log('image numero ' + nombre + ' est affichee')

    var img_src = listImage[nombre]
    console.log(img_src)
    socket.emit('src', img_src)
  });

  socket.on('sendlist', (arg) => {
    console.log('recieved : ' + arg)
    socket.emit('list', listImage)

  })

  //enregistrement de l'image 
  socket.on('save', (arg) => {
    console.log('recieved : ' + arg)
    saveImageToDisk(arg, "images/" + Date.now() + ".png")

  })

  //supression de l'image 
  socket.on('delete', (arg) => {
    console.log('src_to_delete_recieved : ' + arg)
    var img_src = listImage[nombre]
    fs.unlink(img_src, (err) => {
      if (err) {
        throw err;
      }
      console.log('image suppriméé')
      socket.emit('deleted', arg)
    })

  })



  //chargement des videos à partir de la base de données 

  connection.query('select * from video', function (err, results) {
    socket1.emit('playlist', results);

  });
  socket.on('title', (arg) => {
    console.log('recieved : ' + arg)

    var name;
    connection.query('select * from video where id=' + arg, function (err, results) {
      name = results[0]['name']
    })

    //affichage des video 
    console.log('/video/' + arg)
    app.get('/video/' + arg, function (req, res) {
      const range = req.headers.range;
      if (!range) {
        res.status(400).send('requires range header');
      }
      const videoPath = "./video/" + name;
      const videoSize = fs.statSync("./video/" + name).size;
      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
      const headers = {

        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, headers);
      const videoStream = fs.createReadStream(videoPath, { start, end });
      videoStream.pipe(res);



    });
    return socket1;
  });
});


app.use('/', express.static(path.join(__dirname, '')));
app.use('/imagee', express.static(path.join(__dirname, 'images')));


//chargement d'une image à partir de l'image viewer
app.get('/imagee', function (req, res) {
  res.setHeader('content-Type', 'text/html');

  ok = true


  console.log('Chargement d une image ')

  fs.readFile('./image_player.html', 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {

      res.end(data);
    }
  })


});

app.use(express.static(path.join(__dirname, '')));

app.use(upload());

//transfert le l'image 
app.post('/img', (req, res) => {


  let Nomfile = req.files.uploader;
  let filename = Nomfile.name
  Nomfile.mv('./images/' + filename, function (err) {
    if (err) { res.send(err); }
  });
  Nomfile.mv('./imagee/images/' + filename, function (err) {
    if (err) { res.send(err); }
  });
  res.redirect('/imagee')
});

//chargement des images à partir du dossier
function getImagesFromDir(dirPath) {
  let allImages = []
  let files = fs.readdirSync(dirPath)

  for (file in files) {
    files[file] = "images/" + files[file]
  }
  return files

}

//enregistrement des images 
function saveImageToDisk(url, path) {
  var fullUrl = url
  console.log("dans la fonction save")
  var localPath = fs.createWriteStream(path)
  var request = http.get(fullUrl, function (response) {
    console.log(response)
    response.pipe(localPath)
  })
}




var maxid = 0;
var names = []



connection.query('select * from video', function (err, results) {
  for (i = 0; i < results.length; i++) {
    names.push(results[i]['name'])

    if (Number(results[i]['id']) > maxid) {
      maxid = results[i]['id'];


    }
  }
});
console.log(names);

//ajout de video

app.post('/file', (req, res) => {

  var ok = true

  console.log(maxid)
  var check = []
  let Nomfile = req.files.location;
  let filename = Nomfile.name
  console.log("entre")
  console.log(names)

  maxid++
  console.log("entre2")
  Nomfile.mv('./video/' + filename, function (err) {
    if (err) { res.send(err); }
  });
  var sql = 'insert into video(id,name) values (' + maxid + ',"' + filename + '");'
  connection.query(sql);
  names.push(filename)
  check.push(filename)

  res.redirect('/')
});

//suppression des video du playlist des videos

app.post('/files', function (req, res) {
  var filedelete = req.body.name

  names.pop(filedelete);
  connection.query('delete from video where name="' + filedelete + '";')


  res.redirect('/')

});

//chargement du front de video player
app.get('/', function (req, res) {
  if (ok == false) {
    res.sendFile(__dirname + "/index.html");
  }
});

//retour au video player

app.get('/vidPlay', function (req, res) {

  ok = false;
  res.redirect('/')
})



console.log(ok)

server.listen(3000, () => {
  console.log('listening on *:3000');
});


module.exports = app;
