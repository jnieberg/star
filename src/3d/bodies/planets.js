import seedrandom from 'seedrandom';
import getName from '../../misc/name';
import { getStarTemperature, getStarSize } from './star';
import { MISC, TD } from '../../variables';
import * as THREE from 'three';
import raycastPlanet from '../raycast/raycastPlanet';
import { toCelcius } from '../../misc/temperature';
import getSize from '../../misc/size';

function getPlanetName(star, index) {
	MISC.rnd = seedrandom(`planet_${star.id}_${index}`);
	return getName(2, 2);
}

function getPlanetSize(star, index) {
	MISC.rnd = seedrandom(`planet_size_${star.id}_${index}`);
	const starSize = getStarSize(star);
	return starSize * (MISC.rnd() * 0.02 + 0.005);
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

function getPlanetRotationSpeed(star, index) {
	MISC.rnd = seedrandom(`planet_rotation_speed_${star.id}_${index}`);
	const starTemp = getStarTemperature(star);
	const planetDis = getPlanetDistanceFromStar(star, index);
	return starTemp / ((MISC.rnd() * (planetDis * 2) + (planetDis * 1.5)) * 100);
}

export function getPlanetInfo(star, index) {
	return {
		id: index + 1,
		name: getPlanetName(star, index),
		temperature: getPlanetTemperature(star, index),
		distance: getPlanetDistanceFromStar(star, index),
		size: getPlanetSize(star, index),
		color: getPlanetColor(star, index)
	};
}

export function getPlanetInfoString(planet) {
	return [
		planet.name,
		`Size: ${getSize(planet.size)}km`,
		`Temperature: ${toCelcius(planet.temperature.min)} to ${toCelcius(planet.temperature.max)}`
	];
}

export function drawPlanet(index) {
	const star = TD.star.this;
	const planet = star.planets[index];
	MISC.rnd = seedrandom(`planet_rotation_${star.id}_${index}`);
	const geometry = new THREE.SphereGeometry(planet.size * 0.001 * TD.scale, 16, 16);
	TD.colorHelper.setRGB(planet.color.r, planet.color.g, planet.color.b);
	const material = new THREE.MeshStandardMaterial({ color: TD.colorHelper });
	TD.star.planets[index] = new THREE.Mesh(geometry, material);
	TD.star.planets[index].position.set(0, 0, 0);
	TD.star.planets[index].rotation.y = Math.PI * MISC.rnd() * 2;
	TD.star.planets[index].translateX(-planet.distance * 0.001 * TD.scale);
	TD.star.planets[index].obj = planet;
	const ringGeometry = new THREE.RingGeometry(1.0, 1.0 + (0.005 / planet.distance), 128, 1);
	const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
	const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
	ringMesh.rotation.x = Math.PI * 0.5;
	ringMesh.scale.set(planet.distance * 0.001 * TD.scale, planet.distance * 0.001 * TD.scale, planet.distance * 0.001 * TD.scale);
	TD.star.sphere.add(ringMesh);
	TD.star.sphere.add(TD.star.planets[index]);
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
