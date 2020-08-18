import * as THREE from 'three';
import animate, { interval, intervalShadow } from '../animate';
import { initCamera, getWorldCamera, resetCamera } from './camera';
import initScene from './scene';
import { initStars } from '../bodies/system/stars';
import initControls from './controls';
import initEvents from './events';
import initTextures from './texture';
import { TD, MISC } from '../../variables';

export function deleteThree(obj, keepThis = false) {
	if (obj) {
		while (obj.children && obj.children.length > 0) {
			deleteThree(obj.children[0], false);
		}
		if (!keepThis) {
			if (obj.geometry) {
				obj.geometry.dispose();
			};

			if (obj.material) {
				if (Array.isArray(obj.material)) {
					obj.material.map(material => material.dispose());
				} else {
					obj.material.dispose();
				}
			}
			if (obj.texture) {
				obj.texture.dispose();
			}
			if (obj.parent) {
				obj.parent.remove(obj);
			}
		}
	}
}

export function saveStorage() {
	const coord = getWorldCamera();
	localStorage.setItem('camera', JSON.stringify({
		coordinate: TD.camera.coordinate,
		position: { x: coord.x, y: coord.y, z: coord.z },
		rotation: { x: coord._x, y: coord._y, z: coord._z, w: coord._w }
	}));
	localStorage.setItem('time', Date.now() - MISC.timeStart);
}

function loadStorage() {
	let item = localStorage.getItem('camera');
	item = JSON.parse(item);
	if (item && item.coordinate && item.position && item.rotation) {
		const quaternion = new THREE.Quaternion(item.rotation.x, item.rotation.y, item.rotation.z, item.rotation.w);
		TD.camera.coordinate = item.coordinate;
		TD.camera.object.position.set(item.position.x, item.position.y, item.position.z);
		TD.camera.object.rotation.setFromQuaternion(quaternion);
		MISC.reload = true;
	} else {
		resetCamera();
	}
	MISC.timeStart = Date.now() - Number(localStorage.getItem('time'));
}

export default function init3d() {
	initTextures(() => {
		initScene();
		initCamera();
		loadStorage();
		initControls();
		initStars();
		initEvents();
		animate();
		interval();
		intervalShadow();
	});
}
