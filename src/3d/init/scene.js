import * as THREE from 'three';
import { TD } from '../../variables';

export default function initScene(win) {
	TD.scene = new THREE.Scene();
	TD.scene.fog = new THREE.Fog(0x000000, TD.camera.fade * TD.scale, TD.camera.far * TD.scale);
	TD.renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	TD.renderer.setPixelRatio(window.devicePixelRatio);
	TD.renderer.setSize(window.innerWidth, window.innerHeight);
	win.appendChild(TD.renderer.domElement);

	TD.raycaster = new THREE.Raycaster();
	TD.raycaster.params.Points.threshold = 0.2 * TD.scale;
}
