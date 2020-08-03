import Body from '../planet/Body';
import { toCelcius } from '../../../misc/temperature';
import Word from '../../../misc/Word';
import { TD, MISC, STAR } from '../../../variables';
import * as THREE from 'three';
import { deleteThree } from '../../init/init';
import setColor from '../../../misc/color';
import { Random } from '../../../misc/random';
import Atmosphere from '../planet/Atmosphere';
import { toSize } from '../../../misc/size';
import getTime from '../../../misc/time';

export default class Star {
	constructor({ x, y, z, index }) {
		this.seed = new Random();
		this.isStar = true;
		this.index = index;
		this.coordinate = { x, y, z };
		this.id = {
			text: `X:${this.coordinate.x}, Y:${this.coordinate.y}, Z:${this.coordinate.z}, I:${this.index}`,
			toString: () => `${this.coordinate.x},${this.coordinate.y},${this.coordinate.z},${index}`
		};
		this.object = {
			low: undefined,
			high: undefined
		};
	}

	random(seed) {
		this.seed.set(`star_${seed}_${this.id}`);
		return this.seed;
	}

	get name() {
		if (!this._name) {
			this.random('name');
			this._name = new Word(this.seed, {
				syllablesMin: 3,
				syllablesMax: 7,
				numberSuffixLength: 999
			});
		}
		return this._name;
	}

	get size() {
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
		return {
			valueOf: () => size,
			text: sizeString
		};
	}

	get position() {
		this.random('position');
		return {
			x: this.seed.rnd(TD.stargrid.size),
			y: this.seed.rnd(TD.stargrid.size),
			z: this.seed.rnd(TD.stargrid.size)
		};
	}

	get camera() {
		return TD.camera.coordinate;
	}

	get universe() {
		return {
			x: (this.position.x + (this.coordinate.x - TD.camera.coordinate.x) * TD.stargrid.size) * TD.scale,
			y: (this.position.y + (this.coordinate.y - TD.camera.coordinate.y) * TD.stargrid.size) * TD.scale,
			z: (this.position.z + (this.coordinate.z - TD.camera.coordinate.z) * TD.stargrid.size) * TD.scale
		};
	}

	get color() {
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
		return {
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

	getChildren() {
		if (!this.children) {
			const children = [];
			const size = this.size;
			this.random('planets');
			const childrenLength = this.seed.rndInt(size * 4); // number of planets depends on star size
			if (childrenLength > 0) {
				for (let id = 0; id < childrenLength; id++) {
					const child = new Body({ star: this, id, parent: this });
					child.getChildren();
					children.push(child);
				}
			}
			this.children = children;
		}
		return this.children;
	}

	get text() {
		return `
			<div class="label--h1">${this.name}</div>
			<div class="label--h2">Star #${this.id}</div>
			<div>${this.color.text} ${this.size.text}</div>
			<div>Size: ${toSize(this.size)}</div>
			<div>Temperature: ${toCelcius(this.temperature.min)}</div>
		${this.children.length > 0 ?
		`<div class="label--h3">Planets</div>
		<ol>
			${this.children.map(body => `<li>${body.textShort}</li>`).join('\n')}
		</ol>` :
		''}`;
	}

	get rotationSpeedAroundAxis() {
		const temperature = this.temperature.min;
		this.random('rotation_speed');
		return this.seed.rnd(temperature * 0.0000002, temperature * 0.0000004);
	}

	drawRotation() {
		if (this.object && this.object.rotation) {
			this.random('rotation');
			this.object.rotation.set(this.seed.rnd(2 * Math.PI), this.seed.rnd(2 * Math.PI), this.seed.rnd(2 * Math.PI));
			this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
			if (this.children) {
				for (const child of this.children) {
					child.drawRotation();
				}
			}
		}
	}

	hideChildren() {
		for (const child of this.children) {
			if (child.object && child.object.high) {
				child.hide();
			}
		}
	}

	draw() {
		const pos = {
			x: this.position.x * TD.scale,
			y: this.position.y * TD.scale,
			z: this.position.z * TD.scale
		};
		const size = this.size * 0.0002 * TD.scale;
		deleteThree(this.object); // WIP. Maybe we can hide it?
		const hue2 = this.color.hue - 0.05 > 0 ? this.color.hue - 0.05 : 0;
		setColor(1, this.color.hue, 1.0, this.color.brightness, 'hsl');
		setColor(2, hue2, 1.0, this.color.brightness, 'hsl');
		setColor(3, this.color.hue, 0.2, this.color.brightness, 'hsl');
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
		this.light.intensity = 5;
		this.light.power = 50;
		this.light.decay = 0;
		this.light.distance = TD.camera.far * 0.0001 * TD.scale;
		this.light.shadow.bias = -TD.camera.near * 0.006 * TD.scale;
		this.light.shadow.radius = 3;
		this.light.shadow.normalBias = 0;
		this.light.shadow.mapSize.width = 1024 * 2;
		this.light.shadow.mapSize.height = 1024 * 2;
		this.light.shadow.camera.near = TD.camera.near * TD.scale;
		this.light.shadow.camera.far = TD.camera.far * 0.001 * TD.scale;
		this.light.castShadow = true;
		this.light.visible = true;

		this.object.high.add(this.light);

		// Set star position
		this.object.position.set(pos.x, pos.y, pos.z);

		// Draw planets of star
		if (this.children.length) {
			for (let c = 0; c < this.children.length; c++) {
				deleteThree(this.children[c].object.high); // WIP. Same... maybe hide it?
				this.children[c].drawLow();
			};
		}

		// Add star to scene
		TD.scene.add(this.object);
		this.object.low.this = this;
		console.log(this);
	}
}
