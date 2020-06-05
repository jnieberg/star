import * as THREE from 'three';
import { TD } from '../../variables';

export default function createSphere({ texture, size, detail, color: colorA, emissive: emissiveA, parent = TD.scene, distance, rotate }) {
	const transparent = typeof colorA.a !== 'undefined';
	const color = colorA ? colorA : { r:0, g:0, b:0, a:(colorA && colorA.a) || 1.0 };
	const emissive = emissiveA ? emissiveA : { r:0, g:0, b:0, a:(emissiveA && emissiveA.a) || 1.0 };
	TD.colorHelper.setRGB(color.r, color.g, color.b);
	TD.colorHelper2.setRGB(emissive.r, emissive.g, emissive.b);

	const geometry = new THREE.SphereGeometry(size, detail, detail);
	// geometry.verticesNeedUpdate = true;
	// geometry.elementsNeedUpdate = true;
	// geometry.morphTargetsNeedUpdate = true;
	// geometry.uvsNeedUpdate = true;
	// geometry.normalsNeedUpdate = true;
	// geometry.colorsNeedUpdate = true;
	// geometry.tangentsNeedUpdate = true;
	const params = transparent ?
		{ map: texture || null, color: 0x000000, emissive: TD.colorHelper2, emissiveIntensity: 0.25, transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, needsUpdate: true } :
		{ map: texture || null, color: TD.colorHelper, emissive: TD.colorHelper2, emissiveIntensity: 0.5, side: THREE.FrontSide, needsUpdate: true };
	const material = new THREE.MeshLambertMaterial(params);
	if (material.map) {
		material.map.minFilter = THREE.LinearFilter;
	}
	material.needsUpdate = true;
	const mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.y = rotate;
	if (transparent) {
		const material2 = new THREE.MeshLambertMaterial({ color: TD.colorHelper, opacity: color.a, transparent: true, blending: THREE.AdditiveBlending, side: THREE.FrontSide, needsUpdate: true });
		material2.needsUpdate = true;
		const mesh2 = new THREE.Mesh(geometry, material2);
		mesh.add(mesh2);
	} else {
		mesh.castShadow = true;
	}
	mesh.receiveShadow = true;
	mesh.translateX(distance);
	parent.add(mesh);
	return mesh;
}
