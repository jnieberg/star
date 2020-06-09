import * as THREE from 'three';

const THREEx = {};

THREEx.createAtmosphereMaterial = function() {
	const vertexShader	= `
	varying vec3	vVertexWorldPosition;
	varying vec3	vVertexNormal;
	void main() {
		vVertexNormal	= normalize(normalMatrix * normal);
		vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;
		gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`;
	const fragmentShader	= `
	uniform vec3	color;
	uniform float	coeficient;
	uniform float	power;
	varying vec3	vVertexNormal;
	varying vec3	vVertexWorldPosition;
	void main() {
		vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;
		vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
		viewCameraToVertex	= normalize(viewCameraToVertex);
		float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);
		gl_FragColor		= vec4(color, intensity);
	}`;

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	const material	= new THREE.ShaderMaterial({
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
			}
		},
		vertexShader	: vertexShader,
		fragmentShader	: fragmentShader,
		blending	: THREE.AdditiveBlending,
		transparent	: true,
		depthWrite	: false,
	});
	return material;
};

THREEx.dilateGeometry	= function(geometry, length) {
	// gather vertexNormals from geometry.faces
	const vertices = geometry.vertices || geometry.attributes.position;
	const vertexNormals	= new Array(vertices.length);
	geometry.faces.forEach((face) => {
		if (face instanceof THREE.Face4) {
			vertexNormals[face.a]	= face.vertexNormals[0];
			vertexNormals[face.b]	= face.vertexNormals[1];
			vertexNormals[face.c]	= face.vertexNormals[2];
			vertexNormals[face.d]	= face.vertexNormals[3];
		} else if (face instanceof THREE.Face3) {
			vertexNormals[face.a]	= face.vertexNormals[0];
			vertexNormals[face.b]	= face.vertexNormals[1];
			vertexNormals[face.c]	= face.vertexNormals[2];
		} else	{
			console.assert(false);
		}
	});
	// modify the vertices according to vertextNormal
	geometry.vertices.forEach((vertex, idx) => {
		const vertexNormal = vertexNormals[idx];
		vertex.x	= vertex.x	+ vertexNormal.x * length;
		vertex.y	= vertex.y	+ vertexNormal.y * length;
		vertex.z	= vertex.z	+ vertexNormal.z * length;
	});
};

THREEx.GeometricGlowMesh = function(mesh, { size, thickness = 0.1, color: colorS = 'rgba(255, 255, 255, 1.0)', colorInner: colorInnerS = colorS, power = 2.5, opacity = 0.5 } = {}) {
	const color = new THREE.Color(colorS);
	const colorInner = new THREE.Color(colorInnerS);
	// THREEx.dilateGeometry(geometry, thickness * 0.01);
	let geometry = new THREE.SphereBufferGeometry(size * 1.01, 64, 64);
	let material = THREEx.createAtmosphereMaterial();
	material.uniforms.color.value = colorInner;
	material.uniforms.coeficient.value = opacity + 0.75;
	material.uniforms.power.value = power;
	material.needsUpdate = true;
	const insideMesh = new THREE.Mesh(geometry, material);
	// insideMesh.scale.set(size * 1.01, size * 1.01, size * 1.01);
	insideMesh.castShadow = false;
	insideMesh.receiveShadow = false;
	// insideMesh.renderOrder = 1;
	mesh.add(insideMesh);

	// THREEx.dilateGeometry(geometry, thickness * 0.5);
	geometry = new THREE.SphereBufferGeometry(size * 1.01 + thickness, 64, 64);
	material = THREEx.createAtmosphereMaterial();
	material.uniforms.color.value	= color;
	material.uniforms.coeficient.value = opacity - thickness * 0.01;
	material.uniforms.power.value = power;
	material.side	= THREE.BackSide;
	material.needsUpdate = true;
	const outsideMesh	= new THREE.Mesh(geometry, material);
	// outsideMesh.scale.set(size + thickness * 0.5, size + thickness * 0.5, size + thickness * 0.5);
	outsideMesh.castShadow = false;
	outsideMesh.receiveShadow = false;
	// outsideMesh.renderOrder = 1;
	mesh.add(outsideMesh);

	// expose a few variable
	this.inside	= insideMesh.material.uniforms;
	this.outside = outsideMesh.material.uniforms;
};

export default THREEx;
