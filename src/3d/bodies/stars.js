import seedrandom from 'seedrandom';
import * as THREE from 'three';
import { TD, MISC, SHADER } from '../../variables';
import { deleteThree } from '../init/init';
import { getStarData, getStarPosition } from './star';
import raycastStars from '../raycast/raycastStars';
import { getCoordinateOffset, setCameraPosition, updateCoordinatesByOffset } from '../init/camera';

function listStarArea(x, y, z) {
	const size = TD.stargrid.size * TD.stargrid.size * TD.stargrid.size;
	MISC.rnd = seedrandom(`stars_${x}_${y}_${z}`);
	const quantity = Math.floor(MISC.rnd() * 0.0005 * size) + 0.0005 * size;
	for (let s = 0; s < quantity; s++) {
		TD.stars.list.push(getStarData(x, y, z, s));
	}
}

function createStars() {
	TD.stars.list.forEach(star => {
		const pos = getStarPosition(star);
		TD.stars.positions.push(pos.x, pos.y, pos.z);
		// star.x + (star.cx - TD.camera.coordinate.x) * TD.stargrid.size * TD.scale,
		// star.y + (star.cy - TD.camera.coordinate.y) * TD.stargrid.size * TD.scale,
		// star.z + (star.cz - TD.camera.coordinate.z) * TD.stargrid.size * TD.scale);
		MISC.colorHelper.setHSL(star.hue, 1.0, star.brightness);
		TD.stars.colors.push(MISC.colorHelper.r, MISC.colorHelper.g, MISC.colorHelper.b);
		TD.stars.sizes.push(star.size * TD.scale);
	});
}

function updateStars() {
	if (TD.stars.positions.length) {
		TD.stars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(TD.stars.positions, 3));
		TD.stars.geometry.setAttribute('color', new THREE.Float32BufferAttribute(TD.stars.colors, 3)); // .setUsage(THREE.DynamicDrawUsage)
		TD.stars.geometry.setAttribute('size', new THREE.Float32BufferAttribute(TD.stars.sizes, 1));
		// TD.stars.geometry.verticesNeedUpdate = false;
		TD.stars.geometry.computeBoundingSphere();
		deleteThree(TD.stars.object);
		TD.stars.object = new THREE.Points(TD.stars.geometry, TD.stars.material);
		TD.stars.object.castShadow = false;
		TD.stars.object.receiveShadow = false;
		TD.scene.add(TD.stars.object);
	}
}

export function initStars() {
	TD.stars.geometry = new THREE.BufferGeometry();
	const uniforms = {
		texture: { type: 't', value: TD.texture.star.small },
		fogColor: { type: 'c', value: TD.scene.fog.color },
		fogNear: { type: 'f', value: TD.camera.fade * TD.scale },
		fogFar: { type: 'f', value: TD.camera.far * TD.scale }
	};
	// const vertexShader = document.getElementById('vertexShaderStars').text;
	// const fragmentShader = document.getElementById('fragmentShaderStars').text;
	TD.stars.material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: SHADER.stars.vertex,
		fragmentShader: SHADER.stars.fragment,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		vertexColors: true,
		fog: true
	});
}

function newStarsCanBeRendered(force) {
	const offset = getCoordinateOffset();
	return force || typeof TD.camera.coordinate.x === 'undefined' || offset.x !== 0 || offset.y !== 0 || offset.z !== 0;
}

export default function drawStars() {
	if (MISC.reload || newStarsCanBeRendered()) {
		TD.stars.list = [];
		TD.stars.positions = [];
		TD.stars.colors = [];
		TD.stars.sizes = [];
		MISC.reload = false;
		// TD.camera.coordinate = {
		// 	x: Math.round(TD.camera.object.position.x / (TD.stargrid.size * TD.scale)),
		//  	y: Math.round(TD.camera.object.position.y / (TD.stargrid.size * TD.scale)),
		//  	z: Math.round(TD.camera.object.position.z / (TD.stargrid.size * TD.scale))
		// };
		updateCoordinatesByOffset();
		setCameraPosition();

		const pos = TD.camera.coordinate;
		// 	x: Math.round(TD.camera.object.position.x / (TD.stargrid.size * TD.scale)),
		// 	y: Math.round(TD.camera.object.position.y / (TD.stargrid.size * TD.scale)),
		// 	z: Math.round(TD.camera.object.position.z / (TD.stargrid.size * TD.scale))
		// };
		for (let z = pos.z - TD.stargrid.radius; z <= pos.z + TD.stargrid.radius; z++) {
			for (let y = pos.y - TD.stargrid.radius; y <= pos.y + TD.stargrid.radius; y++) {
				for (let x = pos.x - TD.stargrid.radius; x <= pos.x + TD.stargrid.radius; x++) {
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
