import animate, { loop } from '../animate';
import initCamera from './camera';
import initScene from './scene';
import { initStars } from '../bodies/stars';
import initShaders from './shaders';
import initControls from './controls';
import initEvents from './events';
import initTextures from './texture';

export function deleteThree(obj) {
	if (obj) {
		while (obj.children && obj.children.length > 0) {
			deleteThree(obj.children[0]);
		}
		if (obj.geometry) {
			obj.geometry.dispose();
		};

		if (obj.material) {
			obj.material.dispose();
		}
		if (obj.texture) {
			obj.texture.dispose();
		}
		if (obj.parent) {
			obj.parent.remove(obj);
		}
	}
}

export default function init3d(win) {
	initShaders(win);
	initScene(win);
	initCamera();
	initTextures();
	initControls();
	initStars();
	initEvents();
	loop();
	animate();
}
