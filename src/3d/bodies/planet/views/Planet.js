import * as THREE from 'three';
import Biome from './Biome';
import NoiseMap from './NoiseMap.js';
import TextureMap from './TextureMap.js';
import NormalMap from './NormalMap.js';
import RoughnessMap from './RoughnessMap.js';
import Clouds from './Clouds.js';
import seedrandom from 'seedrandom';
import wait from '../../../tools/wait';

class Planet {
	constructor({ rnd, size, resolution, obj, biome }, callback) {
		this.seedString = rnd || 'lorem';
		this.initSeed();

		this.view = new THREE.Object3D();
		this.obj = obj;

		this.materials = [];
		this.roughness = 0.8;
		this.metalness = 0.5;
		this.normalScale = 3.0;
		this.size = size || 1;
		this.waterLevel = 0.0;
		// this.waterLevel = 0.5;
		this.hasClouds = false;// this.randRange(0, 2) < 1;

		this.heightMaps = [];
		this.moistureMaps = [];
		this.textureMaps = [];
		this.normalMaps = [];
		this.roughnessMaps = [];
		this.resolution = resolution || 256;
		this.segments = resolution / 32 > 16 ? resolution / 32 : 16;
		this.biome = biome || new Biome();
		// wait(true, () => {
		this.createScene();
		this.render(resolution, callback);
		// });
	}

	render(detail, callback) {
		this.resolution = detail || 256;
		console.log('RENDER:', this.resolution, 2);
		if (this.hasClouds) {
			this.createClouds();
		}
		// wait(() => {
		this.renderScene(callback);
		// });
	}

	initSeed() {
		window.rng = seedrandom(this.seedString);
	}

	createScene() {
		this.heightMap = new NoiseMap(this.resolution);
		this.heightMaps = this.heightMap.maps;

		this.moistureMap = new NoiseMap(this.resolution);
		this.moistureMaps = this.moistureMap.maps;

		this.textureMap = new TextureMap(this.resolution);
		this.textureMaps = this.textureMap.maps;

		this.normalMap = new NormalMap(this.resolution);
		this.normalMaps = this.normalMap.maps;

		this.roughnessMap = new RoughnessMap(this.resolution);
		this.roughnessMaps = this.roughnessMap.maps;

		for (let i = 0; i < 6; i++) {
			const material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(0xffffff),
				transparent: true,
				opacity: 0
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
		this.ground = new THREE.Mesh(this.geometry, this.materials);
		this.ground.castShadow = true;
		this.ground.receiveShadow = true;
		this.view.add(this.ground);
	}


	renderScene(callback) {
		this.initSeed();
		this.seed = this.randRange(0, 1) * 1000.0;
		this.waterLevel = this.randRange(0.1, 0.5);
		if (this.hasClouds) {
			this.clouds.resolution = this.resolution;
		}

		this.updateNormalScaleForRes(this.resolution);

		this.renderBiomeTexture();
		if (this.hasClouds) {
			this.clouds.randomizeColor();
		}
		if (this.glow) {
			this.glow.randomizeColor();
		}
		let resMin = 0.01;
		let resMax = 5.0;

		this.initSeed();
		// wait(() => {
		if (this.hasClouds) {
			console.log(1234);
			this.clouds.render({
				waterLevel: this.waterLevel
			});
			 // this.updateMaterial();
		}
		// wait(() => {
		this.heightMap.render({
			seed: this.seed,
			resolution: this.resolution,
			res1: this.randRange(resMin, resMax),
			res2: this.randRange(resMin, resMax),
			resMix: this.randRange(resMin, resMax),
			mixScale: this.randRange(0.5, 1.0),
			doesRidged: Math.floor(this.randRange(0, 4))
			// doesRidged: 1
		});
		// this.updateMaterial();
		// wait(() => {
		const resMod = this.randRange(3, 10);
		resMax = resMax * resMod;
		resMin = resMin * resMod;

		this.moistureMap.render({
			seed: this.seed + 392.253,
			resolution: this.resolution,
			res1: this.randRange(resMin, resMax),
			res2: this.randRange(resMin, resMax),
			resMix: this.randRange(resMin, resMax),
			mixScale: this.randRange(0.5, 1.0),
			doesRidged: Math.floor(this.randRange(0, 4))
			// doesRidged: 0
		});
		// this.updateMaterial();
		// wait(() => {
		this.textureMap.render({
			resolution: this.resolution,
			heightMaps: this.heightMaps,
			moistureMaps: this.moistureMaps,
			biomeMap: this.biome.texture
		});
		// this.updateMaterial();
		// wait(() => {
		this.normalMap.render({
			resolution: this.resolution,
			waterLevel: this.waterLevel,
			heightMaps: this.heightMaps,
			textureMaps: this.textureMaps
		});
		// this.updateMaterial();
		// wait(() => {
		this.roughnessMap.render({
			resolution: this.resolution,
			heightMaps: this.heightMaps,
			waterLevel: this.waterLevel
		}, () => {
			this.updateMaterial();
			if (callback) {
				console.log('CALLBACK');
				callback();
			}
		});
		// 					});
		// 				});
		// 			});
		// 		});
		// 	});
		// });
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
			material.opacity = 1;
			material.needsUpdate = true;
		}
	}

	renderBiomeTexture() {
		if (!this.biome.texture) {
			this.biome.generateTexture({ waterLevel: this.waterLevel });
		}
	}

	createClouds() {
		this.clouds = new Clouds({ size: this.size, resolution: 256 });
		this.view.add(this.clouds.view);
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

export default Planet;
