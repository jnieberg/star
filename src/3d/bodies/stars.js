import seedrandom from 'seedrandom';
import * as THREE from 'three';
import { TD, MISC } from '../../variables';
import { deleteThree } from '../init/init';
import { getStarData } from './star';
import raycastStars from '../raycast/raycastStars';

function listStarArea(x, y, z) {
	const size = TD.stargrid.size * TD.stargrid.size * TD.stargrid.size;
	MISC.rnd = seedrandom(`stars_${x}_${y}_${z}`);
	const quantity = Math.floor(MISC.rnd() * 0.001 * size) + 0.001 * size;
	for (let s = 0; s < quantity; s++) {
		TD.stars.list.push(getStarData(x, y, z, s));
	}
}

function createStars() {
	TD.stars.list.forEach(star => {
		TD.stars.positions.push(star.x * TD.stargrid.size * TD.scale, star.y * TD.stargrid.size * TD.scale, star.z * TD.stargrid.size * TD.scale);
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
	TD.stars.geometry = new THREE.BufferGeometry();
	const uniforms = {
		texture: { type: 't', value: TD.texture.star.small },
		fogColor: { type: 'c', value: TD.scene.fog.color },
		fogNear: { type: 'f', value: TD.scene.fog.near * TD.scale },
		fogFar: { type: 'f', value: TD.scene.fog.far * TD.scale }
	};
	const vertexShader = document.getElementById('vertexShaderStars').text;
	const fragmentShader = document.getElementById('fragmentShaderStars').text;
	TD.stars.material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		vertexColors: true,
		fog: true
	});
}

function newStarsCanBeRendered() {
	return Math.round(TD.camera.object.position.x / (TD.stargrid.size * TD.scale)) !== TD.camera.position.x ||
		Math.round(TD.camera.object.position.y / (TD.stargrid.size * TD.scale)) !== TD.camera.position.y ||
		Math.round(TD.camera.object.position.z / (TD.stargrid.size * TD.scale)) !== TD.camera.position.z;
}

export default function drawStars() {
	if (newStarsCanBeRendered()) {
		TD.camera.position = {
			x: Math.round(TD.camera.object.position.x / (TD.stargrid.size * TD.scale)),
			y: Math.round(TD.camera.object.position.y / (TD.stargrid.size * TD.scale)),
			z: Math.round(TD.camera.object.position.z / (TD.stargrid.size * TD.scale))
		};
		TD.stars.list = [];
		TD.stars.positions = [];
		TD.stars.colors = [];
		TD.stars.sizes = [];
		const pos = TD.camera.position;
		for (let z = pos.z - TD.stargrid.radius; z < pos.z + TD.stargrid.radius; z++) {
			for (let y = pos.y - TD.stargrid.radius; y < pos.y + TD.stargrid.radius; y++) {
				for (let x = pos.x - TD.stargrid.radius; x < pos.x + TD.stargrid.radius; x++) {
					listStarArea(x, y, z);
				}
			}
		}
		createStars();
		updateStars();
	}
}

export function getStars() {
	if (TD.stars && TD.stars.object) {
		raycastStars(TD.stars.object);
	}
}
