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
mongoose.connect('mongodb://localhost:27017/LudoDatabase')
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
//defining the places of the entry to home
//defining the places of exit of home_
//defining colors
const CONSTANTS = {
    defaultColors: ['red', 'green', 'yellow', 'blue'],
    startRed: 40,
    startGreen: 1,
    startBlue: 27,
    startYellow: 14,
    redStop: 38,
    greenStop: 51,
    yellowStop: 12,
    blueStop: 25,
    greenEntry: 100,
    yellowEntry: 110,
    blueEntry: 120,
    redEntry: 130,
    starPositions: [1, 9, 14, 22, 27, 35, 40, 48],
    timer: '',
}
let Lobby = function() {
    let lobbyNum = lobbies.length;
    this.lobbyId = "lobby" + lobbyNum.toString();
    this.players = [];
    this.lastDataUrl = null;
    this.playerOnTurn = null;
    this.movementAmount = 0;
    this.timer = null;
    this.timeLeft = null;
    this.guessedPlayers = [];
    this.allTokens = {};
    this.noPlayerChange = 0;
    //holds opponent positions
    this.oppPositions = {}

    //indicates if a player has played his turn or not
    this.hasMoved = 1;
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
            //and now he rolls the dice and so on


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
//the players who have finished wont get to roll the dice

    socket.on("roll-dice",function(id){

          var rolledNum=game.random(6);
          while(rolledNum==0)
          {
            rolledNum=game.random(6);
          }
        //  io.in(lobbies[0].lobbyId).emit('rolled',rolledNum, id);
          //shake the tokens
          //io.in(lobbies[0].lobbyId).emit('clickTokenToMove',id);

          makeRoll(lobbies[0]);

          });
          //finding all the player tokens, and throwing the random number,
          // sending to the frontend to do the animation
          async function makeRoll(lobby) {
          	//did not move yet
          		lobby.hasMoved = 0;
          		lobby.oppPositions = {};
          		let myPositions = [];
           //key will be like i- for available players
          		for (let key in lobby.allTokens) {
          			//if allTokens[i] exists-
          				if (lobby.allTokens.hasOwnProperty(key)) {
          					//set key2 from 0 to lobby.allTokens[i]-> that is color(4 colors)
          						for (let key2 in lobby.allTokens[key]) {
          							console.log("key1");
          							console.log(key);
          							console.log("key2");
          							console.log(key2);
          							//if allTokens[key][key2] exist
          								if (lobby.allTokens[key].hasOwnProperty(key2)) {

          										let val = lobby.allTokens[key][key2]
          										console.log("value of the token");
          										console.log(val);
          										//if the token is somewhere on the field
          										if (val > 0 && val < 100) {
          											//se if the player is on the turn, if not set him in the opponent position
          											//else set him in the mmy positions
          												if (key != lobby.playerOnTurn) lobby.oppPositions[val] = key2
          												else myPositions.push(val);
          										}
          								}
          						}
          				}
          		}
          		//see which tokens are inside
          		//which are outside
          		//all the tokens
          		//and the token places of the opponents
          		console.log("--------------------------------------------")
          		console.log("gottis inside")
          		console.log(lobby.tokensInside)
          		console.log("gottis inside")
          		console.log("gottis Outside")
          		console.log(lobby.tokensOutside)
          		console.log("gottis Outside")
              console.log("gottis Outside count")
          		console.log(lobby.tokensOutside.length)
          		console.log("gottis Outside count")
          		console.log("all gottis")
          		console.log(lobby.allTokens)
          		console.log("all gottis")
          		console.log("oppositions")
          		console.log(lobby.oppPositions)
          		console.log("oppositions")
          		console.log("--------------------------------------------")
              console.log("player on turn ");
              console.log(lobby.playerOnTurn);
              //console.log(lobby.players[playerOnTurn]);
              var playerOnTurn=findPlayerOnTurnIndex(lobby);
              //as he just rolled he still has to move his token
          		// await lobby.players[lobby.playerOnTurn].emit("calculateAllGottiPos", lobby.tokensOutside);
            //if(lobby.tokensOutside.length!=0)
              if (lobby.tokensOutside[playerOnTurn].length == 0) {
          				lobby.movementAmount = biasedRandom(6, 60);
                  console.log(lobby.movementAmount);
          				//sees if there is any players ahead and tries to cut it
          		} else {
          			//set all players that are o the spot
          				let biases = [];
          				myPositions.forEach(mine => {
          						for (let key in lobby.oppPositions)
          								if ((key - mine) <= 6 && (key - mine) > 0) {
          										console.log("there is someone at" + key - mine);
          										biases.push(key - mine)
          								}
          				})

          				//cuts players with 30% chance
          				if (biases.length > 0) {
          						lobby.movementAmount = biasedRandom(biases, 30)
          				} else lobby.movementAmount = biasedRandom(6, 20)
          		}
          		//send to the frontend for the animation
          		console.log("the movement amount came to be " + lobby.movementAmount)
          		lobby.players.forEach(async player => {
          			//send the player on turn(socket id and how much does he have to animate)
          			io.in(lobby.lobbyId).emit("rolled", lobby.movementAmount , lobby.playerOnTurn );
          				//samo socket emit
          		});
          		await new Promise(r => setTimeout(r, 3000));
          		await gameController(lobby);
          }


          function biasedRandom(bias, degree) {
              console.log("calling " + bias + "with " + degree + " probablilty")
              if (!Array.isArray(bias)) {
                  let temp = bias;
                  bias = []
                  bias.push(temp);
              }
              let rand = Math.random().toFixed(2);
              if (rand < (degree / 100)) {
                  rand = Math.floor(Math.random() * bias.length);
                  return bias[rand];
              } else {
                  rand = Math.ceil(Math.random() * 6);
                  return rand;
              }
          }

          //the main turn function, defines what happens after the dice roll
          async function  gameController (lobby) {
            console.log("entered the controller");
            //still the same plaeyr
              lobby.noPlayerChange = 0;
              //set the sixCount
              if (lobby.movementAmount != 6) this.sixCount = 0;
              else lobby.sixCount++;
              //if we threw the 6, we could thow again
              if (lobby.sixCount != 3) {
                console.log("six count is not 3 ");
                  //find the tokens that can be moved and add the ahke animation
                  await findMovableTokens(lobby);
                  console.log("found movable tokens");
                  console.log(lobby.movableTokens);
                    var playerOnTurn=findPlayerOnTurnIndex(lobby);
                  //waiting for the calculations to be sent from the client to the server
                  if (lobby.movableTokens.length == 0) playerIndicator(lobby);
                  else if (lobby.movableTokens.length == 1) {
                    //if there is only one token to move, move it
                      await moveToken(lobby,lobby.movableTokens[0]);
                  } else {

                    //all the tokens that can be moved
                      let movableTokensPositions = [];
                        //for each movable token add them to the list
                      lobby.movableTokens.forEach((id) => {
                          movableTokensPositions.push(lobby.allTokens[playerOnTurn][id]);
                      })
                        //move the token
                      if (lobby.tokensOutside[playerOnTurn].length == 0) await moveToken(lobby,lobby.movableTokens[0]);
                      //checks if all the available gottis are in the same position
                      else if (movableTokensPositions.every((val, i, arr) => val === arr[0])) {
                        console.log("the gottis are here ");
                          moveToken(lobby,lobby.movableTokens[0])
                      }

                  }
              } else {
                  lobby.sixCount = 0;
                  console.log("lobby in game controller");
                  console.log(lobby);
                  playerIndicator(lobby);
              }
          }
          //find all tokens that can be moved
          async function  findMovableTokens(lobby) {
            console.log("find movable tokens");
              var playerOnTurn=findPlayerOnTurnIndex(lobby);

              for (let key in lobby.allTokens[playerOnTurn]) {
                  if (lobby.allTokens[playerOnTurn].hasOwnProperty(key)) {
                      if (lobby.allTokens[playerOnTurn][key] == 0) {
                        //send him to the list
                          if (lobby.movementAmount == 6) lobby.movableTokens.push(key)
                      } else if (isOnFinishLine(lobby.allTokens[playerOnTurn][key])) lobby.movableTokens.push(key)
                  }
              }

              await io.in(lobby.lobbyId).emit("addShakeAnimation", lobby.movableTokens,lobby.playerOnTurn);
          }
          function  isOnFinishLine(currPos) {
                if (currPos >= 100) {
                    if ((currPos >= 100 && currPos + lobbies[0].movementAmount <= 105) || (currPos >= 110 && currPos + this.movementAmount <= 115) || (currPos >= 120 && currPos + this.movementAmount <= 125 || (currPos >= 130 && currPos + this.movementAmount <= 135))) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else return 2;
            }
          //moves one token from one location to another
          async function moveToken(lobby,id) {
            console.log("entered the moving token ");

            var playerOnTurn=findPlayerOnTurnIndex(lobby);
            //no one to move
              if (lobby.hasMoved == 0) {
                console.log("has moved is 0");
                //this means that the person has all players in the house
                  if (lobby.allTokens[playerOnTurn][id] == 0) {
                    console.log("get token out");
                      getTokenOut(lobby,id);
                  } else {
                      //if there are tokens outside
                      let positions = [];
                      //estimation of the positions
                      let currPos = lobby.allTokens[playerOnTurn][id];
                      let finalPos = currPos + lobby.movementAmount;

                      let result = {
                          "killed": '',
                          "powerUp": '',
                          "tokenHome": '',
                          "gameFinished": '',
                      };
                      //53 positions
                      for (let i = currPos; i <= finalPos; i++) {
                          if (i == 53) {
                              i = 1;
                              finalPos = finalPos % 52;
                          }

                          positions.push(i);
                          if (i == 105 || i == 115 || i == 125 || i == 135) {
                              //the token is home
                              result["tokenHome"] = id;
                              if (lobby.tokensInside[playerOnTurn].length == 0) {
                                  //if all the players are inside the player is finished
                                  result['gameFinished'] = playerOnTurn;
                              }
                          }

                          if (lobby.currentPlayerColor == "red" && i == CONSTANTS.redStop) {
                              finalPos = CONSTANTS.redEntry + finalPos - i - 1;
                              i = CONSTANTS.redEntry - 1;
                          } else if (lobby.currentPlayerColor == "green" && i == CONSTANTS.greenStop) {
                              finalPos = CONSTANTS.greenEntry + finalPos - i - 1;
                              i = CONSTANTS.greenEntry - 1;
                          } else if (lobby.currentPlayerColor == "blue" && i == CONSTANTS.blueStop) {
                              finalPos = CONSTANTS.blueEntry + finalPos - i - 1;
                              i = CONSTANTS.blueEntry - 1;
                          } else if (lobby.currentPlayerColor == "yellow" && i == CONSTANTS.yellowStop) {
                              finalPos = CONSTANTS.yellowEntry + finalPos - i - 1;
                              i = CONSTANTS.yellowEntry - 1;
                          }
                      }
                      console.log("moving throught positions-----------")
                      console.log(positions)
                      console.log("moving throught positions-----------")
                      lobby.allTokens[playerOnTurn][id] = positions[positions.length - 1];
                      //checing final position for any token
                      let r =100;// lobby.checkFinalPosition(lobby.allTokens[playerOnTurn][id]);
                      result['killed'] = r['killed'];
                      //for each player show the token movement
                      //lobby.players.forEach(async player => {
                      console.log("sending moving token");
                        io.in(lobby.lobbyId).emit("moveToken", id, lobby.playerOnTurn, positions, lobby.tokensInside, lobby.tokensOutside, result);
                      //});
                  }
              }
          }
          function findPlayerOnTurnIndex(lobby){
            var playerOnTurn=0;

            for(var k=0;k<lobby.players.length;k++)
            {
              console.log("player in the loop"+lobby.players[k].id);
              console.log("indeks of the lobby player on turn "+lobby.playerOnTurn);
              if(String(lobby.players[k].id)==String(lobby.playerOnTurn))
              { console.log("matched");
                  playerOnTurn=k;
                }
            }
            console.log("player indeks");
            console.log(playerOnTurn);
            return playerOnTurn;
          }

          socket.on("finishedMoving", (result) => {
            console.log("finished moving");
              //if (games[sock.roomId].players[games[sock.roomId].playerIndex].sock.id == sock.id) {
                  //console.log("finished moving" + sock.id)
                  if (result['gottiHome']) {
                      let ind =lobbies[0].tokensOutside[lobbies[0].playerOnTurn].indexOf(result['tokenHome']);// games[sock.roomId].tokensOutside [games[sock.roomId].playerIndex].indexOf(result['gottiHome']);
                      lobbies[0].tokensOutside[lobbies[0].playerOnTurn].splice(ind, 1);
                      delete lobbies[0].allTokens[lobbies[0].playerOnTurn][result['tokenHome']];
                  }
                  if (result['gameFinished']) {
                    console.log("game is finished");
                      //games[sock.roomId].winners.push(games[sock.roomId].currentPlayerColor);
                      //delete games[sock.roomId].allGottis[games[sock.roomId].playerIndex];
                      //if (Object.keys(games[sock.roomId].allGottis).length == 1) {
                        //  console.log("game really done");
                        //  gameOver(sock);
                      //}
                  }
                  if (result["killed"]) {
                      let killed = result['killed']
                      let ind = -1;
                      let killedPlayerIndex = -1;
                  //    for (let j = 0; j < games[sock.roomId].tokensOutside .length; j++) {
                    //      if (games[sock.roomId].tokensOutside [j].indexOf(killed) !== -1) {
                      //        ind = games[sock.roomId].tokensOutside [j].indexOf(killed);
                        //      killedPlayerIndex = j;
                          //    games[sock.roomId].tokensOutside [killedPlayerIndex].splice(ind, 1)
                            //  games[sock.roomId].allGottis[killedPlayerIndex][killed] = 0;
                              //games[sock.roomId].tokensInside [killedPlayerIndex].push(killed);
                              //break;
                          //}
                      //}
                  }
                  playerIndicator(lobbies[0]);
              });
          //the function that determens the next turn
          async function playerIndicator(lobby) {
              lobby.hasMoved = 1;
              var nextPlayer=0;
              lobby.movableTokens = [];
              console.log("entered indicator");
              console.log("Player change"+lobby.noPlayerChange);
                  if (lobby.noPlayerChange == 0) {
                    console.log("removing shake animation");
                    //  lobby.players.forEach(player => {
                            io.in(lobbies[0].lobbyId).emit("removeShakeAnimation", lobby.tokensInside, lobby.tokensOutside);
                      //});

                      //change to the next player
                      var playerOnTurn=findPlayerOnTurnIndex(lobby);
                      //if got 0, set it on 2
                      if(lobby.players.length==2)
                      {
                        if(playerOnTurn==0)
                        {
                          //go to the seccond
                        nextPlayer=2;
                      }else {

                        nextPlayer=0;
                      }

                      }else {
                        //if 0, the the next is 1, if its 2 the nest is 2, if its 3 the next is 3, if its 4
                        //if its 4 the next is 0
                        //if there is not a fourth meber we ask
                        if(lobby.players.length==3)
                          if(nextTurn==4){
                            nextPlayer=0;
                          }
                          else {
                                      //there are 4 members
                                  nextPlayer= (playerOnTurn + 1) % 4;
                                }

                      }
                        //while he has no more tokens make the next player be on turn
                    /*  while (!lobby.allTokens.hasOwnProperty(nextPlayer)) {
                          nextPlayer = (nextPlayer + 1) % 4;
                          console.log("next player 2:"+ nextPlayer);
                        //  console.log(nextPlayer);
                      } */
                      console.log("will change the colors now");
                       await new Promise(r => setTimeout(r, 300));
                      //set the color of the current player
                      console.log("am near to color change");
                      if (nextPlayer == 0) lobby.currentPlayerColor = "red";
                      else if (nextPlayer== 1) lobby.currentPlayerColor = "green";
                      else if (nextPlayer== 2) lobby.currentPlayerColor = "yellow";
                      else if (nextPlayer == 3) lobby.currentPlayerColor = "blue";
                      //adds highlight around home of current player
                      //lobby.players.forEach(player => {
                      console.log("next player is ");
                      console.log(nextPlayer);
                //      if(lobby.players.length==2)
                      if(lobby.players.length==2)
                        {
                          if(nextPlayer==2)
                          {
                              playerOnTurn=1;
                          }else {
                              playerOnTurn=0;
                          }
                        console.log("when there are two members the next is:"+nextPlayer+"the player on turn is:"+playerOnTurn);
                        console.log("decremented playerOnTurn"+playerOnTurn);
                      }else {
                        //if there is 3 elements, first the next meber is 1, then 2,then 3
                        playerOnTurn=nextPlayer;
                      }

                      lobby.playerOnTurn=lobby.players[playerOnTurn].id;

                          io.in(lobbies[0].lobbyId).emit("playerIndicator", lobby.currentPlayerColor, lobby.players[playerOnTurn].id);
                          io.in(lobbies[0].lobbyId).emit("updateSB", lobby.players, lobby.players[playerOnTurn].id);
                          io.in(lobbies[0].lobbyId).emit("letsDraw",  lobby.players[playerOnTurn].id);
                          io.in(lobbies[0].lobbyId).emit("letsWatch", lobby.players[playerOnTurn].id);

                      //});
                  }
              }
    socket.on('userStartedGame',function(){

      console.log("user has started the game");
      gameStarted==true;
      let availablePlayers = [0, 1, 2, 3];
      var num=lobbies[0].players.length;
      //setting the arial organisation
      if (num == 2) {
          availablePlayers = [0, 2];
      } else if (num == 3) {
          availablePlayers = [0, 2, 3];
      }else if(num==4) {
        availablePlayers = [0, 1, 2, 3];

      }

        //game is started and player count is > than 3
        //if the player count is more than 2, start the game
        //setting the colors for the players
        for (let i = 0; i < 4; i++) {
            if (availablePlayers.includes(i)) {
              console.log("The number of available player is");
              console.log(i);

                lobbies[0].allTokens[i] = {};
                for (let j = 0; j < lobbies[0].tokensInside[i].length; j++) {
                    let col = lobbies[0].tokensInside[i][j];
                    lobbies[0].allTokens[i][col] = 0;
                }
                //console.log("all tokens set ");
                //console.log(lobbies[0].allTokens);

              //  g.players[i] = temp[j];
              //add color for every player
              if(availablePlayers.length==2)
              if(i==2){
                lobbies[0].players[1].playerColor = CONSTANTS.defaultColors[i];
            }else {
              lobbies[0].players[i].playerColor = CONSTANTS.defaultColors[i];

        }
      }
    }

          if (lobbies[0].players.length >= 2) {
            //setting the drawer
            lobbies[0].playerOnTurn = lobbies[0].players[0].id;
              // result=next_turn(lobbies[0]);

            //  console.log("result of the next turn");
              //console.log(result);
          }
          //player.sock.emit("startGame", g.powerUpsLocation, availablePlayers, g.tokensInside, playerIds, names)
            //for every p;ayer send to his sock  availablePlayers, g.tokensInside, playerIds, names
                io.in(lobbies[0].lobbyId).emit("startGame",  availablePlayers, lobbies[0].tokensInside,lobbies[0].players );

            //setting ither players to watch when a player is made a drawer
            //availablePlayers, g.tokensInside, playerIds, names
          //  io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].playerOnTurn,availablePlayers, lobbies[0].lastDataUrl,lobbies[0].tokensInside);
          //  io.to(socket.id).emit('makeaguess', lobbies[0].playerOnTurn);

      io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].playerOnTurn);
    });

    function getTokenOut(lobby,id)
    {
      if (lobby.hasMoved == 0) {
        var playerOnTurn=findPlayerOnTurnIndex(lobby);
          //niskeko gotti lai tokensOutside  ko array ma append garni
          let ind = lobby.tokensInside [playerOnTurn].indexOf(id);
          if (ind >= 0) lobby.tokensInside [playerOnTurn].splice(ind, 1)
          lobby.tokensOutside [playerOnTurn].push(id)
          let position = 0;
          if (id.includes("red")) position = CONSTANTS.startRed
          else if (id.includes("green")) position = CONSTANTS.startGreen
          else if (id.includes("blue")) position = CONSTANTS.startBlue
          else position = CONSTANTS.startYellow;
          console.log("position is " +position);
          lobby.allTokens[playerOnTurn][id] = position;
          lobby.players.forEach(async player => {
                io.in(lobby.lobbyId).emit("getTokenOut", id, position, lobby.tokensInside , lobby.tokensOutside )
          });
      }
    }



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
                  //  next_turn(currLobby);
                  playerIndicator(currLobby);
                } else {
                  //not relevant now
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
