import * as THREE from 'three';
import Biome from './Biome';
import Atmosphere from './Atmosphere.js';
import AtmosphereRing from './AtmosphereRing';
import NoiseMap from './NoiseMap.js';
import TextureMap from './TextureMap.js';
import NormalMap from './NormalMap.js';
import RoughnessMap from './RoughnessMap.js';
import Clouds from './Clouds.js';
import Glow from './Glow.js';
import seedrandom from 'seedrandom';

class Planet {
	constructor(canvas, { rnd, size, detail }) {
		this.seedString = rnd || 'lorem';
		this.initSeed();

		this.view = new THREE.Object3D();

		this.materials = [];
		this.roughness = 0.8;
		this.metalness = 0.5;
		this.normalScale = 3.0;
		this.resolution = detail || 256;
		this.size = size || 1;
		this.waterLevel = 0.0;
		// this.waterLevel = 0.5;

		this.heightMaps = [];
		this.moistureMaps = [];
		this.textureMaps = [];
		this.normalMaps = [];
		this.roughnessMaps = [];
		// setTimeout(() => {
		// setTimeout(() => {
		this.biome = new Biome(canvas);
		// this.nebulaeGradient = new NebulaeGradient();
		this.createScene();
		// this.createStars();
		// this.createNebula();
		// this.createSun();
		// setTimeout(() => {
		this.createClouds();
		// this.createGlow();

		// this.atmosphereRing = new AtmosphereRing();
		// this.view.add(this.atmosphereRing.view);

		// this.createAtmosphere();
		// this.loadSeedFromURL();
		this.renderScene();

		// this.rotate = true;
		// this.autoGenerate = false;
		// this.autoGenCountCurrent = 0;
		// this.autoGenTime = 3 * 60;
		// this.autoGenCountMax = this.autoGenTime * 60;
		// }, 100);
		 	// }, 100);
		// }, 100);
	}

	update() {
		// if (this.rotate) {
		// this.ground.rotation.y += 0.0005;
		// this.stars.view.rotation.y += 0.0003;
		// this.nebula.view.rotation.y += 0.0003;
		// this.clouds.view.rotation.y += 0.0007;
		// }

		// this.atmosphere.update();


		// this.glow.update();

		// if (this.autoGenerate) {
		// 	this.autoGenCountCurrent++;
		// 	if (this.autoGenCountCurrent > this.autoGenCountMax) {
		// 		this.randomize();
		// 	}
		// }

		// this.stars.view.position.copy(window.camera.position);
		// this.nebula.view.position.copy(window.camera.position);

		// this.atmosphereRing.update();
	}

	// renderUI() {
	// 	const infoBoxHolder = document.createElement('div');
	// 	infoBoxHolder.setAttribute('id', 'infoBoxHolder');
	// 	document.body.appendChild(infoBoxHolder);

	// 	const infoBox = document.createElement('div');
	// 	infoBox.setAttribute('id', 'infoBox');
	// 	infoBox.innerHTML = 'Planet<br><div id=\'planetName\'></div><br><div id=\'instructions\'>H - Show/Hide UI<br>SPACEBAR - New Planet</div>';
	// 	infoBoxHolder.appendChild(infoBox);

	// 	const line = document.createElement('div');
	// 	line.setAttribute('id', 'line');
	// 	infoBoxHolder.appendChild(line);
	// 	infoBoxHolder.appendChild(window.gui.domElement);

	// 	// mobile info box
	// 	const mobileInfoBox = document.createElement('div');
	// 	mobileInfoBox.setAttribute('id', 'infoBoxHolderMobile');
	// 	mobileInfoBox.innerHTML = '<div id=\'infoBoxMobile\'>Planet<br><div id=\'planetNameMobile\'></div></div>';
	// 	document.body.appendChild(mobileInfoBox);

	// 	this.updatePlanetName();

	// 	// new planet button
	// 	const newPlanetButtonHolder = document.createElement('div');
	// 	newPlanetButtonHolder.setAttribute('id', 'newPlanetButtonHolder');
	// 	newPlanetButtonHolder.innerHTML = '<div id=\'newPlanetButton\'>New Planet</div>';
	// 	document.body.appendChild(newPlanetButtonHolder);

	// 	const newPlanetButton = document.getElementById('newPlanetButton');
	// 	newPlanetButton.addEventListener('click', (e) => {
	// 		this.randomize();
	// 	});
	// }

	// updatePlanetName() {
	// 	const planetName = document.getElementById('planetName');
	// 	if (planetName != null) {
	// 		planetName.innerHTML = this.seedString;
	// 	}

	// 	const planetNameMobile = document.getElementById('planetNameMobile');
	// 	if (planetNameMobile != null) {
	// 		planetNameMobile.innerHTML = this.seedString;
	// 	}
	// }

	initSeed() {
		window.rng = seedrandom(this.seedString);
	}

