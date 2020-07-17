import * as THREE from 'three';
import vertShader from '../../../../shaders/texture.vert';
import fragShader from '../../../../shaders/textureMap.frag';
import Map from './Map.js';

class TextureMap extends Map {
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
					biomeMap: { type: 't', value: new THREE.Texture() },
					heightMap: { type: 't', value: new THREE.Texture() },
					moistureMap: { type: 't', value: new THREE.Texture() }
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
		// props.moistureMaps[]
		// props.biomeMap

		// const resolution = props.resolution;

		for (let i = 0; i < 6; i++) {
			this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
			this.mats[i].uniforms.moistureMap.value = props.moistureMaps[i];
			this.mats[i].uniforms.biomeMap.value = props.biomeMap;
			this.mats[i].needsUpdate = true;
		}

		super.render(props, callback);
	}
}

export default TextureMap;
