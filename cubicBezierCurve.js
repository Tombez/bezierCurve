/* User Variables */
var quality = 100; // Number of lines to approximate curve
var animationTime = 5; // In seconds
/* End User Variables */

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
var pointer = {};
var points = [{x: canvas.width*1/4, y: canvas.height*3/4}, {x: canvas.width*3/4, y: canvas.height*3/4}];
var handles = [{x: canvas.width*1/4, y: canvas.height*1/4}, {x: canvas.width*3/4, y: canvas.height*1/4}];
var greenPoints = [];
var bluePoints = [];
var curvePoints = [];
var pointHeld = null;
var drawInterval = null;
var animationInterval = null;
var animationProgress;
var mouseup;

// Init:
context.strokeStyle = "black";
context.fillStyle = "black";
context.font = "20px Verdana";
context.lineWidth = 2;
drawFrame();

// Functions:
canvas.addEventListener("mousedown", function(event) {
	if (drawInterval) {
		clearInterval(drawInterval);
		drawInterval = null;
	}
	if (animationInterval) {
		return;
	}
	if (distanceBetween(pointer, points[0]) <= 10) {
		pointHeld = 0;
	} else if (distanceBetween(pointer, points[1]) <= 10) {
		pointHeld = 1;
	} else if (distanceBetween(pointer, handles[0]) <= 10) {
		pointHeld = 2;
	} else if (distanceBetween(pointer, handles[1]) <= 10) {
		pointHeld = 3;
	} else {
		return;
	}
	drawInterval = setInterval(drawFrame, 33);
});
canvas.addEventListener("mouseup", mouseup = function(event) {
	if (drawInterval) {
		clearInterval(drawInterval);
		drawInterval = null;
	}
	pointHeld = null;
});
canvas.addEventListener("mousemove", function(event) {
	pointer.x = event.clientX;
	pointer.y = event.clientY;
});
window.addEventListener("keyup", function(event) {
	if (event.keyCode == 65)  { // key A (Animate)
		mouseup();
		if (animationInterval) {
			clearInterval(animationInterval);
			animationInterval = null;
		}
		animationProgress = 0;
		curvePoints = [];
		animationInterval = setInterval(drawFrame, animationTime*1000/quality);
	} else if (event.keyCode == 82) { // key R (Reset)
		mouseup();
		points = [{x: canvas.width*1/4, y: canvas.height*3/4}, {x: canvas.width*3/4, y: canvas.height*3/4}];
		handles = [{x: canvas.width*1/4, y: canvas.height*1/4}, {x: canvas.width*3/4, y: canvas.height*1/4}];
		curvePoints = [];
		animationProgress = 0;
		drawFrame();
	} else if (event.keyCode == 87) {// key W (Randomize)
		mouseup();
		points = [{x: ~~(Math.random()*(canvas.width+1)), y: ~~(Math.random()*(canvas.height+1))}, {x: ~~(Math.random()*(canvas.width+1)), y: ~~(Math.random()*(canvas.height+1))}];
		handles = [{x: ~~(Math.random()*(canvas.width+1)), y: ~~(Math.random()*(canvas.height+1))}, {x: ~~(Math.random()*(canvas.width+1)), y: ~~(Math.random()*(canvas.height+1))}];
		curvePoints = [];
		animationProgress = 0;
		drawFrame();
	}
});

