import * as THREE from 'three';
import { TD } from '../../variables';

function render(renderer) {
	renderer.render(TD.scene, TD.camera.object);
}

function animate(renderer) {
	wait(() => {
		animate(renderer);
	});
	render(renderer);
};

function initCamera() {
	TD.camera.object = new THREE.PerspectiveCamera(70, 1, TD.camera.near * TD.scale, TD.camera.far * TD.scale);
	TD.scene.add(TD.camera.object);
}

function init({ canvas, renderer }) {
	TD.scene = new THREE.Scene();
	TD.scene.fog = new THREE.Fog(0x000000, TD.camera.fade * TD.scale, TD.camera.far * TD.scale);
	self.postMessage({ text: JSON.stringify(renderer) });

	renderer.canvas = canvas;
	initCamera();
	animate(renderer);
}

self.onmessage = function(e) {
	init(e.data);
};
