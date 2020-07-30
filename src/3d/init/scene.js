import * as THREE from 'three';
import { TD } from '../../variables';

export default function initScene() {
	// Scene
	TD.scene = new THREE.Scene();
	TD.scene.fog = new THREE.Fog(0x000000, TD.camera.fade * TD.scale, TD.camera.far * TD.scale);

	// WebGL Renderer
	TD.canvas = document.querySelector('#game');
	// const offscreen = TD.canvas.transferControlToOffscreen();
	// offscreen.style = {};
	TD.renderer = new THREE.WebGLRenderer({
		canvas: TD.canvas,
		precision: 'highp',
		powerPreference: 'high-performance',
		// stencil: false,
		alpha: true,
		antialias: true,
		physicallyCorrectLights: true
	});
	TD.renderer.autoClear = false;
	TD.renderer.shadowMap.enabled = true;
	TD.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	TD.renderer.gammaFactor = 2.2;
	TD.renderer.gammaOutput = THREE.GammaEncoding;
	// TD.renderer.shadowMap.needsUpdate = false;
	TD.renderer.outputEncoding = THREE.sRGBEncoding;

	TD.renderer.setPixelRatio(window.devicePixelRatio);
	TD.renderer.setSize(window.innerWidth, window.innerHeight);

	TD.raycaster = new THREE.Raycaster();
}
