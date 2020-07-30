import * as THREE from 'three';
import { MISC, TD } from '../../../variables';
import setColor, { getColorMix } from '../../../misc/color';
import { toCelcius } from '../../../misc/temperature';
import { deleteThree } from '../../init/init';
import getTime from '../../../misc/time';
import BodySurface from './views/BodySurface';
import Atmosphere from './Atmosphere';
import random from '../../../misc/random';
import { toSize } from '../../../misc/size';
import Word from '../../../misc/Word';

export default class Body {
	constructor({ star, id, parent }) {
		this.star = star;
		this.id = id;
		this.parent = parent;
		this.isMoon = parent instanceof Body;
		this.object = {
			low: undefined,
			high: undefined
		};
		// this.objectLow = undefined;
		this.surfaceRenders = {
			resolutions: [ 128, 512, 1024 ],
			last: undefined
		};
	}

	random(seed) {
		const seedString = `${seed}_${this.star.id}_${this.parentId}_${this.id}`;
		MISC.rnd = random(seedString);
		return seedString;
	}

	get name() {
		this.random('body_name');
		return new Word();
	}

	get size() {
		const parentSize = this.parent.size;
		this.random('body_size');
		let size = parentSize * (MISC.rnd() * 0.02 + 0.002);
		if (this.isMoon) {
			size = parentSize * (MISC.rnd() * 0.2 + 0.02);
		}
		return size;
	}

	get parentId() {
		return this.parent ? this.parent.id : -1;
	}

	get distance() {
		let size = this.parent.size * 0.2;
		let scale = 0.5;
		const id = this.id + 1;
		if (this.isMoon) {
			size = this.parent.size;
			scale = 0.05;
		}
		this.random('body_distance');
		return size + ((id * id * ((MISC.rnd() * 0.25) + 1) + 3 + MISC.rnd() * 0.5)) * scale;
	}

	get temperature() {
		const starTemp = this.parent.temperature.min;
		this.random('body_temperature');
		let temp = [
			Math.floor(starTemp / ((MISC.rnd() * (this.distance * 2) + (this.distance * 1.5)) * 1)),
			Math.floor(starTemp / ((MISC.rnd() * (this.distance * 2) + (this.distance * 1.5)) * 1))
		];
		temp = temp.sort((a, b) => (a > b ? 1 : -1));
		return {
			min: temp[0],
			max: temp[1]
		};
	}

	get atmosphere() {
		let atmos = {
			size: 0,
			color: {
				hue: 0,
				saturation: 0,
				lightness: 0,
				a: 0
			}
		};
		// if (!this.isMoon) {
		this.random('body_atmosphere');
		if (MISC.rnd() > 0.2) {
			atmos = {
				size: MISC.rnd() * Number(this.size) * 0.1,
				color: {
					hue: MISC.rnd(),
					saturation: MISC.rnd() * 0.5 + 0.25,
					lightness: MISC.rnd() * 0.5 + 0.25,
					a: MISC.rnd()
				}
			};
		}
		// }
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
		return {
			...atmos,
			text
		};
	}

	get clouds() {
		this.random('body_clouds');
		if (!this.isMoon && this.atmosphere.text !== 'No' && Math.floor(MISC.rnd() * 2) === 0) {
			return {
				hue: this.atmosphere.color.hue + MISC.rnd() * 0.2,
				saturation: this.atmosphere.color.saturation,
				lightness: this.atmosphere.color.lightness + MISC.rnd() * 0.25
			};
		}
		return false;
	}

	get rings() {
		if (!this.isMoon) {
			this.random('body_ring');
			 if (this.size > 0.01 && MISC.rnd() < 0.5) {
				return {
					thickness: MISC.rnd(),
					size: this.size * 2 + MISC.rnd() * this.size * 3,
					color: {
						r: MISC.rnd(),
						g: MISC.rnd(),
						b: MISC.rnd(),
						a: MISC.rnd() * 0.75 + 0.25
					}
				};
			}
		}
	}

	getChildren() {
		if (!this.children) {
			const children = [];
			this.random('body_moons');
			const childrenLength = Math.floor(MISC.rnd() * this.size * 50);
			if (!this.isMoon && childrenLength) {
				for (let id = 0; id < childrenLength; id++) {
					const child = new Body({ star: this.star, id, parent: this });
					// child.getChildren();
					children.push(child);
				}
			}
			this.children = children;
		}
		return this.children;
	}

	get textShort() {
		return this.name;
	}

