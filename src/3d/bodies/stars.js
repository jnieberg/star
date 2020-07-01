import * as THREE from 'three';
import { TD, MISC, SHADER } from '../../variables';
import { deleteThree } from '../init/init';
import raycastStars from '../raycast/raycastStars';
import { getCoordinateOffset, setCameraPosition, updateCoordinatesByOffset } from '../init/camera';
import starList, { getRealCoordinate } from '../tools/starList';
import { hideLabel } from '../label/label';

function updateStars(off) {
	if (TD.stars) {
		for (const i of Object.keys(TD.stars)) {
			if (!TD.stars[i].object) {
				TD.stars[i].geometry = new THREE.BufferGeometry(); ;
				TD.stars[i].geometry.setAttribute('position', new THREE.Float32BufferAttribute(TD.stars[i].positions, 3));
				TD.stars[i].geometry.setAttribute('color', new THREE.Float32BufferAttribute(TD.stars[i].colors, 3)); // .setUsage(THREE.DynamicDrawUsage)
				TD.stars[i].geometry.setAttribute('size', new THREE.Float32BufferAttribute(TD.stars[i].sizes, 1));
				TD.stars[i].geometry.verticesNeedUpdate = false;
				TD.stars[i].geometry.computeBoundingSphere();
				// deleteThree(TD.stars[i].object);
				TD.stars[i].object = new THREE.Points(TD.stars[i].geometry, TD.material.stars);
				TD.stars[i].object.castShadow = false;
				TD.stars[i].object.receiveShadow = false;
				TD.stars[i].object.matrixAutoUpdate = true;
				const coor = getRealCoordinate(TD.stars[i].x, TD.stars[i].y, TD.stars[i].z);
				const points = [
					new THREE.Vector3(coor.x, coor.y, coor.z),
					new THREE.Vector3(coor.x, coor.y + TD.stargrid.size * TD.scale, coor.z),
					new THREE.Vector3(coor.x + TD.stargrid.size * TD.scale, coor.y + TD.stargrid.size * TD.scale, coor.z),
					new THREE.Vector3(coor.x + TD.stargrid.size * TD.scale, coor.y + TD.stargrid.size * TD.scale, coor.z + TD.stargrid.size * TD.scale),
				];
				TD.stars[i].grid = {};
				TD.stars[i].grid.geometry = new THREE.BufferGeometry().setFromPoints(points);
				TD.stars[i].grid.object = new THREE.Line(TD.stars[i].grid.geometry, TD.material.grid);
				TD.stars[i].grid.object.castShadow = false;
				TD.stars[i].grid.object.receiveShadow = false;
				TD.stars[i].grid.object.matrixAutoUpdate = false;
				TD.stars[i].grid.object.renderOrder = -1;
				TD.stars[i].object.add(TD.stars[i].grid.object);
				TD.scene.add(TD.stars[i].object);
			} else {
				TD.stars[i].object.translateX(off.x * TD.stargrid.size * TD.scale);
				TD.stars[i].object.translateY(off.y * TD.stargrid.size * TD.scale);
				TD.stars[i].object.translateZ(off.z * TD.stargrid.size * TD.scale);
			}
		}
	}
}

export function initStars() {
	const uniforms = {
		texture: { type: 't', value: TD.texture.star.small },
		fogColor: { type: 'c', value: TD.scene.fog.color },
		fogNear: { type: 'f', value: TD.camera.fade * TD.scale },
		fogFar: { type: 'f', value: TD.camera.far * TD.scale }
	};
	TD.material.stars = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: SHADER.stars.vertex,
		fragmentShader: SHADER.stars.fragment,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		vertexColors: true,
		fog: true
	});
	TD.material.grid = new THREE.LineBasicMaterial({
		color: 0x0044ff,
		blending: THREE.AdditiveBlending,
		opacity: 0.25,
		depthTest: false
	});
}

function newStarsCanBeRendered(force) {
	const offset = getCoordinateOffset();
	return force || typeof TD.camera.coordinate.x === 'undefined' || offset.x !== 0 || offset.y !== 0 || offset.z !== 0;
}

export default function drawStars() {
	if ((MISC.reload || newStarsCanBeRendered())) {
		MISC.reload = false;
		updateCoordinatesByOffset();
		const pos = TD.camera.coordinate;
		starList({ posx: pos.x, posy: pos.y, posz: pos.z }, () => {
			const off = setCameraPosition();
			updateStars(off);
		});
	}
}

export function getStars() {
	let result = false;
	for (const i of Object.keys(TD.stars)) {
		if (!result && TD.stars[i]) {
			result = raycastStars(TD.stars[i]);
		}
	}
	if (!result) {
		hideLabel('stars');
	}
}
