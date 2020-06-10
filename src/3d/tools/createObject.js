import * as THREE from 'three';
import { TD } from '../../variables';

export default function createSphere({ surface, normal = true, size, detail, color = 0x000000, emissive = 0x000000, parent = TD.scene, distance, rotate }) {
	const transparent = false; // typeof colorA.a !== 'undefined';
	const geometry = new THREE.SphereBufferGeometry(size, detail, detail);
	const texture = TD.texture.planet.surface[surface.texture];
	const params = transparent ?
		{
			map: texture || null,
			color: 0x000000,
			emissive, emissiveIntensity: 0.25,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.BackSide, shininess: 0
		} :
		{
			map: texture || null,
			bumpMap: (normal && texture) || null,
			bumpScale: (normal && 0.001) || null,
			color,
			emissive,
			emissiveIntensity: 0.25,
			side: THREE.FrontSide,
			shininess: 0
		};
	const material = new THREE.MeshPhongMaterial(params);
	// if (material.map) {
	// 	material.map.minFilter = THREE.LinearFilter;
	// }
	material.needsUpdate = true;
	const mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.y = rotate || 0;
	if (transparent) {
		const material2 = new THREE.MeshPhongMaterial({ color, opacity: color.a, transparent: true, blending: THREE.AdditiveBlending, side: THREE.FrontSide, shininess: 0 });
		material2.needsUpdate = true;
		const mesh2 = new THREE.Mesh(geometry, material2);
		mesh.add(mesh2);
	} else {
		mesh.castShadow = true;
	}
	mesh.receiveShadow = true;
	mesh.translateX(distance || 0);
	// geometry.verticesNeedUpdate = true;
	// geometry.elementsNeedUpdate = true;
	// geometry.morphTargetsNeedUpdate = true;
	// geometry.uvsNeedUpdate = true;
	// geometry.normalsNeedUpdate = true;
	// geometry.colorsNeedUpdate = true;
	// geometry.tangentsNeedUpdate = true;
	if (surface && surface.texture2) {
		const mesh2 = mesh.clone();
		mesh2.material = mesh.material.clone();
		mesh2.material.map = TD.texture.planet.surface[surface.texture2];
		mesh2.material.bumpMap = TD.texture.planet.surface[surface.texture2];
		mesh2.material.transparent = true;
		mesh2.material.opacity = surface.opacity;
		mesh2.material.blending = THREE.NormalBlending;
		mesh2.material.needsUpdate = true;
		mesh2.castShadow = true;
		mesh2.receiveShadow = true;
		mesh.add(mesh2);
	}
	parent.add(mesh);
	return mesh;
}
