import animate from '../animate';
import initCamera from './camera';
import initScene from './scene';
import { initStars } from '../bodies/stars';
import initShaders from './shaders';
import initControls from './controls';
import { TD } from '../../variables';
import initEvents from './events';

export function deleteThree(obj) {
	if (obj) {
		while (obj.children.length > 0) {
			deleteThree(obj.children[0]);
			obj.remove(obj.children[0]);
		}
		if (obj.geometry) {
			obj.geometry.dispose();
		};

		if (obj.material) {
			// in case of map, bumpMap, normalMap, envMap ...
			Object.keys(obj.material).forEach(prop => {
				if (!obj.material[prop]) {
					return;
				}
				if (typeof obj.material[prop].dispose === 'function') {
					obj.material[prop].dispose();
				}
			});
			obj.material.dispose();
		}
		if (obj.parent === TD.scene) {
			TD.scene.remove(obj);
		}
	}
}

export default function init3d(win) {
	initShaders(win);
	initScene(win);
	initCamera();
	initControls();
	initStars();
	initEvents();
	animate();
}
