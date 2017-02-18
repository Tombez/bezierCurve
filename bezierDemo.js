var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
var clickListeners = [];
var mousedownListeners = [];
var mouseupListeners = [];
var points = [];
var handles = [];
var pointer = new Point();
var pointHandleHeld;
var movingHandleInterval = null;
var demoAnimationInterval = null;
var demoAnimationProgress = 0;
var greenPoints = [];
var pinkPoints = [];
var penPoint = new Point();
var curvePoints = [];

// When the mouse is clicked, events fire in this order: ["mousedown", "mouseup", "click", "mousemove"];
canvas.addEventListener("click", function(event) {
	//console.log("click");
	for (var n = 0; n < clickListeners.length; n++) {
		if (!clickListeners[n](event)) {
			clickListeners.splice(0, 1);
		}
	}
});
canvas.addEventListener("mousedown", function(event) {
	//console.log("mousedown");
	for (var n = 0; n < mousedownListeners.length; n++) {
		if (!mousedownListeners[n](event)) {
			mousedownListeners.splice(0, 1);
		}
	}
});
canvas.addEventListener("mouseup", function(event) {
	//console.log("mouseup");
	for (var n = 0; n < mouseupListeners.length; n++) {
		if (!mouseupListeners[n](event)) {
			mouseupListeners.splice(0, 1);
		}
	}
});
canvas.addEventListener("mousemove", function(event) {
	//console.log("mousemove");
	pointer.x = event.clientX;
	pointer.y = event.clientY;
});

context.strokeStyle = "black";
context.fillStyle = "black";
context.font = "30px Verdana";
context.fillText("Click somewhere to place a point.", 10, 35);
context.beginPath();
context.moveTo(0, 50);
context.lineWidth = 2;
context.lineTo(canvas.width, 50);
context.stroke();
clickListeners.push(function(event) {
	points[0] = new Point(pointer);
	context.clearRect(0, 0, canvas.width, 50);
	context.fillText("Good! Place a new one!", 10, 35);
	context.beginPath();
	context.moveTo(0, 50);
	context.lineTo(canvas.width, 50);
	context.stroke();
	context.beginPath();
	context.arc(points[0].x, points[0].y, 5, 0, 2*Math.PI);
	context.fill();
	clickListeners.push(function(event) {
		points[1] = new Point(pointer);
		context.clearRect(0, 0, canvas.width, 50);
		context.fillText("Here are some handles, move them.       Done.", 10, 35);
		
		context.beginPath();
		context.rect(635, 10, 95, 30);
		context.moveTo(0, 50);
		context.lineTo(canvas.width, 50);
		context.stroke();
		
		context.beginPath();
		context.arc(points[1].x, points[1].y, 5, 0, 2*Math.PI);
		context.fill();
		
		context.beginPath();
		context.setLineDash([3, 9]);
		context.moveTo(points[0].x, points[0].y);
		context.lineTo(points[1].x, points[1].y);
		context.stroke();
		context.setLineDash([]);
		
		handles[0] = new Point(randomInteger(-50, 50), randomInteger(-50, 50)).add(points[0]).limit(0, 0, canvas.width, canvas.height);
		handles[1] = new Point(randomInteger(-50, 50), randomInteger(-50, 50)).add(points[1]).limit(0, 0, canvas.width, canvas.height);
		
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		context.lineTo(handles[0].x, handles[0].y);
		context.moveTo(handles[0].x + 10, handles[0].y);
		context.arc(handles[0].x, handles[0].y, 10, 0, 2*Math.PI);
		context.moveTo(points[1].x, points[1].y);
		context.lineTo(handles[1].x, handles[1].y);
		context.moveTo(handles[1].x + 10, handles[1].y);
		context.arc(handles[1].x, handles[1].y, 10, 0, 2*Math.PI);
		context.stroke();
		mousedownListeners.push(function(event) {
			if (movingHandleInterval) {
				clearInterval(movingHandleInterval);
				movingHandleInterval = null;
			}
			if (pointer.distanceFromPoint(handles[0]) <= 10) {
				pointHandleHeld = 0;
				movingHandleInterval = setInterval(moveHandles, 33);
				return true;
			} else if (pointer.distanceFromPoint(handles[1]) <= 10) {
				pointHandleHeld = 1;
				movingHandleInterval = setInterval(moveHandles, 33);
				return true;
			}
			if (pointer.isPositionLimited(635, 10, 725, 40)) { // Where the done button is
				context.clearRect(0, 0, canvas.width, 50);
				context.fillText("Watch this coolness:", 10, 35);
				context.beginPath();
				context.moveTo(0, 50);
				context.lineTo(canvas.width, 50);
				context.stroke();
				
				demoAnimationInterval = setInterval(demoAnimation, 50);
				
				return false;
			}
			return true;
		});
		mouseupListeners.push(function(event) {
			if (movingHandleInterval) {
				clearInterval(movingHandleInterval);
				movingHandleInterval = null;
			}
			return true;
		});
		return false;
	});
	return false;
});

