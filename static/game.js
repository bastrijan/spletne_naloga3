/*jshint esversion: 6 */

(function() {
    let socket = io();
    "use strict"; // jshint ignore:line
    //https://www.reddit.com/r/discordapp/comments/4ytdf0/where_are_sound_files_stored/
    let joinSound = new Audio('static/sfx/joinSound.mp3');
    let disconnectSound = new Audio('static/sfx/disconnectSound.mp3');
    //http://soundbible.com/tags-tick.html
    let tick = new Audio('static/sfx/tick.mp3');
    //https://www.freesoundeffects.com/cat/correct-292/
    let correct = new Audio('static/sfx/correct.mp3');
    //https://www.youtube.com/watch?v=4k8XfsqkU3o
    let nextTurn = new Audio('static/sfx/nextTurn.mp3');

    let alphanumeric = /^[0-9a-zA-Z]+$/;
    let userCount=0;
    let mainSock=0;
    let msgID = document.getElementById('msgID');
    msgID.addEventListener('keyup', function onEvent(e) {
        if (e.keyCode === 13) {
          if(msgID.value[0]=="@")
          {
            if((msgID.value[1]=="e")&&(msgID.value[2]=="v")&&(msgID.value[3]=="e")&&(msgID.value[4]=="r")&&(msgID.value[5]=="y")&&(msgID.value[6]=="o")&&(msgID.value[7]=="n")&&(msgID.value[8]=="e"))
            {
              socket.emit("publicMessage", msgID.value.toLowerCase(),socket.id);
            }
          }
            if (msgID.value.match(alphanumeric)) {
                msgID.placeholder = "What is your guess?";

                socket.emit("guess", msgID.value.toLowerCase());
                msgID.value = "";
            } else {
                msgID.placeholder = "invalid input";
                msgID.value = "";
            }
        }
    });
    //hiding elements on login

    hideClass(document.getElementsByClassName("msg"));
    hideClass(document.getElementsByClassName("start-btn"));
    hideClass(document.getElementsByClassName("info"));

    hideClass(document.getElementsByClassName("Canvas"));
    hideClass(document.getElementsByClassName("chat-section"));

    hideClass(document.getElementsByClassName("type_me"));
    hideClass(document.getElementsByClassName("type_normal"));
    hideClass(document.getElementsByClassName("type_private"));
    hideClass(document.getElementsByClassName("type_right"));
    hideClass(document.getElementsByClassName('btn-start-Another'));
    hideClass(document.getElementsByClassName(' registration-login'));
    //have to create the login logic here(when loggedIn)
    let usernameID = document.getElementById('usernameID');
    let startAnotherBtn=document.getElementById('start-game-btn');

    var regisertForm= document.getElementById('registerForm');
    var loginForm= document.getElementById('loginForm');
    var startBtn= document.getElementById('start-game-btn');
    var switchToRegister=document.getElementById('createAccount');
    var switchToLogin=document.getElementById('switchToLogin');


function registrationFun(username,password)
{
  debugger;
//  var username=username;
  //var password=password;

//add user
  $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/register/',
    //  contentType: "application/json",
  data: {username:username,password:password},//JSON.stringify(Status),
    //dataType: "json",
      //$.toJSON({ sendData: dataPackage })
      success: function(data){
        //redirect to login
        debugger;
          alert("The user has been succesfully created! ");

          window.location.assign('http://localhost:3000/');
        //change the value of the field that was changed
        //  location.reload();
    },          error: function(XMLHttpRequest, textStatus, errorThrown) {
                    debugger;
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
                }

  });

}
function loggedInFunction(data) {
//  usernameID.addEventListener('keyup', function onEvent(e) {
  //    if (e.keyCode === 13) {
    //      if (usernameID.value.match(alphanumeric)) {

              document.getElementsByClassName("login-section")[0].style.display = "none";
              showClass(document.getElementsByClassName("Canvas"));
              document.getElementsByClassName("Canvas")[0].style.display = "flex";
              //showClass(document.getElementsByClassName("utils"));
              //this is where we emit the new player
              hideClass(document.getElementsByClassName("start-btn"));
              socket.emit('newPlayer',data.username/* usernameID.value*/);
              //showClass(document.getElementsByClassName("word"));
              showClass(document.getElementsByClassName("info"));
              //showClass(document.getElementsByClassName("drawing"));
              showClass(document.getElementsByClassName("chat-section"));


          }



