import * as THREE from 'three';

const THREEx = {};

THREEx.createAtmosphereMaterial = function() {
	const vertexShader	= [
		'varying vec3	vVertexWorldPosition;',
		'varying vec3	vVertexNormal;',

		'varying vec4	vFragColor;',

		'void main(){',
		'	vVertexNormal	= normalize(normalMatrix * normal);',

		'	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

		'	// set gl_Position',
		'	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		'}',

	].join('\n');
	const fragmentShader	= [
		'uniform vec3	glowColor;',
		'uniform float	coeficient;',
		'uniform float	power;',

		'varying vec3	vVertexNormal;',
		'varying vec3	vVertexWorldPosition;',

		'varying vec4	vFragColor;',

		'void main(){',
		'	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
		'	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
		'	viewCameraToVertex	= normalize(viewCameraToVertex);',
		'	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
		'	gl_FragColor		= vec4(glowColor, intensity);',
		'}',
	].join('\n');

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
			glowColor	: {
				type	: 'c',
				value	: new THREE.Color('pink')
			},
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

THREEx.GeometricGlowMesh = function(mesh, { size: sizeA = 0.1, color: colorS = 'rgba(255, 255, 255, 1.0)', power = 2.5, opacity: opacityA = 0.5 } = {}) {
	const size = sizeA;
	const opacity = opacityA;
	const color = new THREE.Color(colorS);
	let geometry	= mesh.geometry.clone();
	THREEx.dilateGeometry(geometry, size * 0.01);
	let material	= THREEx.createAtmosphereMaterial();
	material.uniforms.glowColor.value	= color;
	material.uniforms.coeficient.value = opacity * 0.25 + 1.0;
	material.uniforms.power.value = power + 1.0;
	const insideMesh	= new THREE.Mesh(geometry, material);
	insideMesh.castShadow = false;
	insideMesh.receiveShadow = false;
	mesh.add(insideMesh);

	geometry	= mesh.geometry.clone();
	THREEx.dilateGeometry(geometry, size);
	material	= THREEx.createAtmosphereMaterial();
	material.uniforms.glowColor.value	= color;
	material.uniforms.coeficient.value = opacity * 0.5;
	material.uniforms.power.value = size + power;
	material.side	= THREE.BackSide;
	const outsideMesh	= new THREE.Mesh(geometry, material);
	outsideMesh.castShadow = false;
	outsideMesh.receiveShadow = false;
	mesh.add(outsideMesh);

	// expose a few variable
	this.inside	= insideMesh.material.uniforms;
	this.outside = outsideMesh.material.uniforms;
};

export default THREEx;
