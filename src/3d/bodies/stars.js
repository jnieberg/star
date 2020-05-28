import seedrandom from 'seedrandom';
import * as THREE from 'three';
import { TD, MISC } from '../../variables';
import { deleteThree } from '../init/init';
import { getStarData } from './star';
import raycastStar from '../raycast/raycastStar';

function listStarArea(x, y, z) {
	MISC.rnd = seedrandom(`stars_${x}_${y}_${z}`);
	const quantity = Math.floor(MISC.rnd() * 1000) + 1000;
	for (let s = 0; s < quantity; s++) {
		TD.stars.list.push(getStarData(x, y, z, s));
	}
}

function createStars() {
	TD.stars.list.forEach(star => {
		TD.stars.positions.push(star.x * 100 * TD.scale, star.y * 100 * TD.scale, star.z * 100 * TD.scale);
		TD.colorHelper.setHSL(star.hue, 1.0, star.brightness);
		TD.stars.colors.push(TD.colorHelper.r, TD.colorHelper.g, TD.colorHelper.b);
		TD.stars.sizes.push(star.size * 0.5 * TD.scale);
	});
}

function updateStars() {
	if (TD.stars.positions.length) {
		TD.stars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(TD.stars.positions, 3));
		TD.stars.geometry.setAttribute('color', new THREE.Float32BufferAttribute(TD.stars.colors, 3)); // .setUsage(THREE.DynamicDrawUsage)
		TD.stars.geometry.setAttribute('size', new THREE.Float32BufferAttribute(TD.stars.sizes, 1));
		TD.stars.geometry.verticesNeedUpdate = false;
		TD.stars.geometry.computeBoundingSphere();
		deleteThree(TD.stars.object);
		TD.stars.object = new THREE.Points(TD.stars.geometry, TD.stars.material);
		TD.scene.add(TD.stars.object);
	}
}

export function initStars() {
	TD.stars.texture = new THREE.TextureLoader().load('/sun.png');
	TD.stars.geometry = new THREE.BufferGeometry();
	const uniforms = {
		texture: { type: 't', value: TD.stars.texture },
		fogColor: { type: 'c', value: TD.scene.fog.color },
		fogNear: { type: 'f', value: TD.scene.fog.near },
		fogFar: { type: 'f', value: TD.scene.fog.far }
	};
	const vertexShader = document.getElementById('vertexShader').text;
	const fragmentShader = document.getElementById('fragmentShader').text;
	TD.stars.material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		blending: THREE.AdditiveBlending,
		depthTest: true,
		vertexColors: true,
		fog: true
	});
}

function newStarsCanBeRendered() {
	return Math.round(TD.camera.object.position.x / (100 * TD.scale)) !== TD.camera.position.x ||
		Math.round(TD.camera.object.position.y / (100 * TD.scale)) !== TD.camera.position.y ||
		Math.round(TD.camera.object.position.z / (100 * TD.scale)) !== TD.camera.position.z;
}

export default function drawStars() {
	if (newStarsCanBeRendered()) {
		TD.camera.position = {
			x: Math.round(TD.camera.object.position.x / (100 * TD.scale)),
			y: Math.round(TD.camera.object.position.y / (100 * TD.scale)),
			z: Math.round(TD.camera.object.position.z / (100 * TD.scale))
		};
		TD.stars.list = [];
		TD.stars.positions = [];
		TD.stars.colors = [];
		TD.stars.sizes = [];
		const pos = TD.camera.position;
		for (let z = pos.z - 2; z < pos.z + 2; z++) {
			for (let y = pos.y - 2; y < pos.y + 2; y++) {
				for (let x = pos.x - 2; x < pos.x + 2; x++) {
					listStarArea(x, y, z);
				}
			}
		}
		createStars();
		updateStars();
	}
}

export function getStar() {
	if (TD.stars && TD.stars.object) {
		raycastStar(TD.stars.object);
	}
}
