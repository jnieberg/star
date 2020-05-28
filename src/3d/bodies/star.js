import seedrandom from 'seedrandom';
import { getPlanetInfo, drawPlanet } from './planets';
import { toCelcius } from '../../misc/temperature';
import getName from '../../misc/name';
import { TD, MISC } from '../../variables';
import * as THREE from 'three';
import { deleteThree } from '../init/init';

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
	let color = 'Red';
	if (star.brightness > 0.9) {
		return 'White';
	}
	if (star.hue < 0.05) {
	} else if (star.hue < 0.15) {
		color = 'Orange';
	} else if (star.hue < 0.2) {
		color = 'Yellow';
	} else if (star.hue < 0.5) {
		color = 'Green';
	} else if (star.hue < 0.7) {
		color = 'Blue';
	} else if (star.hue < 0.9) {
		color = 'Purple';
	}
	return color;
}

function getStarPlanets(star) {
	MISC.rnd = seedrandom(`star_planets_${star.id}`);
	const planetLength = Math.floor(MISC.rnd() * star.size * 4); // number of planets depends on star size
	const planets = [];
	for (let p = 0; p < planetLength; p++) {
		planets.push(getPlanetInfo(star, p));
	}
	return planets;
}

function getStarPlanetsString(star) {
	return star.planets.map(planet => `  ${planet.id}. ${planet.name}`);
}

export function getStarName(star) {
	MISC.rnd = seedrandom(`star_${star.id}`);
	return getName(3, 3, 999);
}

export function getStarTemperature(star) {
	MISC.rnd = seedrandom(`star_temperature_${star.id}`);
	let tempMin = 0;
	let tempMax = 0;
	switch (getStarColor(star)) {
	case 'Red': tempMin = 500; tempMax = 3700; break;
	case 'Orange': tempMin = 3700; tempMax = 5200; break;
	case 'Yellow': tempMin = 5200; tempMax = 6000; break;
	case 'White': tempMin = 6000; tempMax = 7500; break;
	case 'Green': tempMin = 7500; tempMax = 10000; break;
	case 'Blue': tempMin = 10000; tempMax = 30000; break;
	case 'Purple': tempMin = 30000; tempMax = 40000; break;
	default: break;
	}
	return Math.floor(MISC.rnd() * (tempMax - tempMin)) + tempMin;
}

export function getStarData(x, y, z, index) {
	return {
		id: `${x}_${y}_${z}_${index}`,
		size: (MISC.rnd() * 4 + 1),
		hue: MISC.rnd(),
		brightness: MISC.rnd() * 0.5 + 0.5,
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
	const planets = star.planets && star.planets.length ? `Planets: ${star.planets.length}` : '';
	return [
		star.name,
		`${getStarColor(star)} ${getStarSizeName(star)}`,
		`Temperature: ${toCelcius(star.temperature)}`,
		planets
	];
}

export default function drawStar() {
	const star = TD.star.this;
	if (star) {
		const size = star.size * 0.002 * TD.scale;
		deleteThree(TD.star.sphere);
		const geometry = new THREE.SphereGeometry(size * 0.1, 32, 32);
		TD.colorHelper.setHSL(star.hue, 1.0, star.brightness);
		const material = new THREE.MeshBasicMaterial({ color: TD.colorHelper });
		TD.star.sphere = new THREE.Mesh(geometry, material);
		MISC.rnd = seedrandom(`star_rotation_${star.id}`);
		TD.star.sphere.position.set(0, 0, 0);
		TD.star.sphere.rotation.x = Math.PI * MISC.rnd() * 2;
		TD.star.sphere.rotation.y = Math.PI * MISC.rnd() * 2;
		TD.star.sphere.rotation.z = Math.PI * MISC.rnd() * 2;
		const flareMaterial = new THREE.SpriteMaterial({
			map: TD.stars.texture,
			color: TD.colorHelper,
			opacity: 0.5,
			depthTest: false,
			blending: THREE.AdditiveBlending
		});
		TD.star.flare = new THREE.Sprite(flareMaterial);
		TD.star.flare.scale.set(size, size, size);
		TD.star.sphere.add(TD.star.flare);
		TD.star.light = new THREE.PointLight(TD.colorHelper, 2, 50 * TD.scale);
		TD.star.sphere.add(TD.star.light);
		TD.star.sphere.position.set(star.x * 100 * TD.scale, star.y * 100 * TD.scale, star.z * 100 * TD.scale);
		if (star.planets) {
			for (let index = 0; index < star.planets.length; index++) {
				drawPlanet(index);
			}
		}
		TD.scene.add(TD.star.sphere);
	}
}
