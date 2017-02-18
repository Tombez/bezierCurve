//(function() { // This doesn't need to execute
//return;

/* User Definable Variables */
var numOfCtrlPoints = 0;
var quality = 100 + (10 * numOfCtrlPoints); // how many lines are used to model the curve
var fps = 30; // frames per second
var animationTime = 4; // seconds
var fastMode = true;
var graphNum = 0;
var lineWidth = 3;
/* End User Definable Variables */

// Kelly's 22 distinct colors:
var colors = ["#E25822", "#222222", "#F3C300", "#875692", "#F38400", "#A1CAF1", "#BE0032",
	"#C2B280", "#848482", "#008856", "#E68FAC", "#0067A5", "#F99379", "#604E97", "#F6A600",
	"#B3446C", "#DCD300", "#882D17", "#8DB600", "#654522", "#2B3D26", "#F2F3F4"];

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
var points = [];
var curvePoints = [];
var pointHeld = null;
var animationInterval = null;
var animationProgress = 0;

reset();

context.strokeStyle = "black";
context.fillStyle = "black";
context.font = "20px Verdana";
context.lineWidth = lineWidth;
drawFrame();

window.addEventListener("keyup", function(event) { // having this event listener on the canvas didn't work
	
	if (event.keyCode == 65) {// Key A (Animate)
		if (animationInterval) {
			reset();
			return;
		}
		animationProgress = 0;
		curvePoints = [];
		animationInterval = setInterval(drawFrame, fastMode ? 1 : 1000/(quality/animationTime));
	}
});

function drawFrame() {
	context.beginPath(); // Clear the canvas
	context.fillStyle = "#f9f3d8";
	context.rect(0, 0, canvas.width, canvas.height);
	context.fill();
	context.fillStyle = "black";
	
	context.fillText("Press A To Toggle Animation.", 10, 30);
	context.fillText("Number Of Control Points: " + numOfCtrlPoints, 10, canvas.height - 10);
	context.fillText("Made By: Tom Burris", canvas.width - 220, canvas.height - 10);
	
	if (animationInterval) {
		curvePoints.push(getPointAlongCurveAt(animationProgress/quality));
	}
	
	context.beginPath(); // Anchor points.
	context.moveTo(points[0][0].x + 5, points[0][0].y);
	context.arc(points[0][0].x, points[0][0].y, 5, 0, 2 * Math.PI);
	context.moveTo(points[0][numOfCtrlPoints+1].x + 5, points[0][numOfCtrlPoints+1].y);
	context.arc(points[0][numOfCtrlPoints+1].x, points[0][numOfCtrlPoints+1].y, 5, 0, 2 * Math.PI);
	context.fill();
	
	context.beginPath(); // Control points.
	for (var n = 1; n < numOfCtrlPoints + 1; n++) {
		context.moveTo(points[0][n].x + 10, points[0][n].y);
		context.arc(points[0][n].x, points[0][n].y, 10, 0, 2 * Math.PI);
	}
	context.stroke();
	
	context.beginPath(); // Handles.
	context.setLineDash([6, 18]);
	for (var n = 0; n + 1 < points[0].length; n++) {
		context.moveTo(points[0][n].x, points[0][n].y); // have this to prevent it acting like one continuous line
		context.lineTo(points[0][n+1].x, points[0][n+1].y);
	}
	context.stroke();
	context.setLineDash([]);
	
	if (animationInterval) {
		context.beginPath(); // Constructor lines.
		for (var i = 1; i < points.length; i++) {
			context.strokeStyle = colors[(i-1) % 22];
			context.fillStyle = context.strokeStyle;
			context.beginPath();
			context.moveTo(points[i][0].x, points[i][0].y);
			for (var n = 1; n < points[i].length; n++) {
				context.lineTo(points[i][n].x, points[i][n].y);
			}
			context.stroke();
			context.beginPath();
			for (var n = 0; n < points[i].length; n++) {
				context.moveTo(points[i][n].x + 5, points[i][n].y);
				context.arc(points[i][n].x, points[i][n].y, 5, 0, 2 * Math.PI);
			}
			context.fill();
		}
		context.fillStyle = "black";
	
		context.beginPath(); // Curve.
		context.strokeStyle = "darkblue";
		context.moveTo(curvePoints[0].x, curvePoints[0].y);
		for (var n = 1; n < curvePoints.length; n++) {
			context.lineTo(curvePoints[n].x, curvePoints[n].y);
		}
		context.stroke();
		context.strokeStyle = "black";

		context.beginPath(); // Virtual penpoint.
		context.moveTo(curvePoints[curvePoints.length-1].x + 5, curvePoints[curvePoints.length-1].y);
		context.arc(curvePoints[curvePoints.length-1].x, curvePoints[curvePoints.length-1].y, 5, 0, 2 * Math.PI);
		context.fill();
		
		if (animationProgress >= quality) {
			if (numOfCtrlPoints == 22) {
				graphNum++;
				reset(0, true);
				animationInterval = setInterval(drawFrame, fastMode ? 1 : 1000/(quality/animationTime));
				return;
			}
			numOfCtrlPoints++;
			reset(numOfCtrlPoints);
			animationInterval = setInterval(drawFrame, fastMode ? 1 : 1000/(quality/animationTime));
			return;
		}
		animationProgress++;
	}
}

