import * as THREE from 'three';
import { TD } from '../../variables';

export default function createSphere({ size, detail, color, parent, distance, rotate }) {
	const geometry = new THREE.SphereBufferGeometry(size, detail, detail);
	const opacity = typeof color.a !== 'undefined' ?
		{ color: TD.colorHelper, opacity: color.a, side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending } :
		{ color: TD.colorHelper };
	TD.colorHelper.setRGB(color.r, color.g, color.b);
	const material = new THREE.MeshStandardMaterial({ color: TD.colorHelper, ...opacity });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, 0, 0);
	mesh.rotation.y = rotate;
	mesh.translateX(distance);
	parent.add(mesh);
	return mesh;
}
