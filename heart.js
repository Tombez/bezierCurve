"use strict";

let maxCtrlPoints = Infinity;
let animationTime = 3; // seconds.
let r = 3;

let canvas;

let ctx;
let radius;
let currentCtrlPoints = 4; // minimum of 2.
let points;
let maxFrames = (animationTime * 60) | 0;
let currentFrame;

const init = () => {
	canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx = canvas.getContext("2d");
	radius = Math.min(canvas.width, canvas.height) / 2 - 20;
	ctrlPointLoop();
};
const ctrlPointLoop = () => {
	if (currentCtrlPoints < maxCtrlPoints) {
		points = calcCtrlPoints(currentCtrlPoints);
		currentFrame = 0;
		frameLoop();
		currentCtrlPoints++;
	}
};
const frameLoop = () => {
	if (currentFrame <= maxFrames) {
		let percent = (points.length % 2 == 0 ? currentFrame / maxFrames : 1 - currentFrame / maxFrames);
		calcConstructionPoints(points, percent);
		requestAnimationFrame(function() {
			draw(points);
		});
		currentFrame++;
	} else {
		ctrlPointLoop();
	}
};
const calcCtrlPoints = _number => {
	let localPoints = [[]];
	let currentLine = localPoints[0];
	for (let n = 0; n < _number; n++) {
		let angle = n / (_number - 1) * (2 * Math.PI);
		// heart equation from: http://mathworld.wolfram.com/HeartCurve.html
		currentLine.push({
			x: 16 * (Math.sin(angle) ** 3) * radius / 18 + canvas.width / 2,
			y: canvas.height - ((13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * radius / 18 + canvas.height / 2)
		});
	}
	return localPoints;
};
const calcConstructionPoints = (_points, _percent) => {
	let currentLine = _points[0];
	for (let n = 1; n < _points[0].length; n++) {
		let previousLine = currentLine;
		currentLine = _points[n] = [];
		let currentPoint = previousLine[0];
		for (let i = 1; i < previousLine.length; i++) {
			let previousPoint = currentPoint;
			currentPoint = previousLine[i];
			currentLine.push(getPointOnLineAt(previousPoint, currentPoint, _percent));
		}
	}
};
const getPointOnLineAt = (_pointA, _pointB, _percent) => {
	return {
		x: (_pointB.x - _pointA.x) * _percent + _pointA.x,
		y: (_pointB.y - _pointA.y) * _percent + _pointA.y
	};
};
const draw = _points => {
	// Clear canvas.
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Construction lines.
	for (let n = 0; n < _points.length; n++) {
		ctx.fillStyle = ctx.strokeStyle = "hsl(" + ~~((n / (_points.length - 1)) * 360) + ", 100%, 50%)";
		let currentLine = _points[n];
		ctx.beginPath(); // Line part.
		let first = currentLine[0];
		ctx.moveTo(first.x, first.y);
		for (let i = 1; i < currentLine.length; i++) {
			let current = currentLine[i];
			ctx.lineTo(current.x, current.y);
		}
		ctx.stroke();
		ctx.beginPath(); // Circle part.
		for (let i = 0; i < currentLine.length; i++) {
			let current = currentLine[i];
			ctx.circle(current.x, current.y, r);
		}
		ctx.fill();
	}

	// Virtual penpoint.
	ctx.beginPath();
	ctx.fillStyle = "#fff";
	let penPoint = _points[_points.length - 1][0];
	ctx.circle(penPoint.x, penPoint.y, r);
	ctx.fill();

	frameLoop();
};
CanvasRenderingContext2D.prototype.circle = function(_x, _y, _r) {
	this.moveTo(_x + _r, _y);
	this.arc(_x, _y, _r, 0, 2 * Math.PI);
};

document.addEventListener("DOMContentLoaded", init);