function getPointAlongCurveAt(percent) {
	for (var i = 0; i < numOfCtrlPoints; i++) {
		for (var n = 0; n + 1 < points[i].length; n++) {
			points[i+1][n] = {x: (points[i][n+1].x - points[i][n].x) * percent + points[i][n].x, y: (points[i][n+1].y - points[i][n].y) * percent + points[i][n].y};
		}
	}
	return {x: (points[numOfCtrlPoints][1].x - points[numOfCtrlPoints][0].x) * percent + points[numOfCtrlPoints][0].x, y: (points[numOfCtrlPoints][1].y - points[numOfCtrlPoints][0].y) * percent + points[numOfCtrlPoints][0].y};
}

function initCtrlPoints() {
	var radius = Math.min(canvas.width, canvas.height)/2 - 20;
	for (var n = 0; n < numOfCtrlPoints + 2; n++) {
		switch (graphNum) {
			case 0: // random
				points[0][n] = {x: Math.floor(Math.random() * (canvas.width + 1)), y: Math.floor(Math.random() * (canvas.height + 1))};
				
				break;
			case 1: // vertical zig-zag
				points[0][n] = {x: (n * ((canvas.width - 100) / (numOfCtrlPoints + 1))) + 50,
					y: n % 2 == 0 ? canvas.height - 50 : 0 + 50};
				break;
			case 2: // sine (kinda a fail)
				var cycles = 2;
				points[0][n] = {x: n / (numOfCtrlPoints + 1 ) * canvas.width,
					y: canvas.height - (Math.sin(cycles * n / (numOfCtrlPoints + 1) * 2 * Math.PI) * (radius - 1 / 8 * radius) + canvas.height / 2)};
					// replacement: Math.min(radius - 50, canvas.width / 4 / cycles) vs (radius - 50)
				break;
			case 3: // circle
				var angle = (1 + (n/(numOfCtrlPoints+2))*2)*Math.PI;
				points[0][n] = {x: Math.cos(angle)*radius + canvas.width/2, y: Math.sin(angle)*radius + canvas.height/2};
				break;
			case 4: // golden ratio? (i just tried to make it look like that, no idea if it actually is)
				var angle = (n/(numOfCtrlPoints+2))*(2*Math.PI);
				var r = radius - (n/(numOfCtrlPoints+2))*radius;
				points[0][n] = {x: Math.cos(angle)*r + canvas.width/2, y: Math.sin(angle)*r + canvas.height/2};
				break;
			case 5: // 1/2 circle, 1/2 centered
				var angle = (n/(numOfCtrlPoints+2))*(2*Math.PI);
				if (n % 2 == 0) {
					var r = 0;
				} else {
					var r = radius;
				}
				points[0][n] = {x: Math.cos(angle)*r + canvas.width/2, y: Math.sin(angle)*r + canvas.height/2};
				break;
			case 6: // 1/2 circle, 1/2 golden ratio
				var angle = (n/(numOfCtrlPoints+2))*(2*Math.PI);
				if (n % 2 == 0) {
					var r = radius - (n/(numOfCtrlPoints+2))*radius;
				} else {
					var r = radius;
				}
				points[0][n] = {x: Math.cos(angle)*r + canvas.width/2, y: Math.sin(angle)*r + canvas.height/2};
				break;
			case 7: // heart
				// equation from: http://mathworld.wolfram.com/HeartCurve.html (not mine)
				// ((y-((1-(|x|-1)^2)^(1/2)))*(y-(-3*(1-(|x|/2)^(1/2))^(1/2))))=0 (mine)
				var angle = (n/(numOfCtrlPoints+1))*(2*Math.PI);
				points[0][n] = {x: 16 * Math.sin(angle) * Math.sin(angle) * Math.sin(angle) * radius/20 + canvas.width / 2,
					y: canvas.height - ((13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * radius/20 + canvas.height / 2)};
				break;
			case 8:
				//
				break;
				//[{"x":609,"y":604},{"x":607,"y":436},{"x":356,"y":564},{"x":113,"y":364},{"x":114,"y":17},{"x":630,"y":11},{"x":706,"y":31},{"x":791,"y":506},{"x":493,"y":78},{"x":510,"y":325},{"x":710,"y":230},{"x":607,"y":436},{"x":607,"y":436},{"x":501,"y":229},{"x":709,"y":321},{"x":715,"y":77},{"x":444,"y":507},{"x":502,"y":22},{"x":572,"y":9},{"x":1106,"y":16},{"x":1109,"y":347},{"x":875,"y":552},{"x":607,"y":436},{"x":609,"y":605}] handmade heart
				/*
				function triSum(num) {
					var answer = 0;
					for (var n = 1; n <= num; n++) {
						answer += n;
					}
					return answer;
				}
				*/
			default:
				graphNum = 0;
				initCtrlPoints();
				break;
		}
		
	}
}

function reset(ctrlPoints, leaveFrame) {
	if (animationInterval) {
		clearInterval(animationInterval);
		animationInterval = null;
	}
	animationProgress = 0;
	if (isNaN(ctrlPoints)) {
		numOfCtrlPoints = numOfCtrlPoints || 0;
	} else {
		numOfCtrlPoints = ctrlPoints;
	}
	quality = 100 + (10 * numOfCtrlPoints);
	curvePoints = [];
	points = [];
	for (var n = 0; n < numOfCtrlPoints + 1; n++) {
		points[n] = [];
	}
	initCtrlPoints();
	!leaveFrame && drawFrame();
}
//})();