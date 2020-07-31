import Body from '../planet/Body';
import { toCelcius } from '../../../misc/temperature';
import Word from '../../../misc/Word';
import { TD, MISC, STAR } from '../../../variables';
import * as THREE from 'three';
import { deleteThree } from '../../init/init';
import setColor from '../../../misc/color';
import random from '../../../misc/random';
import Atmosphere from '../planet/Atmosphere';
import { toSize } from '../../../misc/size';
import getTime from '../../../misc/time';

export default class Star {
	constructor({ x, y, z, index }) {
		this.isStar = true;
		this.index = index;
		this.coordinate = { x, y, z };
		this.position = this.getPosition();
		this.universe = this.getUniverse();
		this.id = {
			text: `X:${this.coordinate.x}, Y:${this.coordinate.y}, Z:${this.coordinate.z}, I:${this.index}`,
			toString: () => `${this.coordinate.x},${this.coordinate.y},${this.coordinate.z},${index}`
		};
		this.size = this.getSize();
		this.color = this.getColor();
		this.object = {
			low: undefined,
			high: undefined
		};
	}

	random(seed) {
		MISC.rnd = random(`star_${seed}_${this.id}`);
	}

	get name() {
		this.random('name');
		return new Word({
			words: 3,
			syllables: 3,
			numberSuffixLength: 999
		});
	}

	getSize() {
		const size = MISC.rnd() * 5 + 0.1;
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

	getPosition() {
		return {
			x: MISC.rnd() * TD.stargrid.size,
			y: MISC.rnd() * TD.stargrid.size,
			z: MISC.rnd() * TD.stargrid.size
		};
	}

	get camera() {
		return TD.camera.coordinate;
	}

	getUniverse() {
		return {
			x: (this.position.x + (this.coordinate.x - TD.camera.coordinate.x) * TD.stargrid.size) * TD.scale,
			y: (this.position.y + (this.coordinate.y - TD.camera.coordinate.y) * TD.stargrid.size) * TD.scale,
			z: (this.position.z + (this.coordinate.z - TD.camera.coordinate.z) * TD.stargrid.size) * TD.scale
		};
	}

	getColor() {
		const hue = MISC.rnd();
		const brightness = MISC.rnd() * 0.9 + 0.1;
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
						temperature = Math.floor(MISC.rnd() * (temp.max - tempBright)) + tempBright;
					case 'Dark':
						temperature = Math.floor(MISC.rnd() * (tempDark - temp.min)) + temp.min;
					case '':
						temperature = Math.floor(MISC.rnd() * (tempBright - tempDark)) + tempDark;
					default:
						temperature = Math.floor(MISC.rnd() * (temp.max - temp.min)) + temp.min;
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
			this.random('planets');
			const childrenLength = Math.floor(MISC.rnd() * this.size * 4); // number of planets depends on star size
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
		return MISC.rnd() * temperature * 0.00000005 + 0.00000005;
	}

	drawRotation() {
		if (this.object) {
			this.random('rotation');
			this.object.rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);
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
		setColor(3, this.color.hue, 0.25, this.color.brightness, 'hsl');
		this.random('rotation');

		// Star pivot
		this.object = new THREE.Object3D();
		// this.object.rotation.x = Math.PI * MISC.rnd() * 2;
		// this.object.rotation.y = Math.PI * MISC.rnd() * 2;
		// this.object.rotation.z = Math.PI * MISC.rnd() * 2;

		const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
		const material = new THREE.MeshBasicMaterial({
			color: MISC.colorHelper2,
			side: THREE.BackSide,
			transparent: true,
			alphaTest: 0,
		});
		this.object.low = new THREE.Mesh(geometry, material);
		// this.object.rotation.x = Math.PI * MISC.rnd() * 2;
		// this.object.rotation.y = Math.PI * MISC.rnd() * 2;
		// this.object.rotation.z = Math.PI * MISC.rnd() * 2;
		// this.object.renderOrder = 1;
		this.object.low.castShadow = false;
		this.object.low.receiveShadow = false;
		this.object.add(this.object.low);

		// // Star frontside
		// const material2 = new THREE.MeshBasicMaterial({
		// 	color: MISC.colorHelper2,
		// 	blending: THREE.AdditiveBlending,
		// 	side: THREE.FrontSide,
		// 	transparent: true,
		// 	alphaTest: 0.5,
		// });
		// const starInner = new THREE.Mesh(geometry, material2);
		// // starInner.renderOrder = 1;
		// starInner.castShadow = false;
		// starInner.receiveShadow = false;
		// this.object.add(starInner);

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
		this.object.high.scale.set(1, 1, 1);// 0.98, 0.98, 0.98);
		this.object.high.castShadow = false;
		this.object.high.receiveShadow = false;
		this.object.add(this.object.high);

		// Star corona
		// const flareMaterial = new THREE.SpriteMaterial({
		// 	map: TD.texture.star.large,
		// 	color: MISC.colorHelper2,
		// 	opacity: 1,
		// 	blending: THREE.AdditiveBlending,
		// 	alphaTest: 0,
		// 	depthTest: false
		// });
		// const starFlare = new THREE.Sprite(flareMaterial);
		// starFlare.scale.set(size, size, size);
		// starFlare.castShadow = false;
		// starFlare.receiveShadow = false;
		// this.object.add(starFlare);
		// eslint-disable-next-line no-unused-vars
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
		// pointLight.castShadow = true;
		// this.object.add(pointLight);

		// Star spot light
		// this.light = new THREE.DirectionalLight(MISC.colorHelper3);
		this.light.intensity = 5;
		this.light.power = 50;
		this.light.decay = 0;
		this.light.distance = TD.camera.far * 0.0001 * TD.scale;
		// this.light.angle = Math.PI / 4;
		// this.light.penumbra = 0.1;
		// const grid = 0.005;
		this.light.shadow.bias = -TD.camera.near * 0.006 * TD.scale;
		this.light.shadow.radius = 3;
		this.light.shadow.normalBias = 0;
		this.light.shadow.mapSize.width = 1024 * 2;
		this.light.shadow.mapSize.height = 1024 * 2;
		// this.light.shadow.camera.fov = 180;
		// this.light.shadow.camera.aspect = 1;
		// this.light.shadow.camera.left = -grid * TD.scale;
		// this.light.shadow.camera.right = grid * TD.scale;
		// this.light.shadow.camera.top = grid * TD.scale;
		// this.light.shadow.camera.bottom = -grid * TD.scale;
		this.light.shadow.camera.near = TD.camera.near * TD.scale;
		this.light.shadow.camera.far = TD.camera.far * 0.001 * TD.scale;
		this.light.castShadow = true;
		this.light.visible = true;

		// this.object.add(this.light.target);
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
		this.object.high.this = this;
		console.log(this);
	}
}
