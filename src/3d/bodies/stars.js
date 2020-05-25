import seedrandom from "seedrandom";
import * as THREE from "three";
import { TD } from "../../variables";
import { deleteThree } from "../init/init";

function listStarArea(x, y, z) {
	var rnd = seedrandom(`location_${x}_${y}_${z}`);
	var quantity = Math.floor(rnd() * 1000) + 1000;
	for (var s = 0; s < quantity; s++) {
		TD.stars.list.push({
			id: `${x}_${y}_${z}_${s}`,
			size: (rnd() * 4 + 1),
			hue: rnd(),
			brightness: rnd() * 0.5 + 0.5,
			x: x + rnd(),
			y: y + rnd(),
			z: z + rnd()
		});
	}
}

function createStars() {
	TD.stars.list.forEach(star => {
		TD.stars.positions.push(star.x * 100, star.y * 100, star.z * 100);
		TD.colorHelper.setHSL(star.hue, 1.0, star.brightness);
		TD.stars.colors.push(TD.colorHelper.r, TD.colorHelper.g, TD.colorHelper.b);
		TD.stars.sizes.push(star.size * 0.5);
	});
}

function updateStars() {
	if (TD.stars.positions.length) {
		TD.stars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(TD.stars.positions, 3));
		TD.stars.geometry.setAttribute('color', new THREE.Float32BufferAttribute(TD.stars.colors, 3)); //.setUsage(THREE.DynamicDrawUsage)
		TD.stars.geometry.setAttribute('size', new THREE.Float32BufferAttribute(TD.stars.sizes, 1));
		//TD.stars.geometry.verticesNeedUpdate = true;
		TD.stars.geometry.computeBoundingSphere();
		deleteThree(TD.stars.object);
		TD.stars.object = new THREE.Points(TD.stars.geometry, TD.stars.material);
		TD.scene.add(TD.stars.object);
	}
}

export function initStars() {
	TD.stars.texture = new THREE.TextureLoader().load('/sun.png');
	TD.stars.geometry = new THREE.BufferGeometry();
	var uniforms = {
		texture: { type: "t", value: TD.stars.texture },
		fogColor: { type: "c", value: TD.scene.fog.color },
		fogNear: { type: "f", value: TD.scene.fog.near },
		fogFar: { type: "f", value: TD.scene.fog.far }
	};
	var vertexShader = document.getElementById('vertexShader').text;
	var fragmentShader = document.getElementById('fragmentShader').text;
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
	return Math.round(TD.camera.position.x / 100) !== TD.cameraPosition.x ||
		Math.round(TD.camera.position.y / 100) !== TD.cameraPosition.y ||
		Math.round(TD.camera.position.z / 100) !== TD.cameraPosition.z;
}

export default function drawStars() {
	if (newStarsCanBeRendered()) {
		TD.cameraPosition = {
			x: Math.round(TD.camera.position.x / 100),
			y: Math.round(TD.camera.position.y / 100),
			z: Math.round(TD.camera.position.z / 100)
		}
		TD.stars.list = [];
		TD.stars.positions = [];
		TD.stars.colors = [];
		TD.stars.sizes = [];
		var pos = TD.cameraPosition;
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