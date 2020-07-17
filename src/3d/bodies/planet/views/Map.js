import * as THREE from 'three';
import { TD } from '../../../../variables';
import wait from '../../../tools/wait';

class Map {
	constructor(resolution) {
		this.resolution = resolution;
	}

	setup() {
		this.maps = [];
		this.textures = [];
		this.textureCameras = [];
		this.textureScenes = [];
		this.planes = [];
		this.geos = [];

		for (let i = 0; i < 6; i++) {
			this.textures[i] = new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
				// magFilter: THREE.LinearFilter,
				precision: 'highp',
				powerPreference: 'high-performance',
				minFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat,
			});
  		this.textureCameras[i] = new THREE.OrthographicCamera(-this.resolution / 2, this.resolution / 2, this.resolution / 2, -this.resolution / 2, -100, 100);
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

	renderPart(resolution, iA, xA, yA, callback) {
		const fragments = Math.ceil(resolution / 64);
		let i = iA || 0;
		let x = xA || 0;
		let y = yA || 0;
		if (i < 6) {
			this.textures[i].setSize(resolution, resolution);
			this.textureCameras[i].left = -resolution / 2;
			this.textureCameras[i].right = resolution / 2;
			this.textureCameras[i].top = resolution / 2;
			this.textureCameras[i].bottom = -resolution / 2;
			this.textureCameras[i].updateProjectionMatrix();
			this.geos[i] = new THREE.PlaneBufferGeometry(resolution, resolution, 1, 1);
			this.planes[i].geometry = this.geos[i];
			this.geos[i].dispose();
			TD.renderer.autoClear = false;
			if (y < fragments) {
				if (x < fragments) {
					wait(() => {
						TD.renderer.setRenderTarget(this.textures[i]);
						TD.renderer.antialias = false;
						TD.renderer.setScissorTest(true);
						TD.renderer.setScissor(
							Math.floor((x * resolution) / fragments),
							Math.floor((y * resolution) / fragments),
							Math.floor(resolution / fragments + 1),
							Math.floor(resolution / fragments + 1)
						);
						TD.renderer.render(this.textureScenes[i], this.textureCameras[i]);// , this.textures[i], true);
						TD.renderer.antialias = true;
						TD.renderer.setRenderTarget(null);
						TD.renderer.setScissorTest(false);
						this.renderPart(resolution, i, ++x, y, callback);
					});
				} else {
					this.renderPart(resolution, i, 0, ++y, callback);
				}
			} else {
				this.renderPart(resolution, ++i, 0, 0, callback);
			}
		} else if (callback) {
			callback();
		}
	}

	render(props, callback) {
		const resolution = props.resolution;
		this.renderPart(resolution, 0, 0, 0, callback);
	}
}

export default Map;