	get text() {
		return `
			<div class="label--h1">${this.name}</div>
			<div class="label--h2">${this.isMoon ? 'Moon' : 'Planet'} #${this.id + 1} of ${this.parent.name}</div>
			<div>Size: ${toSize(this.size)}</div>
			<div>Temperature: ${toCelcius(this.temperature.min)} to ${toCelcius(this.temperature.max)}</div>
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

	get axisRotationSpeed() {
		this.random('body_rotation_speed');
		return MISC.rnd() * 0.01;
	}

	get parentRotationSpeed() {
		const temp = this.parent.temperature.min;
		this.random('body_star_rotation_speed');
		return temp / ((MISC.rnd() * (this.distance * 2) + (this.distance * 1.5)) * 10 * TD.scale);
	}

	drawRotation() {
		if (this.object) {
			this.object.position.set(0, 0, 0);
			this.object.rotation.set(0, 0, 0);

			this.random('body_star_rotation');
			this.object.rotateY((getTime() * this.parentRotationSpeed) + Math.PI * MISC.rnd() * 2);
			this.object.translateX(this.distance * 0.001 * TD.scale);
			this.random('body_rotation');
			this.object.rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);
			this.object.rotateY(getTime() * TD.stargrid.size * this.axisRotationSpeed);
		}
	}

	drawSurface() {
		if (this.surfaceRenders.resolutions.length > 0 && this.object) {
			const resolution = this.surfaceRenders.resolutions[0];
			setColor(1, this.atmosphere.color.hue, this.atmosphere.color.saturation, this.atmosphere.color.lightness + 0.25, 'hsl');
			const bodySurface = new BodySurface({
				rnd: `planet_${this.star.id}_${this.id}_${this.parentId}`,
				size: this.size * 0.001 * TD.scale,
				resolution,
				detail: 3 - this.surfaceRenders.resolutions.length,
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
			// for (const child of obj.children) {
			// 	this.show(child);
			// }
		}
	}
	hide(obj = this.object && this.object.high) {
		if (obj) {
			obj.visible = false;
			// for (const child of obj.children) {
			// 	this.hide(child);
			// }
		}
	}

	drawLow() {
		// Set atmosphere color as emmisive
		if (this.atmosphere && !this.isMoon) {
			setColor(2, this.atmosphere.color.hue, this.atmosphere.color.saturation, this.atmosphere.color.lightness, 'hsl');
		}

		// Mix inner and outer color
		if (this.outer && !this.isMoon) {
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
		this.object.rotation.y = Math.PI * MISC.rnd() * 2 || 0;
		this.object.translateX(this.distance * 0.001 * TD.scale || 0);

		// Planet sphere
		this.random('body_star_rotation');
		const bodySurface = new BodySurface({
			rnd: `planet_${this.star.id}_${this.id}_${this.parentId}`,
			size: (this.size * 0.00099) * TD.scale,
			resolution: 64,
			detail: 0,
		});
		this.object.low = bodySurface.ground;
		this.object.low.name = 'Planet low';
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
		trajectoryMesh.name = 'Planet trajectory';
		trajectoryMesh.rotation.x = Math.PI * 0.5;
		trajectoryMesh.scale.set(this.distance * 0.001 * TD.scale, this.distance * 0.001 * TD.scale, this.distance * 0.001 * TD.scale);
		trajectoryMesh.castShadow = false;
		trajectoryMesh.receiveShadow = false;
		trajectoryMesh.renderOrder = -1;
		this.parent.object.high.add(trajectoryMesh);

		// Planet atmosphere
		if (this.atmosphere.color.a) {
			setColor(1, this.atmosphere.color.hue, this.atmosphere.color.saturation, this.atmosphere.color.lightness, 'hsl');
			// eslint-disable-next-line no-unused-vars
			const atmosphere = new Atmosphere(this.object.low, {
				size: (this.size * 0.001015) * TD.scale,
				thickness: (this.atmosphere.size * 0.001015) * TD.scale,
				color: MISC.colorHelper,
				opacity: this.atmosphere.color.a
			});
		}

		// Planet rings
		if (this.rings) {
			setColor(1, this.rings.color.r, this.rings.color.g, this.rings.color.b);
			const ringGeometry = new THREE.RingBufferGeometry(this.rings.size * 0.0006 * TD.scale, this.rings.size * ((this.rings.thickness * 0.0004) + 0.0006) * TD.scale, 64);
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
			ringMesh.renderOrder = 1;
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
		for (const planet of this.star.children) {
			if (planet.object && planet.object.high) {
				planet.hide();
			}
		}
		if (this.object) {
			if (this.object.high) {
				this.drawSurface();
				this.show();
			} else {
				this.object.high = new THREE.Object3D();
				this.object.high.name = 'Planet high pivot';
				this.object.add(this.object.high);
				this.drawSurface();

				// Draw moons of planet
				if (this.children && this.children.length) {
					for (const child of this.children) {
						child.drawLow();
					}
				}
			}
			// Update star spotlight
			// this.star.light.target = this.object.low;
			// this.star.light.visible = true;
			// TD.scene.add(new THREE.CameraHelper(this.star.light.shadow.camera)); // TEST
			// this.object.this = this;
		}
	}
}