function drawFrame() {
	if (pointHeld != null) { // Move point if nesscessary
		if (pointHeld < 2) {
			points[pointHeld].x = pointer.x;
			points[pointHeld].y = pointer.y;
		} else {
			handles[pointHeld % 2].x = pointer.x;
			handles[pointHeld % 2].y = pointer.y;
		}
	}
	if (!animationInterval) {
		calculateCurve(); // Calculate new curve based on new point position
	} else {
		greenPoints[0] = {x: (handles[0].x - points[0].x) * animationProgress/quality + points[0].x, y: (handles[0].y - points[0].y) * animationProgress/quality + points[0].y};
		greenPoints[1] = {x: (handles[1].x - handles[0].x) * animationProgress/quality + handles[0].x, y: (handles[1].y - handles[0].y) * animationProgress/quality + handles[0].y};
		greenPoints[2] = {x: (points[1].x - handles[1].x) * animationProgress/quality + handles[1].x, y: (points[1].y - handles[1].y) * animationProgress/quality + handles[1].y};
		bluePoints[0] = {x: (greenPoints[1].x - greenPoints[0].x) * animationProgress/quality + greenPoints[0].x, y: (greenPoints[1].y - greenPoints[0].y) * animationProgress/quality + greenPoints[0].y};
		bluePoints[1] = {x: (greenPoints[2].x - greenPoints[1].x) * animationProgress/quality + greenPoints[1].x, y: (greenPoints[2].y - greenPoints[1].y) * animationProgress/quality + greenPoints[1].y};
		curvePoints[curvePoints.length] = {x: (bluePoints[1].x - bluePoints[0].x) * animationProgress/quality + bluePoints[0].x, y: (bluePoints[1].y - bluePoints[0].y) * animationProgress/quality + bluePoints[0].y};
	}
	
	// Draw the stuff
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	if (!animationInterval) {
		context.fillText("You can click and drag points. A = Animate, W = Random, R = Reset.", 5, 25);
	}
	
	context.beginPath(); // Draw Solid Points
	context.moveTo(points[0].x + 5, points[0].y);
	context.arc(points[0].x, points[0].y, 5, 0, 2*Math.PI);
	context.moveTo(points[1].x + 5, points[1].y);
	context.arc(points[1].x, points[1].y, 5, 0, 2*Math.PI);
	context.fill();
	
	context.beginPath(); // Draw Dashed Line
	if (context.setLineDash) {
		context.setLineDash([6, 18]);
		context.moveTo(points[0].x, points[0].y);
		context.lineTo(points[1].x, points[1].y);
		if (animationInterval) {
			context.moveTo(handles[0].x, handles[0].y);
			context.lineTo(handles[1].x, handles[1].y);
		}
		context.stroke();
		context.setLineDash([]);
	} else {
		dashedLine(points[0], points[1], [6, 18]);
		if (animationInterval) {
			dashedLine(handles[0], handles[1], [6, 18]);
		}
		context.stroke();
	}
	
	context.beginPath(); // Draw Handles
	context.moveTo(points[0].x, points[0].y);
	context.lineTo(handles[0].x, handles[0].y);
	context.moveTo(handles[0].x + 10, handles[0].y);
	context.arc(handles[0].x, handles[0].y, 10, 0, 2*Math.PI);
	context.moveTo(points[1].x, points[1].y);
	context.lineTo(handles[1].x, handles[1].y);
	context.moveTo(handles[1].x + 10, handles[1].y);
	context.arc(handles[1].x, handles[1].y, 10, 0, 2*Math.PI);
	context.stroke();
	
	if (animationInterval) {
		context.strokeStyle = "green"; // Draw green stuff
		context.fillStyle = "green";
		context.beginPath();
		context.moveTo(greenPoints[0].x + 5, greenPoints[0].y);
		context.arc(greenPoints[0].x, greenPoints[0].y, 5, 0, 2*Math.PI);
		context.moveTo(greenPoints[1].x + 5, greenPoints[1].y);
		context.arc(greenPoints[1].x, greenPoints[1].y, 5, 0, 2*Math.PI);
		context.moveTo(greenPoints[2].x + 5, greenPoints[2].y);
		context.arc(greenPoints[2].x, greenPoints[2].y, 5, 0, 2*Math.PI);
		context.fill();
		context.beginPath();
		context.moveTo(greenPoints[0].x, greenPoints[0].y);
		context.lineTo(greenPoints[1].x, greenPoints[1].y);
		context.moveTo(greenPoints[1].x, greenPoints[1].y);
		context.lineTo(greenPoints[2].x, greenPoints[2].y);
		context.stroke();
		
		context.strokeStyle = "blue"; // Draw blue stuff
		context.fillStyle = "blue";
		context.beginPath();
		context.moveTo(bluePoints[0].x + 5, bluePoints[0].y);
		context.arc(bluePoints[0].x, bluePoints[0].y, 5, 0, 2*Math.PI);
		context.moveTo(bluePoints[1].x + 5, bluePoints[1].y);
		context.arc(bluePoints[1].x, bluePoints[1].y, 5, 0, 2*Math.PI);
		context.fill();
		context.beginPath();
		context.moveTo(bluePoints[0].x, bluePoints[0].y);
		context.lineTo(bluePoints[1].x, bluePoints[1].y);
		context.stroke();
	}
	
	context.strokeStyle = "red"; // Draw curve
	context.fillStyle = "red";
	context.beginPath();
	context.moveTo(curvePoints[0].x, curvePoints[0].y);
	for (var n = 1; n < curvePoints.length; n++) {
		context.lineTo(curvePoints[n].x, curvePoints[n].y);
	}
	context.stroke();
	context.strokeStyle = "black";
	context.fillStyle = "black";
	if (animationInterval) {
		context.beginPath();
		context.moveTo(curvePoints[curvePoints.length-1].x + 5, curvePoints[curvePoints.length-1].y);
		context.arc(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y, 5, 0, 2*Math.PI);
		context.fill();
	}
	
	context.fillText("Made By: Tom Burris", canvas.width - 220, canvas.height - 10);
	
	if (animationInterval) {
		if (animationProgress >= quality) {
			clearInterval(animationInterval);
			animationInterval = null;
			drawFrame();
			return;
		}
		animationProgress++;
	}
}

