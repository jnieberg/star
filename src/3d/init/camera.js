import * as THREE from 'three';
import { TD } from '../../variables';

export function cameraLookDir() {
	const vector = new THREE.Vector3(0, 0, -1);
	vector.applyEuler(TD.camera.object.rotation, TD.camera.object.eulerOrder);
	return vector;
}

export default function initCamera() {
	TD.camera.object = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, TD.camera.near, TD.camera.far * TD.scale);
}
