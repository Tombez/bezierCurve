"use strict";

class Bezier {
	constructor(side, detail) {
		this.side = side;
		this.detail = detail;
		this.data = new Float32Array(side * (side + 1));
		this.points = new Float32Array(detail * 2);
		this.pointLen = 0;
	}
	calculate(percent) {
		const data = this.data;
		for (let start = 0, len = this.side; --len;) {
			let ax = data[start++], ay = data[start++], bx, by;
			for (let c = start + len * 2, n = len; n--;) {
				bx = data[start++], by = data[start++];
				data[c++] = ax + (bx - ax) * percent;
				data[c++] = ay + (by - ay) * percent;
				ax = bx, ay = by;
			}
		}
	}
	generatePoints(percent) {
		const data = this.data;
		const points = this.points;
		const lastX = data.length - 2, lastY = lastX + 1;
		for (let cur = this.pointLen * 2; cur / 2 / this.detail < percent;) {
			this.calculate(cur / 2 / this.detail);
			points[cur++] = data[lastX], points[cur++] = data[lastY];
			this.pointLen++;
		}
		this.calculate(percent);
		points[this.pointLen * 2 - 2] = data[lastX];
		points[this.pointLen * 2 - 1] = data[lastY];
	}
}
