import * as THREE from 'three';
import { Color } from 'three';

class Biome {
	constructor({ metal, fluid }) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'biomeCanvas';
		this.canvas.width = 512;
		this.canvas.height = 512;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx = this.canvas.getContext('2d');
		this.metal = metal;
		this.fluid = fluid;

		// if (document.body) {
		// 	document.body.appendChild(this.canvas);
		// }
		// this.toggleCanvasDisplay(true);
	}

	generateTexture(props) {
		this.waterLevel = props.waterLevel;

		// const h = this.randRange(0.0, 1.0);
		// const s = this.randRange(0.0, 0.7);
		// const l = this.randRange(0.0, 0.6);
		this.baseColor = new THREE.Color().setHSL(this.metal.hue, this.metal.saturation, this.metal.lightness);
		this.colorAngle = this.randRange(0.2, 0.4);
		this.satRange = this.randRange(0.3, 0.5);
		this.lightRange = this.randRange(0.3, 0.5);
		this.circleSize = this.randRange(0.03, 0.25);
		// this.circleSize = 100;


		this.drawBase();

		// circles
		let numCircles = Math.round(this.randRange(50, 100));
		numCircles = 100;
		for (let i = 0; i < numCircles; i++) {
			this.randomGradientCircle();
		}

		this.drawDetail();
		this.drawInland();
		this.drawBeach();
		this.drawRivers();
		this.drawWater();

		this.texture = new THREE.CanvasTexture(this.canvas);
	}

	toggleCanvasDisplay(value) {
		if (value) {
			this.canvas.style.display = 'block';
		} else {
			this.canvas.style.display = 'none';
		}
	}

	drawBase() {
		this.fillBaseColor();

		for (let i = 0; i < 5; i++) {
			const x = 0;
			const y = 0;
			const width = this.width;
			const height = this.height;
			this.randomGradientRect(x, y, width, height);
		}
	}

	drawDetail() {
		// land detail
		const landDetail = Math.round(this.randRange(0, 5));
		// landDetail = 20;
		// console.log("landDetail = " + landDetail);
		for (let i = 0; i < landDetail; i++) {
			const x1 = this.randRange(0, this.width);
			const y1 = this.randRange(0, this.height);
			const x2 = this.randRange(0, this.width);
			const y2 = this.randRange(0, this.height);
			const width = x2 - x1;
			const height = y2 - y1;

			// this.randomGradientStrip(0, 0, this.width, this.height);
			this.randomGradientStrip(x1, y1, width, height);
		}
	}

	// rivers
	drawRivers() {
		const c = {
			hue: Math.floor(this.fluid.hue * 360),
			saturation: Math.floor(this.fluid.saturation * 100),
			lightness: Math.floor(this.fluid.lightness * 100)
		};
		const falloff = 1.3;
		const opacity = 0.9;
		// this.ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.5)';
		this.ctx.strokeStyle = 'hsla(' + Math.round(c.hue) + ', ' + Math.round(c.saturation) + '%, ' + Math.round(c.lightness) + '%, ' + opacity + ')';

		let x = this.randRange(0, this.width);
		let y = this.randRange(0, this.height);
		let prevX = x;
		let prevY = y;
		let riverLength =  this.randRange(0, 8);

		for (let i = 0; i < riverLength; i++) {
			x = this.randRange(0, this.width);
			y = this.randRange(0, this.height);

			this.ctx.moveTo(prevX, prevY);
			this.ctx.lineTo(x, y);
			this.ctx.stroke();

			prevX = x;
			prevY = y;
		}
	}

	randomCircle() {
		const x = this.randRange(0, this.width);
		const y = this.randRange(0, this.height);
		const rad = this.randRange(0, 10);
		// rad = 3;

		const c = this.randomColor();
		this.ctx.fillStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.5)';
		// this.ctx.lineWidth = 1;

		this.ctx.beginPath();
		this.ctx.arc(x, y, rad, 0, 2 * Math.PI);
		this.ctx.fill();
	}

	randomGradientStrip(x, y, width, height) {
		const x1 = this.randRange(0, this.width);
		const y1 = this.randRange(0, this.height);
		const x2 = this.randRange(0, this.width);
		const y2 = this.randRange(0, this.height);

		const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

		const c = this.randomColor();
		gradient.addColorStop(this.randRange(0, 0.5), 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.0)');
		gradient.addColorStop(0.5, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.8)');
		gradient.addColorStop(this.randRange(0.5, 1.0), 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.0)');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(x, y, width, height);
	}

	blackWhiteGradient() {
		const x1 = 0;
		const y1 = 0;
		const x2 = this.width;
		const y2 = this.height;

		const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);


		gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 1.0)');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	fillBaseColor() {
		this.ctx.fillStyle = this.toCanvasColor(this.baseColor);
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	randomGradientRect(x, y, width, height) {
		const x1 = this.randRange(0, this.width);
		const y1 = this.randRange(0, this.height);
		const x2 = this.randRange(0, this.width);
		const y2 = this.randRange(0, this.height);

		const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

		const c = this.randomColor();
		gradient.addColorStop(0, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.0)');
		gradient.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 1.0)');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(x, y, width, height);
	}

	drawWater() {
		const x1 = 0;
		const y1 = this.height - (this.height * this.waterLevel);
		const x2 = 0;
		const y2 = this.height;

		const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);


		// const c = this.randomColor();
		// const c = this.randomWaterColor();
		const c = {
			hue: Math.floor(this.fluid.hue * 360),
			saturation: Math.floor(this.fluid.saturation * 100),
			lightness: Math.floor(this.fluid.lightness * 100)
		};
		const falloff = 1.3;
		const falloff2 = 1.0;
		const falloff3 = 0.7;
		const falloff4 = 0.5;
		const opacity = 1;
		// gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
		// gradient.addColorStop(0.0, 'rgba(' + Math.round(c.r * falloff) + ', ' + Math.round(c.g * falloff) + ', ' + Math.round(c.b * falloff) + ', ' + opacity + ')');
		// gradient.addColorStop(0.2, 'rgba(' + Math.round(c.r * falloff2) + ', ' + Math.round(c.g * falloff2) + ', ' + Math.round(c.b * falloff2) + ', ' + opacity + ')');
		// gradient.addColorStop(0.6, 'rgba(' + Math.round(c.r * falloff3) + ', ' + Math.round(c.g * falloff3) + ', ' + Math.round(c.b * falloff3) + ', ' + opacity + ')');
		// gradient.addColorStop(0.8, 'rgba(' + Math.round(c.r * falloff4) + ', ' + Math.round(c.g * falloff4) + ', ' + Math.round(c.b * falloff4) + ', ' + opacity + ')');
		gradient.addColorStop(0.0, 'hsla(' + Math.round(c.hue) + ', ' + Math.round(c.saturation) + '%, ' + Math.round(c.lightness * falloff) + '%, ' + opacity + ')');
		gradient.addColorStop(0.2, 'hsla(' + Math.round(c.hue) + ', ' + Math.round(c.saturation) + '%, ' + Math.round(c.lightness * falloff2) + '%, ' + opacity + ')');
		gradient.addColorStop(0.6, 'hsla(' + Math.round(c.hue) + ', ' + Math.round(c.saturation) + '%, ' + Math.round(c.lightness * falloff3) + '%, ' + opacity + ')');
		gradient.addColorStop(0.8, 'hsla(' + Math.round(c.hue) + ', ' + Math.round(c.saturation) + '%, ' + Math.round(c.lightness * falloff4) + '%, ' + opacity + ')');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(x1, y1, this.width, this.height);
	}

	drawBeach() {
		this.beachSize = 7;

		const x1 = 0;
		const y1 = this.height - (this.height * this.waterLevel) - this.beachSize;
		const x2 = 0;
		const y2 = this.height - (this.height * this.waterLevel);

		const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

		const c = this.randomColor();
		const falloff = 1.0;
		const falloff2 = 1.0;
		// gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
		gradient.addColorStop(0.0, 'rgba(' + Math.round(c.r * falloff) + ', ' + Math.round(c.g * falloff) + ', ' + Math.round(c.b * falloff) + ', ' + 0.0 + ')');
		gradient.addColorStop(1.0, 'rgba(' + Math.round(c.r * falloff2) + ', ' + Math.round(c.g * falloff2) + ', ' + Math.round(c.b * falloff2) + ', ' + 0.3 + ')');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(x1, y1, this.width, this.beachSize);
	}

	drawInland() {
		this.inlandSize = 100;

		const x1 = 0;
		const y1 = this.height - (this.height * this.waterLevel) - this.inlandSize;
		const x2 = 0;
		const y2 = this.height - (this.height * this.waterLevel);

		const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

		const c = this.randomColor();
		const falloff = 1.0;
		const falloff2 = 1.0;
		// gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
		gradient.addColorStop(0.0, 'rgba(' + Math.round(c.r * falloff) + ', ' + Math.round(c.g * falloff) + ', ' + Math.round(c.b * falloff) + ', ' + 0.0 + ')');
		gradient.addColorStop(1.0, 'rgba(' + Math.round(c.r * falloff2) + ', ' + Math.round(c.g * falloff2) + ', ' + Math.round(c.b * falloff2) + ', ' + 0.5 + ')');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(x1, y1, this.width, this.inlandSize);
	}

	randomGradientCircle() {
		const x1 = this.randRange(0, this.width);
		const y1 = this.randRange(0, this.height) - this.height * this.waterLevel;
		const size = this.randRange(10, this.circleSize);
		const x2 = x1;
		const y2 = y1;
		const r1 = 0;
		const r2 = size;

		const gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);

		const c = this.randomColor();

		gradient.addColorStop(0, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 1.0)');
		gradient.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.0)');

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	// randomWaterColor() {
	// 	const newColor = this.baseColor.clone();

	// 	let hOffset = 0.0;
	// 	const range = 0.1;
	// 	const n = this.randRange(0, 1);
	// 	if (n < 0.33) {
	// 		hOffset = 0.0 + this.randRange(-range, range);
	// 	} else if (n < 0.66) {
	// 		hOffset = this.colorAngle + this.randRange(-range, range);
	// 	} else {
	// 		hOffset = -this.colorAngle + this.randRange(-range, range);
	// 	}

	// 	const sOffset = this.randRange(-this.satRange, this.satRange);
	// 	const lOffset = this.randRange(-this.lightRange, this.lightRange);

	// 	const c = new Color();
	// 	newColor.getHSL(c);
	// 	c.h = this.randRange(0.0, 1.0);
	// 	c.s = c.s + this.randRange(0.0, 0.6);
	// 	// console.log("sat = " + c.s);
	// 	c.l = c.l + this.randRange(0.1, 0.4);

	// 	newColor.setHSL(c.h, c.s, c.l);

	// 	newColor.offsetHSL(hOffset, sOffset, lOffset);

	// 	return { r: Math.round(newColor.r * 255), g: Math.round(newColor.g * 255), b: Math.round(newColor.b * 255) };
	// }

	randomColor() {
		const newColor = this.baseColor.clone();

		let hOffset = 0.0;
		const range = 0.1;
		const n = this.randRange(0, 1);
		if (n < 0.33) {
			hOffset = 0.0 + this.randRange(-range, range);
		} else if (n < 0.66) {
			hOffset = this.colorAngle + this.randRange(-range, range);
		} else {
			hOffset = -this.colorAngle + this.randRange(-range, range);
		}

		const sOffset = this.randRange(-this.satRange, this.satRange);
		const lOffset = this.randRange(-this.lightRange, this.lightRange);

		const c = new Color();
		newColor.getHSL(c);
		c.h = this.randRange(0.0, 1.0);// c.h + hOffset;
		c.s = c.s + sOffset;
		c.l = c.l + lOffset;
		if (c.l < 0) {
			c.l = Math.abs(c.l) * 0.3;
		}
		// if (c.l > 0.7) {
		//   let diff = c.l - 0.7;
		//   c.l = 0.7 - diff;
		// }

		// c.s = this.randRange(0.0, 0.7);
		// c.l = this.randRange(0.0, 1.0);

		// newColor.setHSL(c.h, c.s, c.l);
		newColor.setHSL(this.metal.hue + this.randRange(-0.1, 0.1), this.metal.saturation + this.randRange(-0.1, 0.1), this.metal.lightness + this.randRange(-0.1, 0.1));

		// newColor.offsetHSL(hOffset, sOffset, lOffset);

		return { r: Math.round(newColor.r * 255),
			g: Math.round(newColor.g * 255),
			b: Math.round(newColor.b * 255) };
	}

	// randomColor() {
	//
	//   let newColor = this.baseColor.clone();
	//
	//   let hOffset = 0.0;
	//   let range = 0.1;
	//   let n = this.randRange(0,1);
	//   if (n < 0.33) {
	//     hOffset = 0.0 + this.randRange(-range, range);
	//   } else if (n < 0.66) {
	//     hOffset = this.colorAngle + this.randRange(-range, range);
	//   } else {
	//     hOffset = -this.colorAngle + this.randRange(-range, range);
	//   }
	//
	//   newColor.offsetHSL(hOffset, 0, 0);
	//   let c = newColor.getHSL();
	//   newColor.setHSL(c.h, this.randRange(0.0, 0.8), this.randRange(0.0, 0.6));
	//
	//   return {r: Math.round(newColor.r*255),
	//           g: Math.round(newColor.g*255),
	//           b: Math.round(newColor.b*255)};
	//
	// }

	toCanvasColor(c) {
		return 'rgba(' + Math.round(c.r * 255) + ', ' + Math.round(c.g * 255) + ', ' + Math.round(c.b * 255) + ', 1.0)';
	}

	randRange(low, high) {
		const range = high - low;
		const n = window.seed.rnd() * range;
		return low + n;
	}

	mix(v1, v2, amount) {
		const dist = v2 - v1;
		return v1 + (dist * amount);
	}
}

export default Biome;
