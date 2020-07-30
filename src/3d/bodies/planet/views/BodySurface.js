import * as THREE from 'three';
import Biome from './Biome';
import NoiseMap from './NoiseMap.js';
import TextureMap from './TextureMap.js';
import NormalMap from './NormalMap.js';
import RoughnessMap from './RoughnessMap.js';
import Clouds from './Clouds.js';
import { MISC } from '../../../../variables';
import random from '../../../../misc/random';
import wait from '../../../tools/wait';

class BodySurface {
	constructor({ rnd, size, resolution, obj, biome, detail, hasClouds = false, cloudColor }, callback) {
		MISC.interrupt = true;
		this.seedString = rnd || 'lorem';
		this.initSeed();
		this.timerBank = this.seedString;
		this.ground = new THREE.Mesh();
		this.obj = obj;

		this.materials = [];
		this.detail = detail;
		this.roughness = 0.8;
		this.metalness = 0.5;
		this.normalScale = 3.0;
		this.size = size || 1;
		this.hasClouds = hasClouds && this.detail === 0;

		this.heightMaps = [];
		this.moistureMaps = [];
		this.textureMaps = [];
		this.normalMaps = [];
		this.roughnessMaps = [];
		this.resolution = resolution || 256;
		this.segments = resolution / 32 > 16 ? resolution / 32 : 16;
		this.cloudColor = cloudColor;
		this.clouds = undefined;
		if (this.hasClouds) {
			this.clouds = this.createClouds();
		}
		wait(this.timerBank, () => {
			this.initSeed();
			this.biome = biome || new Biome();
			wait(this.timerBank, () => {
				this.createScene();
				this.render(resolution, callback);
			});
		});
	}

	render(detail, callback) {
		this.resolution = detail || 256;
		console.log(`[${this.timerBank}] RENDER: ${this.resolution}`);
		// wait(() => {
		this.renderScene(callback);
		// });
	}

	initSeed() {
		window.rng = random(this.seedString);
	}

