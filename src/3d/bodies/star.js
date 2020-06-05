import seedrandom from 'seedrandom';
import { getPlanetInfo } from './planet';
import { toCelcius } from '../../misc/temperature';
import getName from '../../misc/name';
import { TD, MISC, STAR } from '../../variables';
import * as THREE from 'three';
import { deleteThree } from '../init/init';
import drawPlanets from './planets';

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
		const planets = [];
		for (let p = 0; p < planetLength; p++) {
			planets.push(getPlanetInfo(star, p));
		}
		return planets;
	}
}

function getStarPlanetsString(star) {
	return star.planets.map(planet => `  ${planet.id + 1}. ${planet.name}`);
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
		name: getStarName(star),
		temperature: getStarTemperature(star),
		planets: getStarPlanets(star)
	};
}

export function getStarInfoString(star) {
	const planets = star.planets && star.planets.length ? [ 'Planets:', ...getStarPlanetsString(star) ] : [];
	return [
		star.name,
		`${getStarColorString(star)} ${getStarSizeName(star)}`,
		`Temperature: ${toCelcius(star.temperature)}`,
		...planets
	];
}

export default function drawStar(star) {
	if (star) {
		const size = star.size * 0.002 * TD.scale;
		deleteThree(TD.star.sphere);
		const hue2 = star.hue - 0.05 > 0 ? star.hue - 0.05 : 0;
		TD.colorHelper.setHSL(star.hue, 1.0, star.brightness);
		TD.colorHelper2.setHSL(hue2, 1.0, star.brightness);
		MISC.rnd = seedrandom(`star_rotation_${star.id}`);


		const geometry = new THREE.SphereGeometry(size * 0.1, 32, 32);
		const material = new THREE.MeshBasicMaterial({
			map: TD.texture.star.surface,
			color: TD.colorHelper2,
			opacity: 0.5,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.BackSide
		});
		TD.star.sphere = new THREE.Mesh(geometry, material);
		TD.star.sphere.rotation.x = Math.PI * MISC.rnd() * 2;
		TD.star.sphere.rotation.y = Math.PI * MISC.rnd() * 2;
		TD.star.sphere.rotation.z = Math.PI * MISC.rnd() * 2;
		TD.star.sphere.castShadow = true;
		TD.star.sphere.receiveShadow = true;


		const material2 = new THREE.MeshBasicMaterial({
			map: TD.texture.star.surface,
			color: TD.colorHelper2,
			opacity: 0.75,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.FrontSide
		});
		const starInner = new THREE.Mesh(geometry, material2);
		starInner.renderOrder = 1;
		starInner.castShadow = false;
		starInner.receiveShadow = false;
		TD.star.sphere.add(starInner);


		const geometry3 = new THREE.SphereBufferGeometry(size * 0.095, 32, 32);
		const material3 = new THREE.MeshBasicMaterial({
			map: TD.texture.star.surface,
			color: TD.colorHelper
		});
		const starInner3 = new THREE.Mesh(geometry3, material3);
		starInner3.castShadow = false;
		starInner3.receiveShadow = false;
		TD.star.sphere.add(starInner3);


		const flareMaterial = new THREE.SpriteMaterial({
			map: TD.texture.star.large,
			color: TD.colorHelper,
			opacity: 1,
			blending: THREE.AdditiveBlending,
			depthTest: true
		});
		TD.star.flare = new THREE.Sprite(flareMaterial);
		TD.star.flare.scale.set(size, size, size);
		TD.star.flare.castShadow = false;
		TD.star.flare.receiveShadow = false;
		TD.star.sphere.add(TD.star.flare);

		TD.star.pointLight = new THREE.PointLight(TD.colorHelper, 1, TD.camera.far * 0.1 * TD.scale);
		TD.star.pointLight.castShadow = false;
		TD.star.sphere.add(TD.star.pointLight);

		TD.star.light = new THREE.SpotLight(TD.colorHelper);
		TD.star.light.updateMatrix();
		TD.star.light.updateMatrixWorld();
		TD.star.light.castShadow = true;
		TD.star.light.angle = Math.PI / 8;
		TD.star.light.shadow.mapSize.width = 1024;
		TD.star.light.shadow.mapSize.height = 1024;
		TD.star.light.shadow.camera.near = TD.camera.near * 3 * TD.scale;
		TD.star.light.shadow.camera.far = TD.camera.far * 0.1 * TD.scale;
		TD.star.light.shadow.camera.fov = 35;
		TD.star.sphere.add(TD.star.light);
		TD.scene.add(TD.star.light.target);
		TD.star.light.visible = false;

		TD.star.sphere.position.set(star.x * 100 * TD.scale, star.y * 100 * TD.scale, star.z * 100 * TD.scale);
		drawPlanets(star);

		TD.scene.add(TD.star.sphere);
		TD.star.pointLight.updateMatrix();
		TD.star.pointLight.updateMatrixWorld();
	}
}
