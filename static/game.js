function getQueryStringValue (key) {  
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}

function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

var socket = io('localhost:5000/');

var room;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickColor = new Array();

var paint;
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";

var curColor = colorGreen;

var serverNames = [];

    serverNames[0] = ["Apricot", "Avocado", "Banana", "Billberry", "Blackberry", "Blueberry", "Durian", "Date", "Elderberry", "Pineapple"];

    serverNames[1] = ["MountainBeaver", "Cow", "Goat", "Elephant", "Donkey", "Monkey", "Jaguar", "Rat", "Sheep", "Mouse", "Giraffe", "Kangaroo"];


var nickname = serverNames[0][getRandomInt(serverNames[0].length)];

$(function(){
    
    room = getQueryStringValue("room");

    if(room.length < 3){
        room = serverNames[0][getRandomInt(serverNames[0].length)] +   serverNames[1][getRandomInt(serverNames[1].length)];

        socket.emit('new room', room);
    }

    socket.emit('new player', {name: nickname, room: room});

    socket.on('lobbyUpdate', function(players){
        players = JSON.parse(players);

        let out = "";

        for(var id in players){
            out += "<h2>"+players[id].name+"</h2>";
        }

        $("#players").html(out);
    });
    
    $("#nickname").val(nickname);
    
    $("#invite").val("localhost:5000/?room="+room);
    
    $("#copy").click(function(){
        $("#invite").select();
        document.execCommand("copy");
    })
    
    
    $("#start").click(function(){
         context = document.getElementById('canvas').getContext("2d");

        $('#canvas').mousedown(function(e){
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;

            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();

        });

        $('#canvas').mousemove(function(e){
            if(paint){
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                redraw();
                let path = [clickX, clickY, clickDrag, clickColor];
                socket.emit('serverCanvas', {json: JSON.stringify(path), room: room});
            }
        });

        $('#canvas').mouseup(function(e){
            paint = false;


        });

        $('#canvas').mouseleave(function(e){
            paint = false;
        });

        function addClick(x, y, dragging)
        {
            clickX.push(x);
            clickY.push(y);
            clickDrag.push(dragging);
            clickColor.push(curColor);
        }

        function redraw(){
            context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

            //context.strokeStyle = "#df4b26";
            context.lineJoin = "round";
            context.lineWidth = 5;

        for(var i=0; i < clickX.length; i++) {	

            context.beginPath();

            if(clickDrag[i] && i){
                context.moveTo(clickX[i-1], clickY[i-1]);
            }else{
                context.moveTo(clickX[i]-1, clickY[i]);
            }
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.strokeStyle = clickColor[i];
                context.stroke();
            }
        }

        socket.on('clientCanvas', function(data){
            let path = JSON.parse(data);

            clickX = path[0];
            clickY = path[1];
            clickDrag = path[2];
            clickColor = path[3];

            redraw();


        });
    });
    
    
    
    

   
});

