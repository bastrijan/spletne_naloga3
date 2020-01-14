/*jshint esversion: 6 */

let startTime = Date.now();

// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
var ejs=require('ejs');
var mongoose=require('mongoose');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;
var dbo=require('./dbOperations');
var game = require("./controller");

var bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI || "mongodb://heroku_nft10gvf:822nen9r3b8inasjmj2bg8ks0h@ds049548.mlab.com:49548/heroku_nft10gvf";
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection;

//connecting to the database
// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/DrawAndGuessGame')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

    // Starts the server.
    server.listen(port, function() {
        console.log('Server started on port ' + port);
    });

// number of words in database

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.set("view engine", "ejs");
app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));

// Routing
app.get('/', function(request, res) {
  //try to get login in index
    res.render(path.join(__dirname + '/static', 'index'));
});
//app.post('/login/',function(req, res){
  //the data comming from the form
  //console.log("request");
  //console.log(req.body);
app.post("/login/",game.login);
app.post('/register/',game.join);
//app.post('/userProfile/',game.userProfile);
app.post('/userProfile/',game.getStats);
let lobbies = [];
var gameStarted=false;
const CONSTANTS = {
    defaultColors: ['red', 'green', 'yellow', 'blue']
}
let Lobby = function() {
    let lobbyNum = lobbies.length;
    this.lobbyId = "lobby" + lobbyNum.toString();
    this.players = [];
    this.lastDataUrl = null;
    this.playerOnTurn = null;
    this.timer = null;
    this.timeLeft = null;
    this.guessedPlayers = [];
    this.allTokens = {};

    //in the beginning everyone is in the house
    this.tokensInside = [
        ['red1', 'red2', 'red3', 'red4'],
        ['green1', 'green2', 'green3', 'green4'],
        ['yellow1', 'yellow2', 'yellow3', 'yellow4'],
        ['blue1', 'blue2', 'blue3', 'blue4']
    ];
    this.tokensOutside = [
        [],
        [],
        [],
        []
    ];
    this.movableTokens = [];
    //indicates if a player has played his turn or not
    this.hasMoved = 1;
    this.noPlayerChange = 0;
    //holds opponent positions
    this.oppPositions = {}
};

let playerLobbies = {};

//with the socket.emit we communicate between the frontend and the backend

// Add the WebSocket handlers
io.on('connection', function(socket) {
    socket.on('newPlayer', function(username) {
      var result;
      //if there are no rooms, create one
        if (lobbies.length == 0) {
            lobbies.push(new Lobby());
        } else if (lobbies[0].players.length == 8) {
            //if there are 8 players remove room
            lobbies.splice(0, 0, new Lobby());
        }
        //join the room
        socket.join(lobbies[0].lobbyId);
        //add a player to the room and add a sound on entrance
        console.log(username + " connected!");
        lobbies[0].players.push({ id: socket.id, username: username, score: 0 });
        io.in(lobbies[0].lobbyId).emit('joinSound');
        playerLobbies[socket.id] = lobbies[0];
        //if there are less then 3 players in the room, add forplay
        if (lobbies[0].players.length <2 ) {
            lobbies[0].playerOnTurn = lobbies[0].players[0].id;//socket.id;
            console.log("set the player as the first one");
            console.log(lobbies[0].players[0].username);

            console.log("waittin to start, this player is going to start the game ");
            console.log(lobbies[0].players[0].id);
            console.log("current socket id ");
            console.log(socket.id);

            //change lets draw
            io.to(lobbies[0].playerOnTurn).emit('letsDraw');


            if(lobbies[0].players.length==1)
                  {
                    io.in(lobbies[0].lobbyId).emit('firstPlayer',lobbies[0].players[0].id);
                    //io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
                  }

              io.in(lobbies[0].lobbyId).emit('waitingToStart',socket.id);

          //}
        }
        else if(gameStarted==false){
          //lobbies[0].playerOnTurn = lobbies[0].players[0].id;//socket.id;
          //console.log("player that starts the game is: ");
          //console.log(lobbies[0].players[0].username);
          //emit ti the frontend that we are waitting for player to start the game
        //  io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
          //gameStarted=true;
        //  io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
        io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
        }
        io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].players[0].id);

        //not good(have to set game started socket on method)

         /*else {

          //if the player count is more than 3, start the game
            if (lobbies[0].players.length >= 3) {
              //setting the drawer
                 result=next_turn(lobbies[0]);
                console.log("result of the next turn");
                console.log(result);
            }

            if(result==1)
            {
              //if result is 1(the game finish code-exit the game)
              return 0;
            }
              //setting ither players to watch when a player is made a drawer
              io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].playerOnTurn, lobbies[0].lastDataUrl);
              io.to(socket.id).emit('makeaguess', lobbies[0].playerOnTurn);
        }
        io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].playerOnTurn);
    */});
    socket.on('publicMessage',function(message,id){
      //  var player=lobbies[0].players[socket.id];
        for(var k=0;k<lobbies[0].players.length;k++)
        {
          if(socket.id==lobbies[0].players[k].id)
          {
            console.log(lobbies[0].players[k]);

            io.in(lobbies[0].lobbyId).emit('incommingMessage', message,lobbies[0].players[k].username);
          }
        }

    });

        socket.on("roll-dice",function(id){
          var rolledNum=game.random(6);
          while(rolledNum==0)
          {
            rolledNum=game.random(6);
          }
          io.in(lobbies[0].lobbyId).emit('rolled',rolledNum, id);
          for(var k=0;k<lobbies[0].players.length;k++)
          {

            if(id=lobbies[0].players[k].id)
            {
              io.in(lobbies[0].lobbyId).emit('broadcastNumber', rolledNum,lobbies[0].players[k].username);
            }
          }
          //find a random number for the player on turn and notify all the players afterwards
          //get gif for the dice number that has been rolled

          console.log("player rolled");
        });

