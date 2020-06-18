import * as THREE from 'three';
import { SHADER, TD } from '../variables';

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
		depthWrite: false,
	});
	return material;
};

THREEx.GeometricGlowMesh = function(mesh, { size, thickness = 0.1, color: colorS = 'rgba(255, 255, 255, 1.0)', colorInner: colorInnerS = colorS, power = 2.5, opacity = 0.5 } = {}) {
	const color = new THREE.Color(colorS);
	const colorInner = new THREE.Color(colorInnerS);
	// THREEx.dilateGeometry(geometry, thickness * 0.01);
	let geometry = new THREE.SphereBufferGeometry(size, 64, 64); // + 0.0000001
	let material = THREEx.createAtmosphereMaterial();
	material.uniforms.color.value = colorInner;
	material.uniforms.coeficient.value = opacity * 0.5 + 0.75 - size * 0.01;
	material.uniforms.power.value = power + 0.5;
	material.uniforms.glowColor.value = colorInner;
	material.uniforms.c.value = opacity * 0.5 + 0.75 - size * 0.1;
	material.uniforms.p.value = power + 0.5;
	material.side = THREE.FrontSide;
	material.alphaTest = 0.5;
	material.needsUpdate = true;
	const insideMesh = new THREE.Mesh(geometry, material);
	// insideMesh.scale.set(size * 1.01, size * 1.01, size * 1.01);
	insideMesh.castShadow = false;
	insideMesh.receiveShadow = false;
	// insideMesh.renderOrder = 1;
	mesh.add(insideMesh);

	// THREEx.dilateGeometry(geometry, thickness * 0.5);
	geometry = new THREE.SphereBufferGeometry(size + thickness, 64, 64);
	material = THREEx.createAtmosphereMaterial();
	material.uniforms.color.value = color;
	material.uniforms.coeficient.value = opacity * 0.5 - thickness * 0.01;
	material.uniforms.power.value = power;
	material.uniforms.glowColor.value = color;
	material.uniforms.c.value = opacity * 0.5 - thickness * 0.01;
	material.uniforms.p.value = power;
	material.side = THREE.BackSide;
	// material.alphaTest = 0.5;
	material.needsUpdate = true;
	const outsideMesh = new THREE.Mesh(geometry, material);
	// outsideMesh.scale.set(size + thickness * 0.5, size + thickness * 0.5, size + thickness * 0.5);
	outsideMesh.castShadow = false;
	outsideMesh.receiveShadow = false;
	// outsideMesh.renderOrder = 1;
	mesh.add(outsideMesh);

	// expose a few variable
	this.inside = insideMesh;
	this.outside = outsideMesh;
};

export default THREEx;
