import seedrandom from 'seedrandom';
import getName from '../../misc/name';
import { getStarTemperature, getStarSize } from './star';
import { MISC, TD } from '../../variables';
import raycastPlanet from '../raycast/raycastPlanet';
import { toCelcius } from '../../misc/temperature';
import getSize from '../../misc/size';
import * as THREE from 'three';
import createSphere from '../tools/createObject';
import { deleteThree } from '../init/init';

function getPlanetName(star, index) {
	MISC.rnd = seedrandom(`planet_${star.id}_${index}`);
	return getName(2, 2);
}

function getPlanetSize(star, index) {
	MISC.rnd = seedrandom(`planet_size_${star.id}_${index}`);
	const starSize = getStarSize(star);
	return starSize * (MISC.rnd() * 0.02 + 0.002);
}

function getPlanetColor(star, index) {
	MISC.rnd = seedrandom(`planet_color_${star.id}_${index}`);
	return { r: MISC.rnd(), g: MISC.rnd(), b: MISC.rnd() };
}

function getPlanetDistanceFromStar(star, index) {
	MISC.rnd = seedrandom(`planet_distance_${star.id}_${index}`);
	const starSize = getStarSize(star) * 0.2;
	const planetNumber = index + 1;
	return starSize * (MISC.rnd() + 2) + (Math.pow(planetNumber + 1 + MISC.rnd() * 0.5, 4)) * 0.02;
}

function getPlanetTemperature(star, index) {
	MISC.rnd = seedrandom(`planet_temperature_${star.id}_${index}`);
	const starTemp = getStarTemperature(star);
	const planetDis = getPlanetDistanceFromStar(star, index);
	let temp = [
		Math.floor(starTemp / ((MISC.rnd() * (planetDis * 2) + (planetDis * 1.5)) * 1)),
		Math.floor(starTemp / ((MISC.rnd() * (planetDis * 2) + (planetDis * 1.5)) * 1))
	];
	temp = temp.sort((a, b) => (a > b ? 1 : -1));
	return {
		min: temp[0],
		max: temp[1]
	};
}

function getPlanetAtmosphere(star, index) {
	MISC.rnd = seedrandom(`planet_atmosphere_${star.id}_${index}`);
	const size = getPlanetSize(star, index);
	return {
		size: size + MISC.rnd() * size * 0.2,
		color: {
			r: MISC.rnd(),
			g: MISC.rnd(),
			b: MISC.rnd(),
			a: MISC.rnd()
		}
	};
}

function getPlanetRing(star, index) {
	MISC.rnd = seedrandom(`planet_ring_${star.id}_${index}`);
	const size = getPlanetSize(star, index);
	 if (size > 0.01 && MISC.rnd() < 0.5) {
		return {
			size: size + 0.2 + MISC.rnd() * size * 3,
			color: {
				r: MISC.rnd(),
				g: MISC.rnd(),
				b: MISC.rnd(),
				a: MISC.rnd() * 0.5 + 0.25
			}
		};
	}
}

function getPlanetRotationSpeed(star, index) {
	MISC.rnd = seedrandom(`planet_rotation_speed_${star.id}_${index}`);
	const starTemp = getStarTemperature(star);
	const planetDis = getPlanetDistanceFromStar(star, index);
	return starTemp / ((MISC.rnd() * (planetDis * 2) + (planetDis * 1.5)) * 100);
}

export function getPlanetInfo(star, index) {
	return {
		id: index,
		name: getPlanetName(star, index),
		temperature: getPlanetTemperature(star, index),
		distance: getPlanetDistanceFromStar(star, index),
		size: getPlanetSize(star, index),
		color: getPlanetColor(star, index),
		atmosphere: getPlanetAtmosphere(star, index),
		ring: getPlanetRing(star, index)
	};
}

export function getPlanetInfoString(planet) {
	return [
		planet.name,
		`Size: ${getSize(planet.size)}km`,
		`Temperature: ${toCelcius(planet.temperature.min)} to ${toCelcius(planet.temperature.max)}`,
		planet.ring ? 'Rings' : undefined
	];
}

export function getPlanets() {
	if (TD.star && TD.star.this && TD.star.this.planets && TD.star.planets) {
		// const star = TD.star.this;
		// for (let index = 0; index < star.planets.length; index++) {
		// 	if (TD.star.planets[index]) {
		// 		const planet = star.planets[index];
		// 		MISC.rnd = seedrandom(`planet_rotation_${star.id}_${index}`);
		// 		TD.star.planets[index].position.set(0, 0, 0);
		// 		TD.star.planets[index].rotation.y = Math.PI * MISC.rnd() * 0.02 * getTime() * getPlanetRotationSpeed(star, index);
		// 		TD.star.planets[index].translateX(-planet.distance * 0.001 * TD.scale);
		// 		TD.star.planets[index].obj = planet;
		// 	}
		// }
		raycastPlanet(TD.star.planets);
	}
}

export function drawPlanet(planet) {
	if (planet) {
		MISC.rnd = seedrandom(`planet_rotation_${TD.star.this.id}_${planet.id}`);
		const rotate = Math.PI * MISC.rnd() * 2;
		deleteThree(TD.planet.sphere);
		deleteThree(TD.planet.atmosphere);
		TD.planet.sphere = createSphere({
			size: planet.size * 0.001 * TD.scale,
			detail: 64,
			color: planet.color,
			rotate,
			distance: planet.distance * 0.001 * TD.scale,
			parent: TD.star.sphere
		});
		TD.planet.atmosphere = createSphere({
			size: planet.atmosphere.size * 0.001 * TD.scale,
			detail: 64,
			color: planet.atmosphere.color,
			rotate,
			distance: planet.distance * 0.001 * TD.scale,
			parent: TD.star.sphere
		});

		// const geometry = new THREE.SphereGeometry(size, 64, 64);
		// TD.colorHelper.setRGB(planet.color.r, planet.color.g, planet.color.b);
		// const material = new THREE.MeshStandardMaterial({ color: TD.colorHelper });
		// planet.sphere = new THREE.Mesh(geometry, material);
		// planet.sphere.position.set(0, 0, 0);
		// planet.sphere.rotation.y = Math.PI * MISC.rnd() * 2;
		// planet.sphere.translateX(planet.distance * 0.001 * TD.scale);
		// TD.star.sphere.add(planet.sphere);
	}
}