function moveHandles() {
	handles[pointHandleHeld] = new Point(pointer.x, pointer.y).limit(0 + 10, 0 + 10, canvas.width, canvas.height);
	
	context.clearRect(0, 50, canvas.width, canvas.height);
	context.beginPath();
	context.arc(points[0].x, points[0].y, 5, 0, 2*Math.PI);
	context.moveTo(points[1].x + 5, points[1].y);
	context.arc(points[1].x, points[1].y, 5, 0, 2*Math.PI);
	context.fill();
	
	context.beginPath();
	context.setLineDash([3, 9]);
	context.moveTo(points[0].x, points[0].y);
	context.lineTo(points[1].x, points[1].y);
	context.stroke();
	context.setLineDash([]);
	
	context.beginPath();
	drawLine(points[0], handles[0]);
	context.moveTo(handles[0].x + 10, handles[0].y);
	context.arc(handles[0].x, handles[0].y, 10, 0, 2*Math.PI);
	drawLine(points[1], handles[1]);
	context.moveTo(handles[1].x + 10, handles[1].y);
	context.arc(handles[1].x, handles[1].y, 10, 0, 2*Math.PI);
	context.stroke();
}

function demoAnimation() {
	calculatePoints(demoAnimationProgress/100);
	
	context.clearRect(0, 50, canvas.width, canvas.height);
	
	context.beginPath(); // Draw Solid Points
	drawPoint(points[0]);
	drawPoint(points[1]);
	context.fill();
	
	context.beginPath(); // Draw Dashed Line(s)
	context.setLineDash([3, 9]);
	context.moveTo(points[0].x, points[0].y);
	context.lineTo(points[1].x, points[1].y);
	if (demoAnimationProgress < 100) {
		context.moveTo(handles[0].x, handles[0].y);
		context.lineTo(handles[1].x, handles[1].y);
	}
	context.stroke();
	context.setLineDash([]);
	
	context.beginPath(); // Draw Handles
	drawLine(points[0], handles[0]);
	context.moveTo(handles[0].x + 10, handles[0].y);
	context.arc(handles[0].x, handles[0].y, 10, 0, 2*Math.PI);
	drawLine(points[1], handles[1]);
	context.moveTo(handles[1].x + 10, handles[1].y);
	context.arc(handles[1].x, handles[1].y, 10, 0, 2*Math.PI);
	context.stroke();
	
	if (demoAnimationProgress < 100) {
		context.strokeStyle = "green"; // Draw green stuff
		context.fillStyle = "green";
		context.beginPath();
		drawPoint(greenPoints[0]);
		drawPoint(greenPoints[1]);
		drawPoint(greenPoints[2]);
		context.fill();
		context.beginPath();
		drawLine(greenPoints[0], greenPoints[1]);
		drawLine(greenPoints[1], greenPoints[2]);
		context.stroke();
		
		context.strokeStyle = "hotpink"; // Draw hotpink stuff
		context.fillStyle = "hotpink";
		context.beginPath();
		drawPoint(pinkPoints[0]);
		drawPoint(pinkPoints[1]);
		context.fill();
		context.beginPath();
		drawLine(pinkPoints[0], pinkPoints[1]);
		context.stroke();
	}
	
	context.strokeStyle = "blue"; // Draw blue stuff
	context.fillStyle = "blue";
	if (demoAnimationProgress < 100) {
		context.beginPath();
		drawPoint(penPoint);
		context.fill();
	}
	context.beginPath();
	for (var n = 0; n + 1 < curvePoints.length; n++) {
		drawLine(curvePoints[n], curvePoints[n + 1]);
	}
	context.stroke();
	
	context.strokeStyle = "black";
	context.fillStyle = "black";
	
	if (demoAnimationProgress >= 100) {
		clearInterval(demoAnimationInterval);
		
		context.clearRect(0, 0, canvas.width, 50);
		context.fillText("Again!     Reset.", 10, 35);
		context.beginPath();
		context.moveTo(600, 10);
		context.rect(10, 10, 95, 30);
		context.rect(160, 10, 95, 30);
		context.moveTo(0, 50);
		context.lineTo(canvas.width, 50);
		context.stroke();
		
		clickListeners.push(function(event) {
			if (pointer.isPositionLimited(10, 10, 105, 40)) {
				demoAnimationProgress = 0;
				curvePoints = [];
				demoAnimationInterval = setInterval(demoAnimation, 50);
				return false;
			} else if (pointer.isPositionLimited(160, 10, 255, 40)) {
				window.location.reload();
			}
			return true;
		});
		
		return;
	}
	
	demoAnimationProgress++;
}