function loginFun(username,password)
{
  //event.preventDefault();
	debugger;
	//username or password(mainly username for now )

//add user
  $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/login/',
    //  contentType: "application/json",
  data: {username:username,password:password},
  success:function(data){
    debugger;
  loggedInFunction(data);
},
error: function()
{
  alert("incorrect password");
}
			//JSON.stringify(Status),
});
}
//start game
switchToRegister.addEventListener('click',function(e){
  debugger;
  hideClass(document.getElementsByClassName("login-login"));
  showClass(document.getElementsByClassName("registration-login"));
});
switchToLogin.addEventListener('click',function(e){
  debugger;
  showClass(document.getElementsByClassName("login-login"));
  hideClass(document.getElementsByClassName("registration-login"));
});
startBtn.addEventListener('click',function(e){
e.preventDefault();
if(userCount>=3)
{
  //socket.emit('view');
  socket.emit('userStartedGame');
}else {
  alert("Not enough players to start. Must be more than 2 players to start the game.");
}
});

startAnotherBtn.addEventListener('click',function(e){
e.preventDefault();
if(userCount>=3)
{

                document.getElementsByClassName("login-section")[0].style.display = "none";
                showClass(document.getElementsByClassName("utils"));
                //this is where we emit the new player
                hideClass(document.getElementsByClassName("start-btn"));
                socket.emit('newPlayer',data.username/* usernameID.value*/);
                showClass(document.getElementsByClassName("word"));
                showClass(document.getElementsByClassName("info"));
                showClass(document.getElementsByClassName("drawing"));
                showClass(document.getElementsByClassName("chat-section"));

  //socket.emit('view');
//  socket.emit('userStartedGame');
}else {
  alert("Not enough players to start. Must be 2 or more players for the game to start.");
}
});
regisertForm.addEventListener("submit",function(e){


e.preventDefault();
  registrationFun(this.email.value,this.password.value)
});
loginForm.addEventListener("submit",function(e){
debugger;
e.preventDefault();
  loginFun(this.email.value,this.password.value)
});

    function hideClass(cls) {
        for (let elem of cls) {
          debugger;
            elem.style.display = "none";
        }
    }

    function showClass(cls) {
        for (let elem of cls) {
            elem.style.display = "initial";
        }
    }

    socket.on('joinSound', function() {
      userCount+=1;
        joinSound.play();
    });

    socket.on('disconnectSound', function() {
        userCount-=1;
        disconnectSound.play();
    });

    socket.on('nextTurn', function() {
        nextTurn.play();
    });
    socket.on('incommingMessage',function(message,username){
      var chat=document.getElementsByClassName('chat_content_inner')[0];
      var currTime=new Date(Date.now()).toLocaleString();
      var html='<div class="chat_message type_normal cf"><p class="message"> '+username+" worte: "+message+" at "+currTime+'</p></div>';
      var htmlObj=$(html);
      chat.append(htmlObj[0]);
  });

    function fillTheModal(data)
    {
      debugger;
      //change the title
      //$("#exampleModalLongTitle").val=data.username;
document.getElementById("exampleModalLongTitle").innerHTML=data.username;
document.getElementById("gamesPlayed").innerHTML="Games Played: "+data.gameCount;
document.getElementById("gamesGuessed").innerHTML="Game Count: "+data.gameCount;
document.getElementById("generalScore").innerHTML="General score: "+data.score;

      //show the modal
      $("#playerStatModal").modal('toggle'); //see here usage

    }
    socket.on('updateSB', function(players, drawingPlayer) {
        let turns = document.getElementById('turnsID');
        turns.innerHTML = '';
        var i=0;
        for (let player of players) {
            let div = document.createElement('div');
            div.className = 'playerCard';
            // div.data-toggle="modal";
            //div.data-target="#exampleModalCenter"
            //id of the div
            //div.id='playerCard_'+player.id;

            if (player.id == drawingPlayer) {
                div.id = 'drawingPlayerCard';
            }
            div.innerHTML =
                '<div class="scoreBoard">' +
                '<div>' + player.username + '</div>' +
                '<div>' + player.score + '</div>' +
                '</div>' +
                '<div class="arrowRight"></div>';
            turns.appendChild(div);
              //add event listener to this playerCard
              var playerProfileClick=document.getElementsByClassName('playerCard');

              playerProfileClick[i].addEventListener('click', function onEvent(e) {
                //send ajax call that opens a webpage with the player info
                debugger;
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:3000/userProfile/',
                  //  contentType: "application/json",
                data: {username:player.username},
                success:function(data){
                  //all stat
                  debugger;
                fillTheModal(data);

              },
              error: function()
              {
                alert("incorrect password");
              }
                    //JSON.stringify(Status),
              });
            });
            i++;
        }

        //end card
        let end = document.createElement('div');
        end.className = 'endOfRound';
        end.innerHTML = '<div>END OF ROUND!</div>';
        turns.appendChild(end);
    });

    socket.on('guessRes', function(res) {
        if (res == "CORRECT!")
        {
          //set timer to 10 secconds
            correct.play();
        }
    });

    socket.on('timer', function(timeleft) {
      debugger;
      console.log(timeleft);
        infoElem = document.getElementById('infoID');
        infoElem.setAttribute('style', 'white-space: pre;');
        infoElem.textContent = timeleft + "\r\nSECONDS\r\nREMAINING!";
        if (parseInt(timeleft) <= 5) {
            tick.play();
        }
    });
    socket.on('boradcastAnsweredWord',function(username,word){
      //say who anwered the questions correctly
      debugger;
    var chat=document.getElementsByClassName('chat_content_inner')[0];
    var html='<div class="chat_message type_normal cf"><p class="message"> '+username+' just guessed correctly the word '+word+'</p></div>';
    var htmlObj=$(html);
    chat.append(htmlObj[0]);

    });
    socket.on('waiting', function() {

        infoElem = document.getElementById('infoID');
        infoElem.setAttribute('style', 'white-space: pre;');
        infoElem.textContent = "WAITING FOR\r\nADDITIONAL\r\nPLAYERS...";
    });
    socket.on('firstPlayer',function(sockId){
      mainSock=sockId;

    });
    socket.on('waitingToStart', function(socketid) {
  //    console.log('waiting to start');
    //  console.log(socket.id);

      debugger;
      if(mainSock===socket.id){ //socket.id==leaderSocket){
        mainSock=socket.id;
        showClass(document.getElementsByClassName("start-btn"));
        //infoElem = document.getElementById('infoID');
        //infoElem.setAttribute('style', 'white-space: pre;');
        //infoElem.textContent = "YOUR SOCKET"+socket.id+"LEADER SOCKET"+leaderSocket;
        //showClass(document.getElementsByClassName("start-btn"));
    }else{
      hideClass(document.getElementsByClassName("start-btn"));
        infoElem = document.getElementById('infoID');
        infoElem.setAttribute('style', 'white-space: pre;');
        infoElem.textContent = "WAITING FOR\r\nPLAYER TO\r\n START THE\r\nGAME\r\n";
      }
    });
    socket.on('gameFinished',function(){
      console.log("the game is finished");
      var infoHeaderBig=document.getElementsByClassName('all_elems')[0];
        infoHeaderBig.innerHTML='';
        infoHeaderBig.innerHTML='<h1 align="center">The game has been finished.Want to have another one.<h1>';
        //infoHeaderBig.innerHTML='  <button type="submit" class="btn btn-primary btn-block">play another game</button>';
        showClass(document.getElementsByClassName('btn-start-Another'));

    });
    socket.on('letsWatch', function(leaderSocket, dataURL) {
        if (socket.id != leaderSocket) {
            showClass(document.getElementsByClassName("msg"));
        }
    });


    socket.on('letsDraw', function(word) {

        showClass(document.getElementsByClassName("utils"));
        hideClass(document.getElementsByClassName("msg"));



        // canvas drawing functions base code from
        // http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/ and
        // https://github.com/ThierrySans/CSCC09/blob/master/lectures/02/src/html5/js/draw.js
        let clickX = [];
        let clickY = [];
        let clickDrag = [];
        let clickColor = [];
        let clickSize = [];
        let paint = false;
        let currentColor = "#000000";
        let currentSize = 4;



        function addClick(x, y, dragging) {
            clickX.push(x);
            clickY.push(y);
            clickDrag.push(dragging);
            clickColor.push(currentColor);
            clickSize.push(currentSize);
        }


        let undoLast = function() {
            clickX.pop();
            clickY.pop();
            clickDrag.pop();
            clickColor.pop();
            clickSize.pop();
            redraw();
        };

        let changeColor = function() {
            currentColor = this.value;
        };

        let setSizeSmall = function() {
            currentSize = 2;
        };

        let setSizeRegular = function() {
            currentSize = 4;
        };

        let setSizeBig = function() {
            currentSize = 8;
        };

        // function base code from
        // https://stackoverflow.com/questions/79816/need-javascript-code-for-button-press-and-hold
        function heldDown(btn, action, initial, start = initial) {
            let t;

            let repeat = function() {
                action();
                t = setTimeout(repeat, start);
                if (start > 8)
                    start = start / 2;
            };

            btn.onmousedown = function() {
                repeat();
            };

            btn.onmouseup = function() {
                clearTimeout(t);
                start = initial;
            };

            btn.onmouseleave = btn.onmouseup;
        }

    });

})();
