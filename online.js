// Dependencies
var memes = ["Tide Pod", "Doge", "Me Gusta", "Dolan", "Dat Boi", "Ugandan Knuckles", "Pedo Bear", "wat", "Ayy Lmao", "Nyan Cat", "Gnome Child", "Sad Pepe", "Feels Good Man", "Spoderman", "MonkaS", "Meatspin", "Privilege", "Mocking Spongebob", "Skull Trumpet", "He-Man", "Neck Beard", "Yee", "Deez Nuts", "Thicc", "Dab", "Salt Bae", "Spaghet", "Big Smoke", "Sanic", "2spooky", "Normie", "Bee Movie", "Reee", "Arthur Fist", "Keemstar", "Kreygasm", "Pepe", "Smug Pepe", "Kermit", "Evil Kermit", "Ben Swolo", "Kylo Ren", "Autistic Screeching", "Boi", "Angry Pepe", "Nazi Pepe", "Handsome Squidward", "VR Chat", "Big Brain", "200IQ", "Clippy", "Desk Flip", "Emoji Movie", "#metoo", "DoodleBob", "Press F", "Snapchat Hotdog", "Am I Disabled", "OK"];

var servers = [];

var allUsers = {};

var canvasPath = new Array();

var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/images', express.static(__dirname + '/images'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

io.on('connection', function(socket) {
    socket.on("new room", function(room) {
        console.log("Room "+room+" has been created");
        servers[room] = new Array();
        
    });
    
    socket.on("new player", function(data) {
        console.log("New Player joined "+ data.room);
        socket.join(data.room);
        
        allUsers[socket.id] = {
            room: data.room
        }
        
        servers[data.room].push({
            id: socket.id,
            name: data.name,
            score: 0,
            draw: true
        });
        io.in(data.room).emit('lobbyUpdate', JSON.stringify(servers[data.room]));
    });
    
    socket.on('serverCanvas', function(data){
        canvasPath = JSON.parse(data.json);
        socket.to(data.room).emit('clientCanvas', JSON.stringify(canvasPath));
    });
    
    socket.on('disconnect', function(){
        
        let room = allUsers[socket.id].room;
        
        for(let i = 0; i < servers[room].length; i++){
            if(servers[room][i].id == socket.id){
                servers[room].splice(i, 1);
                return;
            }
        }
        socket.to(room).emit('lobbyUpdate', servers[room]);
    });
});

//setInterval(function() {
 // io.sockets.emit('lobbyUpdate', players);
//}, 1000 / 1);