function calculatePoints(percent) {
	greenPoints[0] = pointAlongLine(points[0], handles[0], percent);
	greenPoints[1] = pointAlongLine(handles[0], handles[1], percent);
	greenPoints[2] = pointAlongLine(handles[1], points[1], percent);
	pinkPoints[0] = pointAlongLine(greenPoints[0], greenPoints[1], percent);
	pinkPoints[1] = pointAlongLine(greenPoints[1], greenPoints[2], percent);
	penPoint = pointAlongLine(pinkPoints[0], pinkPoints[1], percent);
	curvePoints.push(new Point(penPoint.x, penPoint.y));
}

function pointAlongLine(startPoint, endPoint, percent) {
	//var x0 = endPoint.x - startPoint.x; // The commented out stuff is all correct
	//var y0 = endPoint.y - startPoint.y;
	//var hyp0 = Math.sqrt(x0*x0 + y0*y0);
	//var hyp1 = hyp0*percent;
	return new Point((endPoint.x - startPoint.x) * percent + startPoint.x, (endPoint.y - startPoint.y) * percent + startPoint.y); // Most efficient version
}

function calculateCurve() { // Really efficient because there are no function calls
	//demoAnimationInit();
	curvePoints = [];
	//end demoAnimationInit();
	
	for (var n = 0; n != 100; n++) {
		//calculatePoints(n);
		greenPoints[0] = {x: (handles[0].x - points[0].x) * n/100 + points[0].x, y: (handles[0].y - points[0].y) * n/100 + points[0].y};
		greenPoints[1] = {x: (handles[1].x - handles[0].x) * n/100 + handles[0].x, y: (handles[1].y - handles[0].y) * n/100 + handles[0].y};
		greenPoints[2] = {x: (points[1].x - handles[1].x) * n/100 + handles[1].x, y: (points[1].y - handles[1].y) * n/100 + handles[1].y};
		pinkPoints[0] = {x: (greenPoints[1].x - greenPoints[0].x) * n/100 + greenPoints[0].x, y: (greenPoints[1].y - greenPoints[0].y) * n/100 + greenPoints[0].y};
		pinkPoints[1] = {x: (greenPoints[2].x - greenPoints[1].x) * n/100 + greenPoints[1].x, y: (greenPoints[2].y - greenPoints[1].y) * n/100 + greenPoints[1].y};
		penPoint = {x: (pinkPoints[1].x - pinkPoints[0].x) * n/100 + pinkPoints[0].x, y: (pinkPoints[1].y - pinkPoints[0].y) * n/100 + pinkPoints[0].y};
		curvePoints[curvePoints.length] = {x: penPoint.x, y: penPoint.y};
		//end calculatePoints(n);
	}
}

/*function limitNumber(num, min, max) { // Not used
	if (num > min) {
		if (num < max) {
			return val;
		} else {
			return max;
		}
	} else  {
		return min;
	}
}*/

function drawPoint(point) {
	context.moveTo(point.x + 5, point.y);
	context.arc(point.x, point.y, 5, 0, 2*Math.PI);
}

function drawLine(point1, point2) {
	context.moveTo(point1.x, point1.y);
	context.lineTo(point2.x, point2.y);
}

function randomInteger(min, max) {
	return Math.floor(Math.random()*(max - min + 1)) + min;
}