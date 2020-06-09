import seedrandom from 'seedrandom';
import { getPlanetInfo } from './planet';
import { toCelcius } from '../../misc/temperature';
import getName from '../../misc/name';
import { TD, MISC, STAR } from '../../variables';
import * as THREE from 'three';
import { deleteThree } from '../init/init';
import drawPlanets from './planets';
import raycastStar from '../raycast/raycastStar';

export function getStarSize(star) {
	return star.size;
}

function getStarSizeName(star) {
	let size = 'Hypergiant';
	if (star.size < 1) {
		size = 'Dwarf';
	} else if (star.size < 3) {
		size = 'Star';
	} else if (star.size < 4) {
		size = 'Giant';
	} else if (star.size < 4.5) {
		size = 'Supergiant';
	}

	return size;
}

function getStarColor(star) {
	let brightString = '';
	let hueString = 'Red';
	for (const col in STAR.color.brightness) {
		if (STAR.color.brightness.hasOwnProperty(col)) {
			const brightness = STAR.color.brightness[col];
			if (star.brightness < brightness) {
				brightString = col;
			}
		}
	}
	for (const col in STAR.color.hue) {
		if (STAR.color.hue.hasOwnProperty(col)) {
			const hue = STAR.color.hue[col];
			if (star.hue < hue) {
				hueString = col;
			}
		}
	}
	return {
		brightness: brightString,
		hue: brightString === 'White' ? brightString : hueString
	};
}

function getStarColorString(star) {
	const color = getStarColor(star);
	return `${color.brightness} ${color.hue}`.replace(/^ | $|(White).*$/g, '$1');
}

// Star temperature in Kelvin
export function getStarTemperature(star) {
	MISC.rnd = seedrandom(`star_temperature_${star.id}`);
	const color = getStarColor(star);

	for (const tempColor in STAR.temperature) {
		if (STAR.temperature.hasOwnProperty(tempColor)) {
			if (tempColor === color.hue) {
				const temp = STAR.temperature[tempColor];
				const tempBright = temp.min + (temp.max - temp.min) * 0.75;
				const tempDark = temp.max - (temp.max - temp.min) * 0.75;
				switch (color.brightness) {
				case 'Bright':
					return Math.floor(MISC.rnd() * (temp.max - tempBright)) + tempBright;
				case 'Dark':
					return Math.floor(MISC.rnd() * (tempDark - temp.min)) + temp.min;
				case '':
					return Math.floor(MISC.rnd() * (tempBright - tempDark)) + tempDark;
				default:
					return Math.floor(MISC.rnd() * (temp.max - temp.min)) + temp.min;
				}
			}
		}
	}
}

function getStarPlanets(star) {
	MISC.rnd = seedrandom(`star_planets_${star.id}`);
	const planetLength = Math.floor(MISC.rnd() * star.size * 4); // number of planets depends on star size
	if (planetLength) {
		const children = [];
		for (let p = 0; p < planetLength; p++) {
			children.push(getPlanetInfo(star, p));
		}
		return children;
	}
}

export function getStarName(star) {
	MISC.rnd = seedrandom(`star_${star.id}`);
	return getName(3, 3, 999);
}

export function getStarData(x, y, z, index) {
	return {
		id: `${x}_${y}_${z}_${index}`,
		size: (MISC.rnd() * 4 + 1),
		hue: MISC.rnd(),
		brightness: MISC.rnd() * 0.9 + 0.1,
		x: x + MISC.rnd(),
		y: y + MISC.rnd(),
		z: z + MISC.rnd()
	};
}

export function getStarInfo(star) {
	return {
		...star,
		type: 'star',
		name: getStarName(star),
		temperature: getStarTemperature(star),
		children: getStarPlanets(star)
	};
}

function getStarPlanetsString(star) {
	return star.children.map(planet => `  ${planet.id + 1}. ${planet.name}`);
}

export function getStarInfoString(star) {
	const children = star.children && star.children.length ? [ 'Planets:', ...getStarPlanetsString(star) ] : [];
	return [
		star.name,
		`${getStarColorString(star)} ${getStarSizeName(star)}`,
		`Temperature: ${toCelcius(star.temperature)}`,
		...children
	];
}

