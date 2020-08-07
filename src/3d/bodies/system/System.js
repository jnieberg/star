import Word from '../../../misc/Word';
import { TD } from '../../../variables';
import * as THREE from 'three';
import { deleteThree } from '../../init/init';
import Random from '../../../misc/Random';
import Star from './Star';
import getTime from '../../../misc/time';

export default class System {
	constructor({ x, y, z, index }) {
		this.seed = new Random();
		this.isSystem = true;
		this.index = index;
		this.coordinate = { x, y, z };
		this.id = {
			text: `X:${this.coordinate.x}, Y:${this.coordinate.y}, Z:${this.coordinate.z}, I:${this.index}`,
			toString: () => `${this.coordinate.x}.${this.coordinate.y}.${this.coordinate.z}:${this.index}`
		};
		this.object = {
			low: undefined,
			high: undefined
		};
	}

	random(seed) {
		this.seed.set(`system_${seed}_${this.id}`);
		return this.seed;
	}

	get name() {
		if (!this._name) {
			this.random('name');
			this._name = new Word(this.seed, {
				syllablesMin: 3,
				syllablesMax: 7
			});
		}
		return this._name;
	}

	get position() {
		if (!this._position) {
			this.random('position', true);
			const position = {
				x: this.seed.rnd(TD.stargrid.size),
				y: this.seed.rnd(TD.stargrid.size),
				z: this.seed.rnd(TD.stargrid.size)
			};
			this.random('position_offset');
			position.x = position.x + this.seed.rnd(-0.00001 * TD.scale, 0.00001 * TD.scale);
			position.y = position.y + this.seed.rnd(-0.00001 * TD.scale, 0.00001 * TD.scale);
			position.z = position.z + this.seed.rnd(-0.00001 * TD.scale, 0.00001 * TD.scale);
			this._position = position;
		}
		return this._position;
	}

	get universe() {
		return {
			x: (this.position.x + (this.coordinate.x - TD.camera.coordinate.x) * TD.stargrid.size) * TD.scale,
			y: (this.position.y + (this.coordinate.y - TD.camera.coordinate.y) * TD.stargrid.size) * TD.scale,
			z: (this.position.z + (this.coordinate.z - TD.camera.coordinate.z) * TD.stargrid.size) * TD.scale
		};
	}

	get starDistance() {
		if (this.children.length > 1) {
			return this.seed.rnd(0.005, 0.01);
		}
		return 0;
	}

	get children() {
		if (!this._children) {
			this.random('stars');
			const children = [];
			do {
				children.push(
					new Star({
						system: this,
						index: children.length
					})
				);
			} while (this.seed.rndInt(5) === 0);
			this._children = children;
		}
		return this._children;
	}

	getAllChildren(root = this) {
		let bodies = [];
		if (root && root.children) {
			const obj = root.children;
			bodies = [
				obj,
				...root.children.map(child => this.getAllChildren(child))
			];
		}
		return bodies.flat(Infinity).filter(body => body);
	}

	get text() {
		return `
		<div class="label--h1">${this.name}</div>
		<div class="label--h2">${this.children.length > 1 ? 'Multinary system' : 'System'} #${this.id}</div>
		<div class="label--h3">Stars<span>Planets</span></div>
		<ol>
			${this.children.map(star => `<li>${star.textShort}</li>`).join('\n')}
		</ol>`;
	}

	// temperature + size?
	get rotationSpeedAroundAxis() {
		if (this.children.length > 1) {
			let temperature = 0;
			this.children.forEach(child => {
				temperature = temperature + child.temperature.min;
			});
			this.random('rotation_speed');
			return (this.seed.rndInt(2) === 0 ? -1 : 1) * this.seed.rnd(temperature * 0.00002, temperature * 0.00004);
		}
		return 0;
	}

	drawRotation() {
		if (this.object && this.object.rotation) {
			this.object.rotation.y = getTime() * this.rotationSpeedAroundAxis;
		}
		this.children.forEach(child => child.drawRotation());
	}

	hideChildren() {
		this.children.forEach(child => child.hideChildren());
	}

	// Draw all stars and bodies here
	draw() {
		this.random('rotation');
		this.object = new THREE.Object3D();
		this.object.position.set(this.position.x * TD.scale, this.position.y * TD.scale, this.position.z * TD.scale);
		this.object.rotation.set(this.seed.rnd(2 * Math.PI), this.seed.rnd(2 * Math.PI), this.seed.rnd(2 * Math.PI));
		this.children.forEach(child => child.drawHigh());
		TD.scene.add(this.object);
	}

	remove() {
		this.children.forEach(child => deleteThree(child.object));
		delete this;
	}
}
