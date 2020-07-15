import * as THREE from 'three';
import { TD } from '../../variables';


export default function initScene() {
	// Scene
	TD.scene = new THREE.Scene();
	TD.scene.fog = new THREE.Fog(0x000000, TD.camera.fade * TD.scale, TD.camera.far * TD.scale);

	// WebGL Renderer
	TD.renderer = new THREE.WebGLRenderer({
		precision: 'highp',
		powerPreference: 'high-performance',
		// stencil: false,
		alpha: true,
		antialias: true,
		physicallyCorrectLights: true
	});
	// TD.renderer.autoClear = true;
	TD.renderer.shadowMap.enabled = true;
	TD.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	TD.renderer.gammaFactor = 2.2;
	TD.renderer.gammaOutput = true;
	// TD.renderer.shadowMap.needsUpdate = false;
	// TD.renderer.outputEncoding = THREE.sRGBEncoding;

	TD.renderer.setPixelRatio(window.devicePixelRatio);
	TD.renderer.setSize(window.innerWidth, window.innerHeight);

	document.getElementById('root').appendChild(TD.renderer.domElement);

	TD.raycaster = new THREE.Raycaster();
}
