import * as THREE from 'three';
import { TD } from '../../variables';

function loadCamera() {
	let camera = localStorage.getItem('camera');
	if (camera) {
		camera = JSON.parse(camera);
		TD.camera.object.position.set(camera.position.x, camera.position.y, camera.position.z);
		TD.camera.object.rotation.set(camera.rotation._x, camera.rotation._y, camera.rotation._z);
	}
}

export function cameraLookDir() {
	const vector = new THREE.Vector3(0, 0, -1);
	vector.applyEuler(TD.camera.object.rotation, TD.camera.object.eulerOrder);
	return vector;
}

export default function initCamera() {
	TD.camera.object = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, TD.camera.near, TD.camera.far * TD.scale);
	loadCamera();
}
