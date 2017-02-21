/* User Definable Variables */
var numOfCtrlPoints = 22;
var quality = 100 + (10 * numOfCtrlPoints); // how many lines are used to model the curve
var framerate = 30; // fps (only applies when moving control points)
var animationTime = 5; // in seconds
/* End User Definable Variables */

// Kelly's 22 distinct colors:
var colors = ["#E25822", "#222222", "#F3C300", "#875692", "#F38400", "#A1CAF1", "#BE0032",
	"#C2B280", "#848482", "#008856", "#E68FAC", "#0067A5", "#F99379", "#604E97", "#F6A600",
	"#B3446C", "#DCD300", "#882D17", "#8DB600", "#654522", "#2B3D26", "#F2F3F4"]; // (Not mine)

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
var points = [];
var curvePoints = [];
var pointer = {};
var pointHeld = null;
var moveInterval = null;
var animationInterval = null;
var animationProgress = 0;

initCtrlPoints();

ctx.strokeStyle = "black";
ctx.fillStyle = "black";
ctx.font = "20px Verdana";
ctx.lineWidth = 2;
drawFrame();

canvas.addEventListener("mousedown", function(event) {
	if (moveInterval) {
		clearInterval(moveInterval);
		moveInterval = null;
	}
	if (animationInterval) {
		return;
	}
	for (var n = 0; n < points[0].length; n++) {
		if (distanceBetween(pointer, points[0][n]) <= 10) {
			pointHeld = n;
			moveInterval = setInterval(drawFrame, 1000/framerate);
			return;
		}
	}
});
canvas.addEventListener("mouseup", function(event) {
	pointHeld = null;
	if (moveInterval) {
		clearInterval(moveInterval);
		moveInterval = null;
	}
});
window.addEventListener("keyup", function(event) { // having this event listener on the canvas didn't work
	function reset() {
		if (moveInterval) {
			clearInterval(moveInterval);
			moveInterval = null;
		}
		if (animationInterval) {
			clearInterval(animationInterval);
			animationInterval = null;
			animationProgress = 0;
		}
	}

	switch (event.keyCode) {
		case 65: // Key A (Animate)
			reset();
			animationProgress = 0;
			curvePoints = [];
			animationInterval = setInterval(drawFrame, 1000/(quality/animationTime));
			break;
		case 87: // Key W (Randomize)
			reset();
			for (var n = 0; n < points[0].length; n++) {
				points[0][n] = {x: Math.floor(Math.random()*(canvas.width + 1)), y: Math.floor(Math.random()*(canvas.height + 1))};
			}
			drawFrame();
			break;
		case 82: // Key R (Reset)
			reset();
			initCtrlPoints();
			drawFrame();
			break;
	}
});
canvas.addEventListener("mousemove", function(event) {
	pointer.x = event.clientX;
	pointer.y = event.clientY;
});

