"use strict";

let control = 16; // number of control points
const quality = 50 + control * 5; // number of points for curve
const animationTime = 10000; // milliseconds
const handleSize = 10;
const pointSize = 5;
const lineDash = [4, 4];

Math.tau = 2 * Math.PI;

let canvas;
let ctx;
let bezier;
let mouse = {};
let pointHeld = -1;
let start = 0;
let number = "";

const mousemove = event => {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
};
const mousedown = event => {
	if (event.which !== 1) return;
	mousemove(event);
	const data = bezier.data;
	const twiceControl = control * 2;
	for (let n = 0; n < twiceControl;) {
		if (Math.hypot(mouse.x - data[n++], mouse.y - data[n++]) <= 10) {
			pointHeld = n - 2;
			break;
		}
	}
};
const mouseup = () => pointHeld = -1;
const keydown = event => {
	switch (event.key.toLowerCase()) {
		case "a": // animate
			start = performance.now();
			bezier.pointLen = 0;
			break;
		case "w": // randomize
			const twiceControl = control * 2;
			for (let n = 0; n < twiceControl;) {
				bezier.data[n++] = Math.random() * canvas.width;
				bezier.data[n++] = Math.random() * canvas.height;
			}
			bezier.pointLen = 0;
			break;
		case "r": // reset
			initBezier();
			start = 0;
			break;
		case "alt":
			if (!event.repeat) number = "";
			break;
		default:
			if (event.altKey) number += event.key;
			break;
	}
};
const keyup = event => {
	if (event.key == "Alt") {
		control = parseInt(number) || control;
		initBezier();
	}
};
CanvasRenderingContext2D.prototype.circle = function(x, y, r) {
	this.moveTo(x + r, y);
	this.arc(x, y, r, 0, Math.tau);
};
const hsl = h => `hsl(${h * 360}, 100%, 50%)`;
const initBezier = () => {
	bezier = new Bezier(control, quality);
	// Puts control points in a cool pattern.
	const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
	const midX = canvas.width / 2;
	const midY = canvas.height / 2;
	const twiceControl = control * 2;
	for (let n = 0; n < twiceControl;) {
		const percent = n / twiceControl;
		const angle = percent * Math.tau;
		const r = radius * (n & 2 ? 1 - percent : 1);
		bezier.data[n++] = Math.cos(angle) * r + midX;
		bezier.data[n++] = Math.sin(angle) * r + midY;
	}
};
const loop = now => {
	const percent = Math.min((now - start) / animationTime, 1);
	step(percent);
	draw(percent < 1);
	requestAnimationFrame(loop);
};
const step = percent => {
	if (pointHeld != -1) {
		bezier.data[pointHeld] = mouse.x;
		bezier.data[pointHeld + 1] = mouse.y;
		bezier.pointLen = 0;
	}
	bezier.generatePoints(percent);
};
const draw = animated => {
	const data = bezier.data;
	const points = bezier.points;
	const twiceControl = control * 2;

	ctx.fillStyle = "#000"; // background
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath(); // controls
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#fff";
	for (let n = 0; n < twiceControl;) {
		ctx.circle(bezier.data[n++], bezier.data[n++], handleSize);
	}
	ctx.stroke();

	ctx.beginPath(); // handle lines
	ctx.setLineDash(lineDash);
	for (let n = 0; n + 2 < twiceControl;) {
		// prevent line dash from being connected when a point is moved.
		ctx.moveTo(data[n++], data[n++]);
		ctx.lineTo(data[n], data[n + 1]);
	}
	ctx.stroke();
	ctx.setLineDash([]);

	if (animated) { // construction lines
		for (let start = twiceControl, len = control; len--;) {
			ctx.strokeStyle = hsl(1 - (len + 1) / control);
			ctx.fillStyle = ctx.strokeStyle;
			ctx.beginPath();
			ctx.moveTo(data[start], data[start + 1]);
			for (let n = start + 2, end = start + len * 2; n < end;) {
				ctx.lineTo(data[n++], data[n++]);
			}
			ctx.stroke();
			ctx.beginPath();
			for (let n = len; n--;) {
				ctx.circle(data[start++], data[start++], pointSize);
			}
			ctx.fill();
		}
	}

	ctx.beginPath(); // curve
	ctx.strokeStyle = hsl(1 - 2 / control);
	ctx.moveTo(points[0], points[1]);
	for (let n = 2; n < bezier.pointLen * 2;) {
		ctx.lineTo(points[n++], points[n++]);
	}
	ctx.stroke();

	ctx.fillStyle = "#fff";
	ctx.textBaseline = "hanging";
	ctx.font = "18px Consolas, 'Ubuntu Mono', Ubuntu, 'Courier New', Courier";
	ctx.fillText("Press A, W, or R!", 10, 10);
};
const init = () => {
	canvas = document.getElementById("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	ctx = canvas.getContext("2d");
	canvas.addEventListener("mousemove", mousemove);
	canvas.addEventListener("mousedown", mousedown);
	canvas.addEventListener("mouseup", mouseup);
	window.addEventListener("keydown", keydown);
	window.addEventListener("keyup", keyup);
	initBezier();
	start = performance.now();
	requestAnimationFrame(loop);
};

document.addEventListener("DOMContentLoaded", init);
