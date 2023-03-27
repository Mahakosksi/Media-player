
 
var socket = io();//chargement de socket io
var id;

 
function reload() {
    window.location.reload()
}

//un temps de pause
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loaddata() {
    socket.on('playlist', (results) => {

        id = results
        console.log(results[0]['id'])
        var playlist = document.querySelector(".play")
        for (i = 0; i < results.length; i++) {

            //pour remplir la playlist
            playlist.innerHTML = playlist.innerHTML +  "<p id='" + results[i]['id'] + "'>" + results[i]['name'] + "</p>"
        }
        const play = sessionStorage.getItem('play')
        if (play !== null) {
            console.log(play)
            var s = document.createElement('source')
            s.src = '/video/' + id[play - 1]['id']
            var videoTag = document.querySelector('video')
            videoTag.appendChild(s)
            
        }
    })
    sleep(100).then(() => { events(); });
}


async function events() {
    
    const pTab = document.querySelectorAll('p');
    const play = sessionStorage.getItem('play')
    if (play !== null) {
        pTab[play - 1].style.backgroundColor = "rgb(37,37,37)"
        pTab[play - 1].style.color = "white"
    }

    //pour avoir de la continuite, video après video 
    var stateVid = document.querySelector('video')
    stateVid.addEventListener("ended", function () {
        const play = Number(sessionStorage.getItem('play'));
        if (play <= pTab.length - 1) {
            socket.emit('title', id[play]['id'])

            sessionStorage.setItem('play', play + 1);
            window.location.reload();
        }
    });



    //pour ajouter de l'evenement pour les titre des videos
    pTab.forEach((element, index) => {
        element.addEventListener('click', (e) => {
            socket.emit('title', id[index]['id']);
            sessionStorage.setItem('play', index + 1);
            window.location.reload();

        })
    });

    //ajouter des evenements des boutons
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function () {
            return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
        }
    })
    
    document.getElementById('next').addEventListener('click', (e) => {
        const play = Number(sessionStorage.getItem('play'));
        if (play <= pTab.length - 1) {
            socket.emit('title', id[play]['id'])

            sessionStorage.setItem('play', play + 1);
            window.location.reload();
        }
        else {
            window.location.reload();
        }
    });
    //bouton previous 
    document.getElementById('previous').addEventListener('click', (e) => {
        const play = Number(sessionStorage.getItem('play')) - 1;
        if (play >= 1) {

            socket.emit('title', id[play]['id'])
            sessionStorage.setItem('play', play);
            window.location.reload();
        }
        else {
            window.location.reload();
        }
    });


    
    nbClick =1;//utiliser pour la configuration du bouton play 
    //pour ajouter un evenement au bouton play 
    document.getElementById('resume').addEventListener('click', (e) => {
        const video = document.querySelector('video');
        if(nbClick ==1){//demarrage du video
            nbClick=0;
            video.play();
            

        }
        else {//mettre la video en pausse

            if(nbClick==0){
            video.pause();
            nbClick=1;
        }
        }
        
    });
   
    //bouton delete 
    document.getElementById('dell').addEventListener('click', (e) => {
       reset();
    });
    

    //avoir des pop-up
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("addbtn");
    var span = document.querySelector(".close");
    var modals = document.getElementById("myModals");
    var btns = document.getElementById("delete");
    var spans = document.querySelector(".closes");

    //lorsque l'utilisateur clic sur le bouton, il y a ouverture du model
    btn.onclick = function () {
        modal.style.display = "block";
    }

    //pour la fermeture du pop-up
    span.onclick = function () {//span ici c'est le X pour faire sortir
        modal.style.display = "none";
    }

    //sortir du pop-up lorsque l'utilisateur click dans un autre endroit autre que le X
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    //lorsque l'utilisateur clic sur le bouton, il y a ouverture du model
    btns.onclick = function () {
        modals.style.display = "block";
    }

    //fermeture du pop-up
    spans.onclick = function () {
        modals.style.display = "none";
    }

    //sortir du pop-up lorsque l'utilisateur click dans un autre endroit autre que le X
    window.onclick = function (event) {
        if (event.target == modals) {
            modals.style.display = "none";
        }
    }
}

//reset du video selectionné apres la suppression
function reset()
{
    sessionStorage.setItem('play', 1);
}

loaddata();