	loadSeedFromURL() {
		// this.seedString = this.getParameterByName('seed');
		// if (this.seedString) {
		// console.log('seed string exists');
		this.regenerate();
		// } else {
		// console.log('no seed string');
		// this.randomize();
		// }
	}

	// loadSeedFromTextfield() {
	// 	const url = this.updateQueryString('seed', this.seedString);
	// 	window.history.pushState({ seed: this.seedString }, this.seedString, url);
	// 	this.regenerate();
	// }

	// regenerate() {
	// 	this.autoGenCountCurrent = 0;
	// 	this.renderScene();
	// }

	// randomize() {
	// 	// this.seedString = randomString(10);

	// 	const n = Math.random();
	// 	let wordCount = 0;
	// 	if (n > 0.8) {
	// 		wordCount = 1;
	// 	} else if (n > 0.4) {
	// 		wordCount = 2;
	// 	} else {
	// 		wordCount = 3;
	// 	}

	// 	this.seedString = '';
	// 	for (let i = 0; i < wordCount; i++) {
	// 		this.seedString = this.seedString + this.capitalizeFirstLetter(randomLorem({ min: 2, max: 8 }));
	// 		if (i < wordCount - 1) {
	// 			this.seedString = this.seedString + ' ';
	// 		}
	// 	}

	// 	// this.seedString = randomLorem({ min: 2, max: 8 });
	// 	// this.seedString += " " + randomLorem({ min: 2, max: 8 });
	// 	const url = this.updateQueryString('seed', this.seedString);
	// 	window.history.pushState({ seed: this.seedString }, this.seedString, url);
	// 	this.autoGenCountCurrent = 0;
	// 	this.renderScene();
	// }

	// capitalizeFirstLetter(string) {
	// 	return string.charAt(0).toUpperCase() + string.slice(1);
	// }