export default function drawStar(star) {
	if (star) {
		const size = star.size * 0.002 * TD.scale;
		deleteThree(TD.star.object);
		const hue2 = star.hue - 0.05 > 0 ? star.hue - 0.05 : 0;
		TD.colorHelper.setHSL(star.hue, 1.0, star.brightness);
		TD.colorHelper2.setHSL(hue2, 1.0, star.brightness - 0.35);
		MISC.rnd = seedrandom(`star_rotation_${star.id}`);

		// Star pivot
		TD.star.object = new THREE.Object3D();
		TD.star.object.rotation.x = Math.PI * MISC.rnd() * 2;
		TD.star.object.rotation.y = Math.PI * MISC.rnd() * 2;
		TD.star.object.rotation.z = Math.PI * MISC.rnd() * 2;

		// Star backside
		const geometry = new THREE.SphereGeometry(size * 0.1, 32, 32);
		const material = new THREE.MeshBasicMaterial({
			color: TD.colorHelper,
			side: THREE.BackSide
		});
		TD.star.sphere = new THREE.Mesh(geometry, material);
		TD.star.sphere.renderOrder = 1;
		TD.star.sphere.castShadow = false;
		TD.star.sphere.receiveShadow = false;
		TD.star.object.add(TD.star.sphere);

		// Star frontside
		const material2 = new THREE.MeshBasicMaterial({
			color: TD.colorHelper2,
			blending: THREE.AdditiveBlending,
			side: THREE.FrontSide
		});
		const starInner = new THREE.Mesh(geometry, material2);
		starInner.renderOrder = 1;
		starInner.castShadow = false;
		starInner.receiveShadow = false;
		TD.star.object.add(starInner);

		// Star inside
		const material3 = new THREE.MeshBasicMaterial({
			map: TD.texture.star.surface,
			color: TD.colorHelper
		});
		const starInner3 = new THREE.Mesh(geometry, material3);
		starInner3.scale.set(0.98, 0.98, 0.98);
		starInner3.castShadow = false;
		starInner3.receiveShadow = false;
		TD.star.object.add(starInner3);

		// Star corona
		TD.colorHelper2.setHSL(hue2, 1.0, star.brightness);
		const flareMaterial = new THREE.SpriteMaterial({
			map: TD.texture.star.large,
			color: TD.colorHelper2,
			opacity: 1,
			blending: THREE.AdditiveBlending,
			// depthTest: false
		});
		const starFlare = new THREE.Sprite(flareMaterial);
		starFlare.scale.set(size, size, size);
		starFlare.castShadow = false;
		starFlare.receiveShadow = false;
		TD.star.object.add(starFlare);

		// Star point light
		TD.star.pointLight = new THREE.PointLight(TD.colorHelper, 2, TD.camera.far * 0.1 * TD.scale);
		TD.star.pointLight.castShadow = false;
		TD.star.object.add(TD.star.pointLight);

		// Star spot light
		TD.star.light = new THREE.DirectionalLight(TD.colorHelper, 5);
		TD.star.light.castShadow = true;
		TD.star.light.angle = Math.PI / 32;
		TD.star.light.penumbra = 0.1;
		TD.star.light.power = 10;
		TD.star.light.shadow.bias = 0;// 0.0001;
		TD.star.light.shadow.mapSize.width = 2048;
		TD.star.light.shadow.mapSize.height = 2048;
		TD.star.light.shadow.radius = 2;
		TD.star.light.shadow.camera.left = -10;
		TD.star.light.shadow.camera.right = 10;
		TD.star.light.shadow.camera.top = 10;
		TD.star.light.shadow.camera.bottom = -10;
		TD.star.light.shadow.camera.near = 0.001 * TD.scale;
		TD.star.light.shadow.camera.far = TD.camera.far * 0.01 * TD.scale;
		TD.star.light.shadow.camera.fov = 32;
		TD.scene.add(TD.star.light.target);
		TD.star.object.add(TD.star.light);
		TD.star.light.visible = false;

		// Set star position
		TD.star.object.position.set(star.x * 100 * TD.scale, star.y * 100 * TD.scale, star.z * 100 * TD.scale);

		// Draw planets of star
		TD.star = drawPlanets(star);

		// Add star to scene
		TD.scene.add(TD.star.object);
		TD.star.pointLight.updateMatrix();
		TD.star.pointLight.updateMatrixWorld();
		TD.star.sphere.this = star;
	}
}

export function getStar() {
	if (TD.star.sphere && TD.star.this) {
		raycastStar(TD.star.sphere);
	}
}
