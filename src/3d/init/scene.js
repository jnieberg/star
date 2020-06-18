import * as THREE from 'three';
import { TD, SHADER } from '../../variables';

export default function initScene(win) {
	// Scene
	TD.scene = new THREE.Scene();
	TD.scene.fog = new THREE.Fog(0x000000, TD.camera.fade * TD.scale, TD.camera.far * TD.scale);

	// Shadowmap
	// let shader = THREE.ShaderChunk.shadowmap_pars_fragment;
	// shader = shader.replace(
	// 	'#ifdef USE_SHADOWMAP',
	// 	`#ifdef USE_SHADOWMAP
	// 	${SHADER.pcss.fragment}`
	// );
	// shader = shader.replace(
	// 	'#if defined( SHADOWMAP_TYPE_PCF )',
	// 	`${SHADER.pcss.shadow}
	// 	#if defined( SHADOWMAP_TYPE_PCF )`
	// );
	// // eslint-disable-next-line camelcase
	// THREE.ShaderChunk.shadowmap_pars_fragment = shader;

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
	// TD.renderer.shadowMap.needsUpdate = false;
	// TD.renderer.outputEncoding = THREE.sRGBEncoding;

	TD.renderer.setPixelRatio(window.devicePixelRatio);
	TD.renderer.setSize(window.innerWidth, window.innerHeight);
	win.appendChild(TD.renderer.domElement);

	TD.raycaster = new THREE.Raycaster();
}