/*    socket.on("roll",()=>{
      if (
        games[socket.roomId].hasMoved == 1 && games[sock.roomId].players[games[sock.roomId].playerIndex].sock.id === sock.id) {

          games[socket.roomId].players[games[sock.roomId].playerIndex].sock.emit("removeTokenShake", "");
          games[socket.roomId].makeRoll();
      }
    }); */
    socket.on('userStartedGame',function(){

      console.log("user has started the game");
      gameStarted==true;
      let availablePlayers = [0, 1, 2, 3];
      var num=lobbies[0].players.length;

      if (num == 2) {
          availablePlayers = [0, 2];
      } else if (num == 3) {
          availablePlayers = [0, 2, 3];
      }

        //game is started and player count is > than 3
        //if the player count is more than 2, start the game
        //setting the colors for the players
        for (let i = 0; i < 4; i++) {
            if (availablePlayers>i) {
              console.log("The number of available player is");
              console.log(i);
                lobbies[0].allTokens[i] = {};
                for (let j = 0; j < lobbies[0].tokensInside[i].length; j++) {
                    let col = lobbies[0].tokensInside[i][j];
                    lobbies[0].allTokens[i][col] = 0;
                }


              //  g.players[i] = temp[j];
              //add color for every player
                lobbies[0].players[i].playerColor = CONSTANTS.defaultColors[i];
            }
        }

          if (lobbies[0].players.length >= 2) {
            //setting the drawer
            lobbies[0].playerOnTurn = lobbies[0].players[0].id;
              // result=next_turn(lobbies[0]);

            //  console.log("result of the next turn");
              //console.log(result);
          }
          //player.sock.emit("startGame", g.powerUpsLocation, availablePlayers, g.gottisInside, playerIds, names)
            //for every p;ayer send to his sock  availablePlayers, g.gottisInside, playerIds, names
                io.in(lobbies[0].lobbyId).emit("startGame",  availablePlayers, lobbies[0].tokensInside,lobbies[0].players );

            //setting ither players to watch when a player is made a drawer
            //availablePlayers, g.tokensInside, playerIds, names
          //  io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].playerOnTurn,availablePlayers, lobbies[0].lastDataUrl,lobbies[0].tokensInside);
          //  io.to(socket.id).emit('makeaguess', lobbies[0].playerOnTurn);

      io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].playerOnTurn);
    });

    socket.on('view', function(dataURL) {
        let currLobby = playerLobbies[socket.id];
        if (currLobby) {
            currLobby.lastDataUrl = dataURL;
            io.in(currLobby.lobbyId).emit('letsWatch', socket.id, dataURL);
        }
    });



    socket.on('disconnect', function() {
        let currLobby = playerLobbies[socket.id];
        if (!currLobby) return;
        let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
        console.log(currLobby.players[i].username + " disconnected!");
        currLobby.players.splice(i, 1);
        io.in(currLobby.lobbyId).emit('disconnectSound');

        if (socket.id == currLobby.playerOnTurn) {
            currLobby.lastDataUrl = null;
            if (currLobby.players.length > 0) {
                clearInterval(currLobby.timer);
                clearInterval(currLobby.timeLeft);
                if (i < currLobby.players.length)
                    currLobby.playerOnTurn = currLobby.players[i].id;
                else
                    currLobby.playerOnTurn = currLobby.players[0].id;
                //let rnd = Math.floor(Math.random() * totalWords);
        ///        collection.findOne({ _id: rnd }, (err, res) => {
          //          if (err) return console.error(err);
                    io.to(currLobby.playerOnTurn).emit('letsDraw');
            //        currLobby.word = res.word;
              //      currLobby.guessedPlayers = [];
                //});
                if (currLobby.players.length > 1) {
                    io.in(currLobby.lobbyId).emit('letsWatch', currLobby.playerOnTurn, currLobby.lastDataUrl);
                    io.in(currLobby.lobbyId).emit('makeaguess', currLobby.playerOnTurn);
                    next_turn(currLobby);
                    io.in(currLobby.lobbyId).emit('timer', "180");
                } else {
                    io.in(currLobby.lobbyId).emit('waiting');
                    let j = lobbies.map(function(e) { return e.lobbyId; }).indexOf(currLobby.lobbyId);
                    lobbies.splice(j, i);
                    lobbies.splice(0, 0, currLobby);
                }
            } else {
                lobbies = lobbies.filter(function(lobby) {
                    return lobby.lobbyId != currLobby.lobbyId;
                });
            }
        }

        if (currLobby.players.length < 2) {
            clearInterval(currLobby.timer);
            clearInterval(currLobby.timeLeft);
            io.in(currLobby.lobbyId).emit('waiting');
        }

        io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.playerOnTurn);
    });
});

