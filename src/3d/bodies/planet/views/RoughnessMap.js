import * as THREE from 'three';

import vertShader from '../../../../shaders/texture.vert';
import fragShader from '../../../../shaders/roughnessMap.frag';
import Map from './Map.js';

class RoughnessMap extends Map {
	constructor(resolution) {
		super();
		this.setup();
		super.setup(resolution);
	}

	setup() {
		this.mats = [];

		for (let i = 0; i < 6; i++) {
			this.mats[i] = new THREE.ShaderMaterial({
				uniforms: {
					resolution: { type: 'f', value: 0 },
					waterLevel: { type: 'f', value: 0 },
					heightMap: { type: 't', value: new THREE.Texture() }
				},
				vertexShader: vertShader,
				fragmentShader: fragShader,
				transparent: true,
				depthWrite: false
			});
		}
	}

	render(props, callback) {
		// props.resolution
		// props.heightMaps[]
		// props.waterLevel

		for (let i = 0; i < 6; i++) {
			this.mats[i].uniforms.resolution.value = props.resolution;
			this.mats[i].uniforms.waterLevel.value = props.waterLevel;
			this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
			this.mats[i].needsUpdate = true;
		}
		super.render(props, callback);
	}
}

export default RoughnessMap;
