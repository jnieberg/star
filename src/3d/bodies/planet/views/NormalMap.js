import * as THREE from 'three';
import vertShader from '../../../../shaders/normalMap.vert';
import fragShader from '../../../../shaders/normalMap.frag';
import Map from './Map.js';

class NormalMap extends Map {
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
					heightMap: { type: 't', value: new THREE.Texture() },
					textureMap: { type: 't', value: new THREE.Texture() }
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
		// props.textureMaps[]
		// props.waterLevel

		for (let i = 0; i < 6; i++) {
			this.mats[i].uniforms.resolution.value = props.resolution;
			this.mats[i].uniforms.waterLevel.value = props.waterLevel;
			this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
			this.mats[i].uniforms.textureMap.value = props.textureMaps[i];
			this.mats[i].needsUpdate = true;
		}

		super.render(props, callback);
	}
}

export default NormalMap;
