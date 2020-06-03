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
	const width = 2.5 * TD.camera.near * x;
	const height = 1.4 * TD.camera.near * y;
	return new THREE.Vector3(width, height, -2.0 * TD.camera.near);
}

export function getMouse(e) {
	e.preventDefault();
	EVENT.mouse2d.x = e.clientX;
	EVENT.mouse2d.y = e.clientY;
	EVENT.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	EVENT.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

document.addEventListener('mousemove', getMouse, false);