	createScene() {
		this.heightMap = new NoiseMap(this.resolution);
		this.heightMaps = this.heightMap.maps;

		this.moistureMap = new NoiseMap(this.resolution, this.detail > 0);
		this.moistureMaps = this.moistureMap.maps;

		this.textureMap = new TextureMap(this.resolution);
		this.textureMaps = this.textureMap.maps;

		this.normalMap = new NormalMap(this.resolution, this.detail > 0);
		this.normalMaps = this.normalMap.maps;

		this.roughnessMap = new RoughnessMap(this.resolution, this.detail > 1);
		this.roughnessMaps = this.roughnessMap.maps;

		for (let i = 0; i < 6; i++) {
			const material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(0xffffff),
				transparent: true,
				// opacity: 0,
				alphaTest: 0
			});
			this.materials[i] = material;
		}
		const geo = new THREE.BoxGeometry(1, 1, 1, this.segments, this.segments, this.segments);
		const radius = this.size;
		for (const vertex of geo.vertices) {
  		vertex.normalize().multiplyScalar(radius);
		}
		this.computeGeometry(geo);
		this.geometry = new THREE.BufferGeometry().fromGeometry(geo);
		geo.dispose();
		this.ground.geometry = this.geometry;
		this.ground.material = this.materials;
		this.ground.castShadow = true;
		this.ground.receiveShadow = true;
		this.ground.visible = false;
		// this.view.add(this.ground);
	}

	renderCallback(message, callback) {
		this.updateMaterial();
		this.ground.visible = true;
		console.log(`[${this.timerBank}] ${message} PLANET: ${this.resolution}`);
		if (callback) {
			callback();
		}
	}

	renderScene(callback) {
		this.initSeed();
		this.seed = this.randRange(0, 1) * 100000.0;
		this.waterLevel = this.randRange(0.0, 1.0);
		this.updateNormalScaleForRes(this.resolution);

		this.renderBiomeTexture();

		let resMin = 0.01;
		let resMax = 5.0;

		MISC.interrupt = false;
		this.initSeed();
		this.heightMap.render({
			timerBank: this.timerBank,
			seed: this.seed,
			resolution: this.resolution,
			res1: this.randRange(resMin, resMax),
			res2: this.randRange(resMin, resMax),
			resMix: this.randRange(resMin, resMax),
			mixScale: this.randRange(0.5, 1.0),
			doesRidged: Math.floor(this.randRange(0, 4))
			// doesRidged: 1
		}, () => {
		// this.updateMaterial();
			const resMod = this.randRange(3, 10);
			resMax = resMax * resMod;
			resMin = resMin * resMod;

			this.moistureMap.render({
				timerBank: this.timerBank,
				seed: this.seed + 392.253,
				resolution: this.resolution,
				res1: this.randRange(resMin, resMax),
				res2: this.randRange(resMin, resMax),
				resMix: this.randRange(resMin, resMax),
				mixScale: this.randRange(0.5, 1.0),
				doesRidged: Math.floor(this.randRange(0, 4))
			// doesRidged: 0
			}, () => {
			// this.updateMaterial();
				this.textureMap.render({
					timerBank: this.timerBank,
					resolution: this.resolution,
					heightMaps: this.heightMaps,
					moistureMaps: this.moistureMaps,
					biomeMap: this.biome.texture
				}, () => {
					// this.updateMaterial();
					this.normalMap.render({
						timerBank: this.timerBank,
						resolution: this.resolution,
						waterLevel: this.waterLevel,
						heightMaps: this.heightMaps,
						textureMaps: this.textureMaps
					}, () => {
						// this.updateMaterial();
						this.roughnessMap.render({
							timerBank: this.timerBank,
							resolution: this.resolution,
							heightMaps: this.heightMaps,
							waterLevel: this.waterLevel
						}, () => {
							if (this.hasClouds) {
								this.clouds.render({
									timerBank: this.timerBank,
									waterLevel: this.waterLevel
								}, () => {
									this.renderCallback('CALLBACK', callback);
								});
							} else {
								this.renderCallback('CALLBACK', callback);
							}
						});
					});
				});
			});
		});
	}

	updateMaterial() {
		for (let i = 0; i < 6; i++) {
			const material = this.materials[i];
			material.roughness = this.roughness;
			material.metalness = this.metalness;

			material.map = this.textureMaps[i];
			material.normalMap = this.normalMaps[i];
			material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
			material.roughnessMap = this.roughnessMaps[i];
			material.metalnessMap = this.roughnessMaps[i];
			// material.opacity = 1;
			material.needsUpdate = true;
		}
	}

	renderBiomeTexture() {
		if (!this.biome.texture) {
			this.biome.generateTexture({ waterLevel: this.waterLevel });
		}
	}

	createClouds() {
		return new Clouds({
			rnd: this.seedString,
			size: this.size,
			resolution: 512,
			show: true,
			color: this.cloudColor
		});
		// this.ground.add(this.clouds.view);
	}

	updateNormalScaleForRes(value) {
		switch (value) {
		case 64: this.normalScale = 0.1; break;
		case 256: this.normalScale = 0.25; break;
		case 512: this.normalScale = 0.5; break;
		case 1024: this.normalScale = 1.0; break;
		case 2048: this.normalScale = 1.5; break;
		case 4096: this.normalScale = 3.0; break;
		default: this.normalScale = 0; break;
		}
	}

	randRange(low, high) {
		const range = high - low;
		const n = window.rng() * range;
		return low + n;
	}

	computeGeometry(geometry) {
  	geometry.computeVertexNormals();
  	geometry.computeFaceNormals();
  	geometry.computeBoundingSphere();
  	geometry.computeBoundingBox();

  	geometry.verticesNeedUpdate = true;
  	geometry.elementsNeedUpdate = true;
  	geometry.uvsNeedUpdate = true;
  	geometry.normalsNeedUpdate = true;
  	geometry.colorsNeedUpdate = true;
  	geometry.lineDistancesNeedUpdate = true;
  	geometry.groupsNeedUpdate = true;
	}
}

export default BodySurface;
