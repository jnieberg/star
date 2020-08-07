import * as THREE from 'three';
import { TD } from '../../variables';

export function setCameraParent(parent) {
	if (TD.camera.object.parent !== parent) {
		parent.attach(TD.camera.object);
	}
}

export function getWorldCamera() {
	const position = new THREE.Vector3();
	const quaternion = new THREE.Quaternion();
	TD.camera.object.getWorldPosition(position);
	TD.camera.object.getWorldQuaternion(quaternion);
	return {
		...position,
		...quaternion
	};
}

export function resetCamera() {
	TD.camera.coordinate = { x: undefined, y: undefined, z: undefined };
	setCameraParent(TD.scene);
	TD.camera.object.position.set(TD.stargrid.size * TD.scale * 0.5, TD.stargrid.size * TD.scale * 0.5, TD.stargrid.size * TD.scale * 0.5);
	TD.camera.object.rotation.set(0, 0, 0);
}

function getCameraPosition() {
	const position = getWorldCamera();
	return {
		x: position.x / TD.scale + (TD.camera.coordinate.x || 0) * TD.stargrid.size,
		y: position.y / TD.scale + (TD.camera.coordinate.y || 0) * TD.stargrid.size,
		z: position.z / TD.scale + (TD.camera.coordinate.z || 0) * TD.stargrid.size
	};
}

function getCameraCoordinate() {
	const camera = getCameraPosition();
	return {
		x: Math.floor(camera.x / TD.stargrid.size),
		y: Math.floor(camera.y / TD.stargrid.size),
		z: Math.floor(camera.z / TD.stargrid.size)
	};
}

export function setCameraPosition() {
	const grid = TD.stargrid.size * TD.scale;
	const coordOld = getCameraCoordinate();
	TD.camera.object.position.set(
		(TD.camera.object.position.x + grid) % grid,
		(TD.camera.object.position.y + grid) % grid,
		(TD.camera.object.position.z + grid) % grid
	);
	const coord = getCameraCoordinate();
	return {
		x: coord.x - coordOld.x,
		y: coord.y - coordOld.y,
		z: coord.z - coordOld.z
	};
}

export function getCoordinateOffset() {
	const camera = getCameraCoordinate();
	return {
		x: camera.x - (TD.camera.coordinate.x || 0),
		y: camera.y - (TD.camera.coordinate.y || 0),
		z: camera.z - (TD.camera.coordinate.z || 0),
	};
}

export function updateCoordinatesByOffset() {
	const offset = getCoordinateOffset();
	TD.camera.coordinate.x = (TD.camera.coordinate.x || 0) + offset.x;
	TD.camera.coordinate.y = (TD.camera.coordinate.y || 0) + offset.y;
	TD.camera.coordinate.z = (TD.camera.coordinate.z || 0) + offset.z;
}

export function cameraLookDir() {
	const vector = new THREE.Vector3(0, 0, -1);
	vector.applyEuler(TD.camera.object.rotation, TD.camera.object.eulerOrder);
	return vector;
}

export function distanceToCamera(x, y, z) {
	const pos = getWorldCamera();
	return Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y) + (z - pos.z) * (z - pos.z)) / TD.scale;
}

export function initCamera() {
	TD.camera.object = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, TD.camera.near * TD.scale, TD.camera.far * TD.scale);
	TD.scene.add(TD.camera.object);
}
