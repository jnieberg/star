import * as THREE from 'three';
import { TD, MISC } from '../../variables';

export function resetCamera() {
	TD.camera.coordinate = { x: undefined, y: undefined, z: undefined };
	TD.camera.object.position.set(TD.stargrid.size * TD.scale * 0.5, TD.stargrid.size * TD.scale * 0.5, TD.stargrid.size * TD.scale * 0.5);
	TD.camera.object.rotation.set(0, 0, 0);
}

export function saveCamera() {
	localStorage.setItem('camera', JSON.stringify({
		coordinate: TD.camera.coordinate,
		position: TD.camera.object.position,
		rotation: TD.camera.object.rotation
	}));
}

function loadCamera() {
	let item = localStorage.getItem('camera');
	item = JSON.parse(item);
	if (item && item.coordinate && item.position && item.rotation) {
		TD.camera.coordinate = item.coordinate;
		TD.camera.object.position.set(item.position.x, item.position.y, item.position.z);
		TD.camera.object.rotation.set(item.rotation._x, item.rotation._y, item.rotation._z);
		MISC.reload = true;
	} else {
		resetCamera();
	}
}

function getCameraPosition() {
	return {
		x: TD.camera.object.position.x / TD.scale + (TD.camera.coordinate.x || 0) * TD.stargrid.size,
		y: TD.camera.object.position.y / TD.scale + (TD.camera.coordinate.y || 0) * TD.stargrid.size,
		z: TD.camera.object.position.z / TD.scale + (TD.camera.coordinate.z || 0) * TD.stargrid.size
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

export default function initCamera() {
	TD.camera.object = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, TD.camera.near * TD.scale, TD.camera.far * TD.scale);
	loadCamera();
	TD.scene.add(TD.camera.object);
}
