import * as THREE from 'three';
import { MISC, TD } from '../../../variables';
import setColor, { getColorMix } from '../../../misc/color';
import { toCelcius } from '../../../misc/temperature';
import { deleteThree } from '../../init/init';
import getTime from '../../../misc/time';
import BodySurface from './views/BodySurface';
import Atmosphere from './Atmosphere';
import Random from '../../../misc/Random';
import { toSize } from '../../../misc/size';
import Word from '../../../misc/Word';

export default class Body {
	constructor({ system, index, parent }) {
		this.seed = new Random();
		this.system = system;
		this.index = index;
		this.parent = parent;
		this.isMoon = parent instanceof Body;
		this.isPlanet = !this.isMoon;
		this.type = this.isMoon ? 'moon' : 'planet';
		this.object = {
			low: undefined,
			high: undefined
		};
		this.surfaceRenders = {
			resolutions: [ 128, 512 ], // 1024
			last: undefined
		};
	}

	random(seed) {
		this.seed.set(`body_${seed}_${this.system.id}_${this.grandParentId}_${this.parentId}_${this.index}`);
		return this.seed;
	}

	get name() {
		if (!this._name) {
			this._name = new Word(this.random('name'));
		}
		return this._name;
	}

	get size() {
		if (!this._size) {
			const parentSize = this.parent.size;
			this.random('size');
			this._size = parentSize * this.seed.rnd(0.002, 0.03);
			if (this.isMoon) {
				this._size = parentSize * this.seed.rnd(0.02, 0.3);
			}
		}
		return this._size;
	}

	get parentId() {
		return this.parent ? this.parent.index : -1;
	}

	get grandParentId() {
		return this.parent && this.parent.parent ? this.parent.parent.index : -1;
	}

	get star() {
		return this.parent.isStar ? this.parent : this.parent.parent && this.parent.parent.isStar ? this.parent.parent : null;
	}

	get distanceStar() {
		return this.isPlanet ? this.distance : this.parent.isPlanet ? this.parent.distance : 0;
	}

	get distance() {
		if (!this._distance) {
			const size = this.parent.size * 2;
			const scale = this.isPlanet ? 2 : 0.2;
			const id = this.index + 1;
			this.random('distance');
			this._distance = size + (id * id * 0.3 + (this.seed.rnd(1) - 0.5)) * scale;
		}
		return this._distance;
	}

	get temperature() {
		if (!this._temperature) {
			const starTemp = this.star.temperature.min;
			const distanceToStar = this.distanceStar;
			const atmosphere = (this.atmosphere.color.a * 0.8) + 0.2;
			this.random('temperature');
			let temp = [
				Math.floor(atmosphere * starTemp / this.seed.rnd(distanceToStar, distanceToStar * 1.5)),
				Math.floor(starTemp / (1.0 + atmosphere * this.seed.rnd(distanceToStar, distanceToStar * 1.5)))
			];
			temp = temp.sort((a, b) => (a > b ? 1 : -1));
			this._temperature = {
				min: temp[0],
				max: temp[1]
			};
		}
		return this._temperature;
	}

	get atmosphere() {
		if (!this._atmosphere) {
			let atmos = {
				size: 0,
				color: {
					hue: 0,
					saturation: 0,
					lightness: 0,
					a: 0
				}
			};
			this.random('atmosphere');
			if (this.seed.rndInt(5) > 0) {
				atmos = {
					size: this.seed.rnd(this.size * 0.1),
					color: {
						hue: this.seed.rnd(),
						saturation: this.seed.rnd(0.25, 0.75),
						lightness: this.seed.rnd(0.25, 0.75),
						a: this.seed.rnd(0.1, 1.0)
					}
				};
			}
			const atmosThick = atmos.color.a;
			const text =
		(atmosThick === 0) ?
			'No' :
			(atmosThick < 0.2) ?
				'Very thin' :
				(atmosThick < 0.4) ?
					'Thin' :
					(atmosThick < 0.6) ?
						'Normal' :
						(atmosThick < 0.8) ?
							'Dense' :
							'Very dense';
			this._atmosphere = {
				...atmos,
				text
			};
		}
		return this._atmosphere;
	}

	get clouds() {
		this.random('clouds');
		if (this.isPlanet && this.atmosphere.text !== 'No' && this.seed.rndInt(2) === 0) {
			return {
				hue: this.atmosphere.color.hue + this.seed.rnd(0.2),
				saturation: this.atmosphere.color.saturation,
				lightness: this.atmosphere.color.lightness + this.seed.rnd(0.25)
			};
		}
		return false;
	}

	get water() {
		this.random('water');
		return {
			level: this.seed.rnd(),
			color: {
				r: this.seed.rnd(),
				g: this.seed.rnd(),
				b: this.seed.rnd(),
				a: this.seed.rnd(0.1, 1.0)
			}
		};
	}