function calculateCurve() { // Really efficient because there are no function calls
	curvePoints = [];
	
	for (var n = 0; n < quality + 1; n++) { // N lines need N+1 points
		greenPoints[0] = {x: (handles[0].x - points[0].x) * n/quality + points[0].x, y: (handles[0].y - points[0].y) * n/quality + points[0].y};
		greenPoints[1] = {x: (handles[1].x - handles[0].x) * n/quality + handles[0].x, y: (handles[1].y - handles[0].y) * n/quality + handles[0].y};
		greenPoints[2] = {x: (points[1].x - handles[1].x) * n/quality + handles[1].x, y: (points[1].y - handles[1].y) * n/quality + handles[1].y};
		bluePoints[0] = {x: (greenPoints[1].x - greenPoints[0].x) * n/quality + greenPoints[0].x, y: (greenPoints[1].y - greenPoints[0].y) * n/quality + greenPoints[0].y};
		bluePoints[1] = {x: (greenPoints[2].x - greenPoints[1].x) * n/quality + greenPoints[1].x, y: (greenPoints[2].y - greenPoints[1].y) * n/quality + greenPoints[1].y};
		curvePoints[curvePoints.length] = {x: (bluePoints[1].x - bluePoints[0].x) * n/quality + bluePoints[0].x, y: (bluePoints[1].y - bluePoints[0].y) * n/quality + bluePoints[0].y};
	}
}

function distanceBetween(point1, point2) {
	return Math.sqrt((point1.x>point2.x ? point1.x-point2.x : point2.x-point1.x)*(point1.x>point2.x ? point1.x-point2.x : point2.x-point1.x) + (point1.y>point2.y ? point1.y-point2.y : point2.y-point1.y)*(point1.y>point2.y ? point1.y-point2.y : point2.y-point1.y));
}

function dashedLine(point1, point2, onOff) {
	var hyp0 = distanceBetween(point1, point2);
	var xMult = (point2.x - point1.x) / hyp0;
	var yMult = (point2.y - point1.y) / hyp0;
	for (var n = 0; n < hyp0; n += (onOff[0] + onOff[1])) {
		context.moveTo(xMult*n + point1.x, yMult*n + point1.y);
		context.lineTo(xMult * (n + onOff[0]) + point1.x, yMult * (n + onOff[0]) + point1.y);
	}
}