function drawFrame() {
	if (moveInterval) {
		points[0][pointHeld].x = pointer.x;
		points[0][pointHeld].y = pointer.y;
	}
	
	ctx.fillStyle = "#f9f3d8";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = "black";
	if (!animationInterval) {
		curvePoints = [];
		for (var n = 0; n < quality + 1; n++) { // Calculate entire curve.
			curvePoints.push(getPointAlongCurveAt(n/quality));
		}
		
		ctx.fillText("You can click & drag points. A = Animate, W = Random, R = Reset.", 10, 30);
	} else {
		curvePoints.push(getPointAlongCurveAt(animationProgress/quality));
	}
	ctx.fillText("Made By: Tom Burris", canvas.width - 220, canvas.height - 10);
	
	ctx.beginPath(); // (draw) Anchor points.
	ctx.moveTo(points[0][0].x + 5, points[0][0].y);
	ctx.arc(points[0][0].x, points[0][0].y, 5, 0, 2 * Math.PI);
	ctx.moveTo(points[0][numOfCtrlPoints+1].x + 5, points[0][numOfCtrlPoints+1].y);
	ctx.arc(points[0][numOfCtrlPoints+1].x, points[0][numOfCtrlPoints+1].y, 5, 0, 2 * Math.PI);
	ctx.fill();
	
	ctx.beginPath(); // (draw) Control Points.
	for (var n = 1; n < numOfCtrlPoints + 1; n++) {
		ctx.moveTo(points[0][n].x + 10, points[0][n].y);
		ctx.arc(points[0][n].x, points[0][n].y, 10, 0, 2 * Math.PI);
	}
	ctx.stroke();
	
	ctx.beginPath(); // (draw) Handles.
	ctx.setLineDash([6, 18]);
	for (var n = 0; n + 1 < points[0].length; n++) {
		ctx.moveTo(points[0][n].x, points[0][n].y); // have this to prevent it acting like one continuous thread when moved.
		ctx.lineTo(points[0][n+1].x, points[0][n+1].y);
	}
	ctx.stroke();
	ctx.setLineDash([]);
	
	if (animationInterval) {
		ctx.beginPath(); // (draw) Constructor lines.
		for (var i = 1; i < points.length; i++) {
			ctx.strokeStyle = colors[(i-1) % 22];
			ctx.fillStyle = ctx.strokeStyle;
			ctx.beginPath();
			ctx.moveTo(points[i][0].x, points[i][0].y);
			for (var n = 1; n < points[i].length; n++) {
				ctx.lineTo(points[i][n].x, points[i][n].y);
			}
			ctx.stroke();
			ctx.beginPath();// (draw) Constructor points.
			for (var n = 0; n < points[i].length; n++) {
				ctx.moveTo(points[i][n].x + 5, points[i][n].y);
				ctx.arc(points[i][n].x, points[i][n].y, 5, 0, 2 * Math.PI);
			}
			ctx.fill();
		}
		ctx.strokeStyle = "black";
		ctx.fillStyle = "black";
		
		if (animationProgress >= quality) {
			clearInterval(animationInterval);
			animationInterval = null;
			animationProgress = 0;
			setTimeout(drawFrame, 1);
			return;
		}
		animationProgress++;
	}
	
	ctx.beginPath(); // (draw) Curve.
	ctx.strokeStyle = "darkblue";
	ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
	for (var n = 1; n < curvePoints.length; n++) {
		ctx.lineTo(curvePoints[n].x, curvePoints[n].y);
	}
	ctx.stroke();
	ctx.strokeStyle = "black";

	ctx.beginPath(); // (draw) Virtual penpoint.
	ctx.moveTo(curvePoints[curvePoints.length-1].x + 5, curvePoints[curvePoints.length-1].y);
	ctx.arc(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y, 5, 0, 2 * Math.PI);
	ctx.fill();
}

function getPointAlongCurveAt(percent) { // Returns where the virtual penpoint is at a given percent in the curve.
	for (var i = 0; i < numOfCtrlPoints; i++) {
		for (var n = 0; n + 1 < points[i].length; n++) {
			points[i+1][n] = {x: (points[i][n+1].x - points[i][n].x) * percent + points[i][n].x,
				y: (points[i][n+1].y - points[i][n].y) * percent + points[i][n].y};
		}
	}
	return {x: (points[numOfCtrlPoints][1].x - points[numOfCtrlPoints][0].x) * percent + points[numOfCtrlPoints][0].x,
		y: (points[numOfCtrlPoints][1].y - points[numOfCtrlPoints][0].y) * percent + points[numOfCtrlPoints][0].y};
}

function distanceBetween(point1, point2) {
	return Math.sqrt((point1.x>point2.x ? point1.x-point2.x : point2.x-point1.x)*(point1.x>point2.x ? point1.x-point2.x : point2.x-point1.x) + 
		(point1.y>point2.y ? point1.y-point2.y : point2.y-point1.y)*(point1.y>point2.y ? point1.y-point2.y : point2.y-point1.y));
}

function initCtrlPoints() {
	for (var n = 0; n < numOfCtrlPoints + 1; n++) {
		points[n] = [];
	}
	var radius = Math.min(canvas.width, canvas.height)/2 - 20;
	var angle;
	for (var n = 0; n < numOfCtrlPoints+2; n++) { // Puts control points in a cool pattern.
		angle = (n/(numOfCtrlPoints+2))*(2*Math.PI);
		if (n % 2 == 0) {
			r = radius - (n/(numOfCtrlPoints+2))*radius; // comment this out and un-comment next line for a similar cool pattern.
			//r = 0;
		} else {
			r = radius;
		}
		points[0][n] = {x: Math.cos(angle)*r + canvas.width/2, y: Math.sin(angle)*r + canvas.height/2};
	}
}
/*function triSum(num) {
	if(num == 1) {
		return 1;
	} else {
		return num + triSum(num -1);
	}
}*/