	get rings() {
		if (this.isPlanet) {
			this.random('ring');
			if (this.size > 0.02 && this.seed.rndInt(2) === 0) {
				return {
					thickness: this.seed.rnd(),
					size: this.size * 2 + this.seed.rnd() * this.size * 3,
					color: {
						r: this.seed.rnd(),
						g: this.seed.rnd(),
						b: this.seed.rnd(),
						a: this.seed.rnd(0.25, 1)
					}
				};
			}
		}
		return false;
	}

	get children() {
		if (!this._children) {
			const children = [];
			const size = this.size;
			this.random('moons');
			const childrenLength = this.seed.rndInt(size * 50);
			if (this.isPlanet && childrenLength) {
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

	get textShort() {
		return `${this.name}${this.children && this.children.length ? `<span>${this.children.length}</span>` : ''}`;
	}

	get text() {
		return `
			<div class="label--h1">${this.name}</div>
			<div class="label--h2">${this.isMoon ? 'Moon' : 'Planet'} #${this.index + 1} of ${this.parent.name}</div>
			<div>Size:<span>${toSize(this.size)}</span></div>
			<div>Temperature:<span>${toCelcius(this.temperature.min)} to ${toCelcius(this.temperature.max)}</span></div>
			<div>${this.atmosphere.text} atmosphere</div>
			${this.rings ? '<div>Has rings</div>' : ''}
			${this.clouds ? '<div>Cloudy</div>' : ''}
			${this.children && this.children.length > 0 ?
		`<div class="label--h3">Moons</div>
		<ol>
			${this.children.map(body => `<li>${body.textShort}</li>`).join('\n')}
		</ol>` :
		''}`;
	}

	get rotationSpeedAroundParent() {
		this.random('rotation_speed_parent');
		const speed = this.isMoon ? this.seed.rnd(10.0, 15.0) : this.seed.rnd(0.000001, 0.0000015);
		return this.parent.rotationSpeedAroundAxis / (Math.pow(this.distance, 5) * speed + 1.0) - this.parent.rotationSpeedAroundAxis;
	}

	get rotationSpeedAroundAxis() {
		this.random('rotation_speed');
		return this.seed.rnd(0.01, 0.20);
	}

	drawRotation() {
		if (this.object && this.object.position) {
			const rotateY = getTime() * this.rotationSpeedAroundParent;
			this.object.position.set(0, 0, 0);
			this.object.rotation.set(0, 0, 0);

			this.random('rotation_parent');
			this.object.rotateY(rotateY + this.seed.rnd(2 * Math.PI));
			this.object.translateX(this.distance * 0.0001 * TD.scale);

			this.object.rotation.set(0, 0, 0);
			this.random('rotation');
			this.object.rotateY(getTime() * -this.parent.rotationSpeedAroundAxis);
			this.object.rotateZ(this.seed.rnd(2 * Math.PI));
			this.object.rotateX(this.seed.rnd(2 * Math.PI));
			this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
			if (this.children) {
				for (const child of this.children) {
					child.drawRotation();
				}
			}
		}
	}

	drawSurface() {
		if (this.surfaceRenders.resolutions.length > 0 && this.object) {
			const resolution = this.surfaceRenders.resolutions[0];
			setColor(1, this.atmosphere.color.hue, this.atmosphere.color.saturation, this.atmosphere.color.lightness + 0.25, 'hsl');
			const bodySurface = new BodySurface({
				rnd: `planet_${this.system.id}_${this.index}_${this.parentId}`,
				size: this.size * 0.0001 * TD.scale,
				resolution,
				detail: 2 - this.surfaceRenders.resolutions.length,
				biome: this.surfaceRenders.last && this.surfaceRenders.last.biome,
				hasClouds: this.clouds,
				cloudColor: MISC.colorHelper
			}, () => {
				if (this.surfaceRenders.last) {
					deleteThree(this.surfaceRenders.last.ground);
				}
				this.surfaceRenders.resolutions.shift();
				this.surfaceRenders.last = bodySurface;
				this.drawSurface();
			}, () => {
				console.log('INTERRUPT SUCCESS!!!');
			});
			bodySurface.ground.name = 'Planet high ' + resolution;
			this.object.high.add(bodySurface.ground);
			// this.object.high = bodySurface.ground;
			if (bodySurface.clouds) {
				bodySurface.clouds.sphere.name = 'Planet clouds';
				this.object.high.add(bodySurface.clouds.sphere);
			}
		} else {
			this.setSurfaceRender();
		}
	}

	setSurfaceRender({ resolutions = [], last } = {}) {
		this.surfaceRenders = { resolutions, last };
	}

	show(obj = this.object && this.object.high) {
		if (obj) {
			obj.visible = true;
		}
	}
	hide(obj = this.object && this.object.high) {
		if (obj) {
			obj.visible = false;
		}
	}

	hideChildren() {
		for (const child of this.children) {
			if (child.object && child.object.high) {
				child.hide();
			}
		}
	}

	drawLow() {
		// Set atmosphere color as emmisive
		if (this.atmosphere && this.isPlanet) {
			setColor(2, this.atmosphere.color.hue, this.atmosphere.color.saturation, this.atmosphere.color.lightness, 'hsl');
		}

		// Mix inner and outer color
		if (this.outer && this.isPlanet) {
			const mix = getColorMix(
				this.color.r, this.color.g, this.color.b, // mix inner and outer sphere color
				this.outer.color.r, this.outer.color.g, this.outer.color.b,
				this.outer.opacity);
			setColor(1, ...mix);
		}

		// Planet pivot
		this.object = new THREE.Object3D();
		this.object.name = 'Planet pivot';
		this.parent.object.high.add(this.object);
		this.object.rotation.y = this.seed.rnd(2 * Math.PI) || 0;
		this.object.translateX(this.distance * 0.0001 * TD.scale || 0);

		// Planet sphere
		this.random('star_rotation');
		const bodySurface = new BodySurface({
			rnd: `planet_${this.system.id}_${this.index}_${this.parentId}`,
			size: (this.size * 0.000099) * TD.scale,
			resolution: 16,
			detail: 0,
		});
		this.object.low = bodySurface.ground;
		this.object.low.name = this.isPlanet ? 'Planet low' : 'Moon low';
		this.object.add(this.object.low);

		// Planet trajectory
		const trajectoryGeometry = new THREE.RingBufferGeometry(1.0 - ((this.isMoon ? 0.01 : 0.05) / this.distance), 1.0 + ((this.isMoon ? 0.01 : 0.05) / this.distance), 128, 1);
		const trajectoryMaterial = new THREE.MeshBasicMaterial({
			color: 0x0044ff,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			transparent: false,
			opacity: this.isMoon ? 0.15 : 0.25,
			depthTest: false
		});
		const trajectoryMesh = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
		trajectoryMesh.name = this.isPlanet ? 'Planet trajectory' : 'Moon trajectory';
		trajectoryMesh.rotation.x = Math.PI * 0.5;
		trajectoryMesh.scale.set(this.distance * 0.0001 * TD.scale, this.distance * 0.0001 * TD.scale, this.distance * 0.0001 * TD.scale);
		trajectoryMesh.castShadow = false;
		trajectoryMesh.receiveShadow = false;
		trajectoryMesh.renderOrder = -1;
		this.parent.object.high.add(trajectoryMesh);

		// Planet rings
		if (this.rings) {
			setColor(1, this.rings.color.r, this.rings.color.g, this.rings.color.b);
			const ringGeometry = new THREE.RingBufferGeometry(this.rings.size * 0.00006 * TD.scale, this.rings.size * ((this.rings.thickness * 0.00004) + 0.00006) * TD.scale, 64);
			const ringMaterial = new THREE.MeshPhongMaterial({
				map: TD.texture.planet.rings,
				color: MISC.colorHelper,
				emissive: MISC.colorHelper,
				emissiveIntensity: 0.01,
				opacity: this.rings.color.a,
				side: THREE.DoubleSide,
				blending: THREE.NormalBlending,
				alphaTest: 0,
				transparent: true,
				needsUpdate: true
			});
			const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
			ringMesh.name = 'Planet rings';
			ringMesh.customDepthMaterial = new THREE.MeshDepthMaterial({
				depthPacking: THREE.RGBADepthPacking,
				map: TD.texture.planet.rings,
				side: THREE.DoubleSide,
				opacity: this.rings.color.a,
				alphaTest: 0,
				transparent: true
			});
			ringMesh.renderOrder = 2;
			ringMesh.rotateX(Math.PI * 0.5);
			ringMesh.castShadow = true;
			ringMesh.receiveShadow = true;
			this.object.low.add(ringMesh);
		}
		this.object.low.this = this;
		return this.object.low;
	}

	drawHigh() {
		// Hide other high detail planets
		if (this.object) {
			if (this.object.high) {
				this.drawSurface();
				this.show();
			} else {
				this.object.high = new THREE.Object3D();
				this.object.high.name = 'Planet high pivot';
				this.object.add(this.object.high);
				this.drawSurface();

				// Planet atmosphere
				if (this.atmosphere.color.a) {
					setColor(1, this.atmosphere.color.hue, this.atmosphere.color.saturation, this.atmosphere.color.lightness, 'hsl');
					// eslint-disable-next-line no-unused-vars
					const atmosphere = new Atmosphere(this.object.high, {
						size: (this.size * 0.0001015) * TD.scale,
						thickness: (this.atmosphere.size * 0.0001015) * TD.scale,
						color: MISC.colorHelper,
						blending: THREE.AdditiveBlending,
						opacity: this.atmosphere.color.a
					});
				}

				// Draw moons of planet
				if (this.children && this.children.length) {
					for (const child of this.children) {
						child.drawLow();
					}
				}
			}
		}
	}
}
