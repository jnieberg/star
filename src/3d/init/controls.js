import { FirstPersonControls } from '../../events/firstPersonControls';
import { TD, EVENT } from '../../variables';
import * as THREE from 'three';

export default function initControls() {
	TD.clock = new THREE.Clock();
	EVENT.controls = new FirstPersonControls(TD.camera.object, TD.renderer.domElement);
	EVENT.controls.acceleration = true;
	EVENT.controls.movementSpeed = 10 * TD.scale;
	EVENT.controls.lookSpeed = 0.1;
}

export function to3DCoordinate(x, y) {
	const width = 2.5 * TD.camera.near * x * TD.scale;
	const height = 1.4 * TD.camera.near * y * TD.scale;
	return new THREE.Vector3(width, height, -2.0 * TD.camera.near * TD.scale);
}

export function getMouse(e) {
	e.preventDefault();
	EVENT.mouse2d.x = e.clientX;
	EVENT.mouse2d.y = e.clientY;
	EVENT.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	EVENT.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

export function getKeys(e) {
	switch (e.which) {
	case 49:
		TD.camera.object.position.set(0, 0, 0);
		TD.camera.object.rotation.set(0, 0, 0);
		EVENT.controls.speedFactorPlanet = 1.0;
		EVENT.controls.accF = 0;
		EVENT.controls.accL = 0;
		EVENT.controls.accU = 0;
		break;
	default: break;
	}
}

document.addEventListener('mousemove', getMouse, false);

document.addEventListener('keypress', getKeys, false);

