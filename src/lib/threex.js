import * as THREE from 'three';
import { SHADER, TD } from '../variables';
import Thing from '../object/Thing';
import SphereGeometry from '../object/geometry/SphereGeometry';

const THREEx = {};

THREEx.createAtmosphereMaterial = function() {
	// create custom material from the shader code above
	//   that is within specially labeled script tags
	const material = new THREE.ShaderMaterial({
		uniforms: {
			coeficient	: {
				type	: 'f',
				value	: 1.0
			},
			power		: {
				type	: 'f',
				value	: 2
			},
			color	: {
				type	: 'c',
				value	: new THREE.Color('pink')
			},
			c: { type: 'f', value: 1.0 },
			p: { type: 'f', value: 1.4 },
			glowColor: { type: 'c', value: 0xffff00 },
			viewVector: { type: 'v3', value: TD.camera.object.position }
		},
		vertexShader: SHADER.glow2.vertex,
		fragmentShader: SHADER.glow2.fragment,
		blending: THREE.NormalBlending,
		transparent: true,
		depthWrite: false
	});
	return material;
};

THREEx.GeometricGlowMesh = function(mesh, { size, thickness = 0.1, color: colorS = 'rgba(255, 255, 255, 1.0)', colorInner: colorInnerS = colorS, power = 2.5, opacity = 0.5 } = {}) {
	const color = new THREE.Color(colorS);
	const colorInner = new THREE.Color(colorInnerS);
	// THREEx.dilateGeometry(geometry, thickness * 0.01);
	// let geometry = new THREE.SphereBufferGeometry(size, 64, 64); // + 0.0000001
	const inside = new Thing('glowInside')
		.geometry(new SphereGeometry(size))
		.material(THREEx.createAtmosphereMaterial(), {
			'uniforms.color.value': colorInner,
			'uniforms.coeficient.value': opacity * 0.5 + 0.75 - size * 0.01,
			'uniforms.power.value': power + 0.5,
			'uniforms.glowColor.value': colorInner,
			'side': THREE.FrontSide
		})
		.mesh({
			castShadow: false,
			receiveShadow: false,
		})
		.add(mesh);
	// insideMesh.renderOrder = 1;
	// mesh.add(insideMesh);

	// THREEx.dilateGeometry(geometry, thickness * 0.5);
	// inside.geometry = new THREE.SphereBufferGeometry(size + thickness, 64, 64);
	const outside = new Thing('glowOutside')
		.geometry(new SphereGeometry(size + thickness))
		.material(THREEx.createAtmosphereMaterial(), {
			'uniforms.color.value' : color,
			'uniforms.coeficient.value' : opacity * 0.5 - thickness * 0.01,
			'uniforms.power.value' : power,
			'uniforms.glowColor.value' : color,
			'side': THREE.BackSide,
		})
		.mesh({
			castShadow: false,
			receiveShadow: false,
		})
		.add(mesh);

	// expose a few variable
	// this.inside = insideMesh;
	// this.outside = outsideMesh;
};

export default THREEx;