	createScene() {
		this.heightMap = new NoiseMap(this.canvas);
		this.heightMaps = this.heightMap.maps;

		this.moistureMap = new NoiseMap(this.canvas);
		this.moistureMaps = this.moistureMap.maps;

		this.textureMap = new TextureMap(this.canvas);
		this.textureMaps = this.textureMap.maps;

		this.normalMap = new NormalMap(this.canvas);
		this.normalMaps = this.normalMap.maps;

		this.roughnessMap = new RoughnessMap(this.canvas);
		this.roughnessMaps = this.roughnessMap.maps;

		for (let i = 0; i < 6; i++) {
			const material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(0xFFFFFF),
				transparent: true
			});
			this.materials[i] = material;
		}
		const geo = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
		const radius = this.size;
		for (const vertex of geo.vertices) {
  		vertex.normalize().multiplyScalar(radius);
  	}
		this.computeGeometry(geo);
		const bufGeo = new THREE.BufferGeometry().fromGeometry(geo);
		geo.dispose();
		this.ground = new THREE.Mesh(bufGeo, this.materials);

		this.ground.castShadow = true;
		this.ground.receiveShadow = true;
		this.view.add(this.ground);
	}


	renderScene() {
		this.initSeed();
		// this.updatePlanetName();

		this.seed = this.randRange(0, 1) * 1000.0;
		this.waterLevel = this.randRange(0.1, 0.5);
		this.clouds.resolution = this.resolution;

		this.updateNormalScaleForRes(this.resolution);
		this.renderBiomeTexture();
		// this.renderNebulaeGradient();

		// this.stars.resolution = this.resolution;
		// this.nebula.resolution = this.resolution;
		// this.atmosphere.randomizeColor();
		if (this.clouds) {
			this.clouds.randomizeColor();
		}
		if (this.glow) {
			this.glow.randomizeColor();
		}
		// this.clouds.color = this.atmosphere.color;

		// window.renderQueue.start();

		let resMin = 0.01;
		let resMax = 5.0;

		// setTimeout(() => {
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
		// setTimeout(() => {
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
		// setTimeout(() => {
		this.textureMap.render({
			resolution: this.resolution,
			heightMaps: this.heightMaps,
			moistureMaps: this.moistureMaps,
			biomeMap: this.biome.texture
		});
		// setTimeout(() => {
		this.normalMap.render({
			resolution: this.resolution,
			waterLevel: this.waterLevel,
			heightMaps: this.heightMaps,
			textureMaps: this.textureMaps
		});
		// setTimeout(() => {
		this.roughnessMap.render({
			resolution: this.resolution,
			heightMaps: this.heightMaps,
			waterLevel: this.waterLevel
		});
		// setTimeout(() => {
		this.clouds.render({
			waterLevel: this.waterLevel
		});
		this.updateMaterial();
		// 					}, 100);
		// 				}, 100);
		// 			}, 100);
		// 		}, 100);
		// 	}, 100);
		// }, 100);

		// this.stars.render({
		// 	nebulaeMap: this.nebulaeGradient.texture
		// });

		// this.nebula.render({
		// 	nebulaeMap: this.nebulaeGradient.texture
		// });

		// this.sun.render();


		// window.renderQueue.addCallback(() => {
	}

	updateMaterial() {
		for (let i = 0; i < 6; i++) {
			const material = this.materials[i];
			material.roughness = this.roughness;
			material.metalness = this.metalness;

			// if (this.displayMap === 'textureMap') {
			material.map = this.textureMaps[i];
			material.normalMap = this.normalMaps[i];
			material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
			material.roughnessMap = this.roughnessMaps[i];
			material.metalnessMap = this.roughnessMaps[i];
			// } else if (this.displayMap === 'heightMap') {
			// 	material.map = this.heightMaps[i];
			// 	material.normalMap = null;
			// 	material.roughnessMap = null;
			// } else if (this.displayMap === 'moistureMap') {
			// 	material.map = this.moistureMaps[i];
			// 	material.normalMap = null;
			// 	material.roughnessMap = null;
			// } else if (this.displayMap === 'normalMap') {
			// 	material.map = this.normalMaps[i];
			// 	material.normalMap = null;
			// 	material.roughnessMap = null;
			// } else if (this.displayMap === 'roughnessMap') {
			// 	material.map = this.roughnessMaps[i];
			// 	material.normalMap = null;
			// 	material.roughnessMap = null;
			// }
			material.needsUpdate = true;
		}
	}

	renderBiomeTexture() {
		this.biome.generateTexture({ waterLevel: this.waterLevel });
	}

	// renderNebulaeGradient() {
	// 	this.nebulaeGradient.generateTexture();
	// }

	// createAtmosphere() {
	// 	this.atmosphere = new Atmosphere();
	// 	// this.atmosphere.color = this.glow.color;
	// 	this.view.add(this.atmosphere.view);
	// }

	createGlow() {
		this.glow = new Glow({ size: this.size });
		// this.glow.color = this.atmosphere.color;
		this.view.add(this.glow.view);
	}

	createClouds() {
		this.clouds = new Clouds({ size: this.size });
		this.view.add(this.clouds.view);
	}

	// createStars() {
	// 	this.stars = new Stars();
	// 	this.view.add(this.stars.view);
	// }

	// createNebula() {
	// 	this.nebula = new Nebula();
	// 	this.view.add(this.nebula.view);
	// }

	// createSun() {
	// 	this.sun = new Sun();
	// 	this.view.add(this.sun.view);
	// }

	updateNormalScaleForRes(value) {
		if (value === 256) {
			this.normalScale = 0.25;
		}
		if (value === 512) {
			this.normalScale = 0.5;
		}
		if (value === 1024) {
			this.normalScale = 1.0;
		}
		if (value === 2048) {
			this.normalScale = 1.5;
		}
		if (value === 4096) {
			this.normalScale = 3.0;
		}
	}

	randRange(low, high) {
		const range = high - low;
		const n = window.rng() * range;
		return low + n;
	}

	computeGeometry(geometry) {
  	// geometry.makeGroups();
  	geometry.computeVertexNormals();
  	geometry.computeFaceNormals();
  	geometry.computeMorphNormals();
  	geometry.computeBoundingSphere();
  	geometry.computeBoundingBox();
  	// geometry.computeLineDistances();

  	geometry.verticesNeedUpdate = true;
  	geometry.elementsNeedUpdate = true;
  	geometry.uvsNeedUpdate = true;
  	geometry.normalsNeedUpdate = true;
  	// geometry.tangentsNeedUpdate = true;
  	geometry.colorsNeedUpdate = true;
  	geometry.lineDistancesNeedUpdate = true;
  	// geometry.buffersNeedUpdate = true;
  	geometry.groupsNeedUpdate = true;
	}

	// updateQueryString(key, value, urlA) {
	// 	let url = urlA;
	// 	if (!url) {
	// 		url = window.location.href;
	// 	}
	// 	const re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi'),
	// 		hash;

	// 	if (re.test(url)) {
	// 		if (typeof value !== 'undefined' && value !== null) {
	// 			return url.replace(re, '$1' + key + '=' + value + '$2$3');
	// 		}

	// 		hash = url.split('#');
	// 		url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
	// 		if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
	// 			url = url + ('#' + hash[1]);
	// 		}
	// 		return url;
	// 	}

	// 	if (typeof value !== 'undefined' && value !== null) {
	// 		var separator = url.indexOf('?') !== -1 ? '&' : '?';
	// 		hash = url.split('#');
	// 		url = hash[0] + separator + key + '=' + value;
	// 		if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
	// 			url = url + ('#' + hash[1]);
	// 		}
	// 		return url;
	// 	}
	// 	return url;
	// }

	// getParameterByName(name, url) {
	// 	if (!url) {
	// 		url = window.location.href;
	// 	}
	// 	name = name.replace(/[\[\]]/g, '\\$&');
	// 	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
	// 		results = regex.exec(url);
	// 	if (!results) {
	// 		return null;
	// 	}
	// 	if (!results[2]) {
	// 		return '';
	// 	}
	// 	return decodeURIComponent(results[2].replace(/\+/g, ' '));
	// }
}

export default Planet;
