import * as THREE from 'three';
import CloudMap from './CloudMap.js';
import { TD } from '../../../../variables.js';

class Clouds {
	constructor({ size, resolution }) {
		this.view = new THREE.Object3D();

		this.materials = [];
		this.roughness = 0.9;
		this.metalness = 0.5;
		this.normalScale = 5.0;
		this.clouds = 1.0;


		this.resolution = resolution;
		this.size = size * 1.001;


		this.color = new THREE.Color(0xffffff);

		this.cloudColor = [ this.color.r * 255, this.color.g * 255, this.color.b * 255 ];

		this.cloudMaps = [];

		this.setup();


		// const cloudControl = window.gui.add(this, 'clouds', 0.0, 1.0);
		// cloudControl.onChange(value => {
		// 	this.updateMaterial();
		// });

		// const colorControl = window.gui.addColor(this, 'cloudColor');
		// colorControl.onChange(value => {
		// 	this.color.r = value[0] / 255;
		// 	this.color.g = value[1] / 255;
		// 	this.color.b = value[2] / 255;
		// 	this.updateMaterial();
		// });
	}

	update() {
		//
	}

	setup() {
		this.cloudMap = new CloudMap(this.resolution);
		this.cloudMaps = this.cloudMap.maps;

		for (let i = 0; i < 6; i++) {
			const material = new THREE.MeshStandardMaterial({
				color: this.color,
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
		this.sphere = new THREE.Mesh(bufGeo, this.materials);
		this.view.add(this.sphere);
	}

	render(props) {
		this.seed = this.randRange(0, 100000);
		const cloudSize = this.randRange(0.5, 1.0);

		const mixScale = this.map_range(props.waterLevel * props.waterLevel, 0, 0.8, 0.0, 3.0);
		const size = {
			min: 0.1,
			max: 1
		};

		this.cloudMap.render({
			seed: this.seed,
			resolution: this.resolution,
			res1: this.randRange(size.min, size.max),
			res2: this.randRange(size.min, size.max),
			resMix: this.randRange(size.min, size.max),
			mixScale: this.randRange(size.min, size.max)
		});
		this.updateMaterial();
	}

	map_range(value, low1, high1, low2, high2) {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}

	updateMaterial() {
		for (let i = 0; i < 6; i++) {
			const material = this.materials[i];
			material.roughness = this.roughness;
			material.metalness = this.metalness;
			material.opacity = this.clouds;
			material.map = this.cloudMaps[i];
			// material.alphaMap = this.cloudMaps[i],
			// material.bumpMap = this.cloudMaps[i],
			// material.bumpScale = 1.0,
			material.color = this.color;
		}
	}

	randomizeColor() {
		this.color.r = this.randRange(0.5, 1.0);
		this.color.g = this.randRange(0.5, 1.0);
		this.color.b = this.randRange(0.5, 1.0);

		this.updateMaterial();
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
}

export default Clouds;
