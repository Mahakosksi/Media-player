
var socket = io();
socket.on('hello', function (data) {
    console.log('c est le premier socket ');
});

var nb = 0;

//gestion des events
//event button next
document.getElementById("next").addEventListener('click', function (e) {
    console.log('vous avez clique sur la bouton next');
    nb = nb + 1;
    socket.emit('nb', nb)//emission de socket
    console.log('le numero d image affichee est : ' + nb);

});


//event button previous
document.getElementById("back").addEventListener('click', function (e) {
    console.log('Back button clicked');


});

