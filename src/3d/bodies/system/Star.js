import * as THREE from 'three';

import Random from '../../../misc/Random';
import { STAR, TD, MISC } from '../../../variables';
import { deleteThree } from '../../init/init';
import setColor from '../../../misc/color';
import Atmosphere from '../planet/Atmosphere';
import { toSize } from '../../../misc/size';
import { toRoman } from '../../../misc/to-roman';
import { toCelcius } from '../../../misc/temperature';
import Body from '../planet/Body';
import getTime from '../../../misc/time';

export default class Star {
	constructor({ system, index }) {
		this.seed = new Random();
		this.isStar = true;
		this.type = 'star';
		this.parent = system;
		this.system = system;
		this.index = index;
		this.drawLow();
	}

	random(seed) {
		this.seed.set(`star_${seed}_${this.system.id}_${this.index}`);
		return this.seed;
	}

	get textShort() {
		return `${this.name}${this.children && this.children.length ? `<span>${this.children.length}</span>` : ''}`;
	}

	get text() {
		return `
			<div class="label--h1">${this.name}</div>
			${this.system.children > 1 ? `<div class="label--h2">Star #${this.index + 1} of ${this.system.name}</div>` : ''}
			<div>${this.color.text} ${this.size.text}</div>
			<div>Size:<span>${toSize(this.size)}</span></div>
			<div>Temperature:<span>${toCelcius(this.temperature.min)}</span></div>
		${this.children && this.children.length > 0 ?
		`<div class="label--h3">Planets<span>Moons</span></div>
		<ol>
			${this.children.map(body => `<li>${body.textShort}</li>`).join('\n')}
		</ol>` :
		''}`;
	}

	get name() {
		return `${this.system.name}${this.system.children.length > 1 ? ` ${toRoman(this.index + 1)}` : ''}`;
	}

	get size() {
		if (!this._size) {
			this.random('size');
			const size = this.seed.rnd(0.1, 5);
			const sizeString =
		size < 1 ?
			'Dwarf' :
			size < 3 ?
				'Star' :
				size < 4 ?
					'Giant' :
					size < 4.5 ?
						'Supergiant' :
						'Hypergiant';
			this._size = {
				valueOf: () => size,
				text: sizeString
			};
		}
		return this._size;
	}

	get color() {
		if (!this._color) {
			this.random('color');
			const hue = this.seed.rnd();
			const brightness = this.seed.rnd(0.1, 1.0);
			let brightString = '';
			let hueString = 'Red';
			for (const col in STAR.color.brightness) {
				if (STAR.color.brightness.hasOwnProperty(col)) {
					const b = STAR.color.brightness[col];
					if (brightness < b) {
						brightString = col;
					}
				}
			}
			for (const col in STAR.color.hue) {
				if (STAR.color.hue.hasOwnProperty(col)) {
					const h = STAR.color.hue[col];
					if (hue < h) {
						hueString = col;
					}
				}
			}
			this._color = {
				hue: {
					valueOf: () => hue,
					text: hueString
				},
				brightness: {
					valueOf: () => brightness,
					text: brightString
				},
				text: `${brightString} ${brightString === 'White' ? brightString : hueString}`.replace(/^ | $|(White).*$/g, '$1')
			};
		}
		return this._color;
	}

	// Star temperature in Kelvin
	get temperature() {
		this.random('temperature');
		for (const tempColor in STAR.temperature) {
			if (STAR.temperature.hasOwnProperty(tempColor)) {
				if (tempColor === this.color.hue.text) {
					const temp = STAR.temperature[tempColor];
					const tempBright = temp.min + (temp.max - temp.min) * 0.75;
					const tempDark = temp.max - (temp.max - temp.min) * 0.75;
					let temperature = 0;
					switch (this.color.brightness.text) {
					case 'Bright':
						temperature = this.seed.rndInt(tempBright, temp.max);
					case 'Dark':
						temperature = this.seed.rndInt(temp.min, tempDark);
					case '':
						temperature = this.seed.rndInt(tempDark, tempBright);
					default:
						temperature = this.seed.rndInt(temp.min, temp.max);
					}
					return {
						min: temperature,
						max: temperature
					};
				}
			}
		}
	}

	get children() {
		if (!this._children) {
			const children = [];
			const temperature = this.temperature.min;
			this.random('planets');
			// number of planets depends on star temperature and number of stars
			const childrenLength = this.seed.rndInt(Math.sqrt(temperature) * 0.1 / this.system.children.length);
			if (childrenLength > 0) {
				for (let index = 0; index < childrenLength; index++) {
					const child = new Body({ system: this.system, index, parent: this });
					const _foo = child.children;
					children.push(child);
				}
			}
			this._children = children;
		}
		return this._children;
	}

	hideChildren() {
		for (const child of this.children) {
			if (child.object && child.object.high) {
				child.hide();
			}
		}
	}

	// temperature + size?
	get rotationSpeedAroundAxis() {
		const temperature = this.temperature.min;
		this.random('rotation_speed');
		return (this.seed.rndInt(2) === 0 ? -1 : 1) * this.seed.rnd(temperature * 0.0000003, temperature * 0.0000004);
	}

	drawRotation() {
		if (this.object && this.object.rotation) {
			this.object.rotation.set(0, 0, 0);
			this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
			if (this.children) {
				for (const child of this.children) {
					child.drawRotation();
				}
			}
		}
	}

	drawLow() {
		const pos = this.system.universe;
		setColor(1, Number(this.color.hue), 1.0, Number(this.color.brightness), 'hsl');
		const id = `${this.system.coordinate.x}_${this.system.coordinate.y}_${this.system.coordinate.z}`;
		TD.stars[id].this.push(this);
		TD.stars[id].positions.push(pos.x, pos.y, pos.z);
		TD.stars[id].colors.push(MISC.colorHelper.r, MISC.colorHelper.g, MISC.colorHelper.b);
		TD.stars[id].sizes.push(this.size * 0.5 * TD.scale);
	}

	drawHigh() {
		const size = this.size * 0.0001 * TD.scale;
		deleteThree(this.object); // WIP. Maybe we can hide it?
		const hue2 = this.color.hue - 0.05 > 0 ? this.color.hue - 0.05 : 0;
		setColor(1, this.color.hue, 1.0, this.color.brightness, 'hsl');
		setColor(2, hue2, 1.0, this.color.brightness, 'hsl');
		setColor(3, this.color.hue, 1.0, 1.0 - this.color.brightness * 0.3, 'hsl');
		this.random('rotation');

		// Star pivot
		this.object = new THREE.Object3D();
		const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
		const material = new THREE.MeshBasicMaterial({
			color: MISC.colorHelper2,
			side: THREE.BackSide,
			transparent: true,
			alphaTest: 0,
		});
		this.object.low = new THREE.Mesh(geometry, material);
		this.object.low.name = 'Star low';
		this.object.low.castShadow = false;
		this.object.low.receiveShadow = false;
		this.object.add(this.object.low);

		// Star spots
		const materialSpots = new THREE.MeshBasicMaterial({
			map: TD.texture.star.surface,
			color: MISC.colorHelper,
			transparent: true,
			blending: THREE.AdditiveBlending,
			opacity: 1,
			alphaTest: 0,
		});
		this.object.high = new THREE.Mesh(geometry, materialSpots);
		this.object.high.name = 'Star high';
		this.object.high.scale.set(1, 1, 1);// 0.98, 0.98, 0.98);
		this.object.high.castShadow = false;
		this.object.high.receiveShadow = false;
		this.object.add(this.object.high);

		// Star corona
		const _foo = new Atmosphere(this.object.high, {
			size: size * 1.01,
			thickness: size * 1.5,
			color: MISC.colorHelper2,
			colorInner: MISC.colorHelper,
			blending: THREE.AdditiveBlending,
			opacity: 0.75
		});

		// Star point light
		this.light = new THREE.PointLight(MISC.colorHelper3);
		this.light.name = 'Star light';
		this.light.power = 50;
		this.light.decay = 2;
		this.light.distance = TD.camera.far * 0.0001 * TD.scale;
		this.light.shadow.bias = -TD.camera.near * 0.005 * TD.scale;
		this.light.shadow.radius = 1;
		this.light.shadow.normalBias = 0;
		this.light.shadow.mapSize.width = 1024 * 2;
		this.light.shadow.mapSize.height = 1024 * 2;
		this.light.shadow.camera.near = TD.camera.near * 100 * TD.scale;
		this.light.shadow.camera.far = TD.camera.far * 0.0001 * TD.scale;
		this.light.castShadow = true;
		this.light.visible = true;
		this.object.high.add(this.light);

		// Draw planets of star
		if (this.children && this.children.length) {
			for (let c = 0; c < this.children.length; c++) {
				deleteThree(this.children[c].object.high); // WIP. Same... maybe hide it?
				this.children[c].drawLow();
			};
		}

		// Set star position
		this.object.rotateY(2 * Math.PI / this.system.children.length * this.index);
		this.object.translateX(this.system.starDistance * TD.scale);

		// Add star to scene
		TD.system.object.add(this.object);
		this.object.low.this = this;
	}
}
