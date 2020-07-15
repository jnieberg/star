import * as THREE from 'three';
import { TD } from '../../../../variables';

class Map {
	constructor(canvas) {
		this.canvas = canvas;
	}

	setup() {
		this.maps = [];
		this.textures = [];
		this.textureCameras = [];
		this.textureScenes = [];
		this.planes = [];
		this.geos = [];

		for (let i = 0; i < 6; i++) {
			const tempRes = 1000;
			this.textures[i] = new THREE.WebGLRenderTarget(tempRes, tempRes, {
				minFilter: THREE.LinearFilter,
				// magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat,
				// anisotropy: 16
			});
  		this.textureCameras[i] = new THREE.OrthographicCamera(-tempRes / 2, tempRes / 2, tempRes / 2, -tempRes / 2, -100, 100);
  		this.textureCameras[i].position.z = 10;

  		this.textureScenes[i] = new THREE.Scene();
			// this.geos[i] = new THREE.PlaneGeometry(1, 1);
  		this.planes[i] = new THREE.Mesh(this.geos[i], this.mats[i]);
  		this.planes[i].position.z = -10;
			this.textureScenes[i].add(this.planes[i]);
			// TD.renderer.setRenderTarget(this.textures[i]);
			// TD.renderer.clear();
			// TD.renderer.render(this.textureScenes[i], this.textureCameras[i]);
			// TD.renderer.setRenderTarget(null);
			this.maps.push(this.textures[i].texture);
		}
	}

	render(props) {
		const resolution = props.resolution;

		for (let i = 0; i < 6; i++) {
			// setTimeout(() => {
			// window.renderQueue.addAction(() => {
			this.textures[i].setSize(resolution, resolution);
			// this.textures[i].needsUpdate = true;
			this.textureCameras[i].left = -resolution / 2;
			this.textureCameras[i].right = resolution / 2;
			this.textureCameras[i].top = resolution / 2;
			this.textureCameras[i].bottom = -resolution / 2;
			this.textureCameras[i].updateProjectionMatrix();
			this.geos[i] = new THREE.PlaneGeometry(resolution, resolution);
			this.planes[i].geometry = this.geos[i];

			let renderer = TD && TD.renderer;
			if (self && self.window && self.window.renderer) {
				renderer = self.window.renderer;
			}
			renderer.setRenderTarget(this.textures[i]);
			renderer.clear();
			renderer.render(this.textureScenes[i], this.textureCameras[i]);// , this.textures[i], true);
			renderer.setRenderTarget(null);

			// await tick();
			this.geos[i].dispose();
			// }, 100);
		}
	}
}

export default Map;