function next_turn(lobby) {
  //set an interval for the round and add function to it
    lobby.timer = setInterval(function() {
      //map players in lobby
        let i = lobby.players.map(function(e) { return e.id; }).indexOf(lobby.playerOnTurn);
        lobby.lastDataUrl = null;
        console.log("***player map(current position)***");
        console.log(i);

        if (i < lobby.players.length - 1) {
          //if we have 3 players, i is 1(1<3-1),
          //not the last player(let the next player be the drawer)

            lobby.playerOnTurn = lobby.players[i+1].id;
            console.log("***player on turn****");
            console.log(lobby.playerOnTurn);

        } else {
          //last player
            console.log("last player");
            console.log("***all players in the game***");
            console.log(lobby.players);
            var wonCount;
            //save the data of the players current game in the database
            for(var j=0;j<lobby.players.length;j++)
            {
              wonCount=0;
              //getting the players that guessed correctly(won a round)
              for (var k=0;k<lobby.guessedPlayers.length;k++)
              {
                //checking the socket.id-s
                if(lobby.guessedPlayers.guessedPlayers[k]==lobby.players[j].id)
                  wonCount++;

              }
              console.log("***changing the players game status***");
              dbo.saveScore(lobby.players[j].username,lobby.players[j].score,wonCount);
            }

            //send to frontend that the game is finished(add styles and scoreboard)
            io.in(lobbies[0].lobbyId).emit('gameFinished');

            return 1;
        //    lobby.playerOnTurn = lobby.players[0].id;
          //  console.log("***drawing player****");
          //  console.log(lobby.playerOnTurn);
        }
        //emit to the current playerReady
        io.to(lobby.playerOnTurn).emit('letsDraw');


        //player who has drawen now watches
        io.in(lobby.lobbyId).emit('letsWatch', lobby.playerOnTurn, lobby.lastDataUrl);
        //io.in(lobby.lobbyId).emit('makeaguess', lobby.playerOnTurn);
        io.in(lobby.lobbyId).emit('updateSB', lobby.players, lobby.playerOnTurn);
        io.in(lobby.lobbyId).emit('nextTurn');
    }, 60000);

    //setting the timer
    lobby.timeLeft = setInterval(function() {

        let timeleft = (180 - Math.ceil((Date.now() - startTime - lobby.timer._idleStart) / 1000));
        io.in(lobby.lobbyId).emit('timer', timeleft.toString());
    }, 1000);
    return 0;

}
