import seedrandom from 'seedrandom';
import getName from '../../misc/name';
import { getStarTemperature, getStarSize } from './star';
import { MISC, TD, PLANET } from '../../variables';
import { toCelcius } from '../../misc/temperature';
import getSize from '../../misc/size';
import createSphere from '../tools/createObject';
import { deleteThree } from '../init/init';
import THREEx from '../../lib/threex';
import getTime from '../../misc/time';
import * as THREE from 'three';
import drawPlanets from './planets';

function getPlanetName(star, index, moon = -1) {
	MISC.rnd = seedrandom(`planet_${star.id}_${index}_${moon}`);
	return getName(2, 2);
}

function getPlanetSize(star, index, moon = -1) {
	if (moon > -1) {
		const planetSize = getPlanetSize(star, index);
		MISC.rnd = seedrandom(`planet_size_${star.id}_${index}_${moon}`);
		return planetSize * (MISC.rnd() * 0.2 + 0.02);
	}
	MISC.rnd = seedrandom(`planet_size_${star.id}_${index}_${moon}`);
	const starSize = getStarSize(star);
	return starSize * (MISC.rnd() * 0.02 + 0.002);
}

function getPlanetColor(star, index, moon = -1) {
	MISC.rnd = seedrandom(`planet_color_${star.id}_${index}_${moon}`);
	return { r: MISC.rnd(), g: MISC.rnd(), b: MISC.rnd() };
}

function getPlanetDistanceFromStar(star, index, moon = -1) {
	if (moon > -1) {
		const planetSize = getPlanetSize(star, index) * 0.5;
		MISC.rnd = seedrandom(`planet_distance_${star.id}_${index}_${moon}`);
		const moonNumber = moon + 1;
		return planetSize * (MISC.rnd() + 2) + (Math.pow(moonNumber + 1 + MISC.rnd() * 0.5, 3)) * 0.005;
	}
	const starSize = getStarSize(star) * 0.2;
	MISC.rnd = seedrandom(`planet_distance_${star.id}_${index}_${moon}`);
	const planetNumber = index + 1;
	return starSize * (MISC.rnd() + 2) + (Math.pow(planetNumber + 1 + MISC.rnd() * 0.5, 4)) * 0.02;
}

function getPlanetTemperature(star, index, moon = -1) {
	const starTemp = moon === -1 ? getStarTemperature(star) : getPlanetTemperature(star, index);
	const planetDis = getPlanetDistanceFromStar(star, index, moon);
	MISC.rnd = seedrandom(`planet_temperature_${star.id}_${index}_${moon}`);
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

function getPlanetAtmosphere(star, index, moon = -1) {
	if (moon === -1) {
		MISC.rnd = seedrandom(`planet_atmosphere_${star.id}_${index}_${moon}`);
		if (MISC.rnd() > 0.1) {
			return {
				size: MISC.rnd() * 0.01,
				color: {
					hue: MISC.rnd(),
					a: MISC.rnd() * 0.8
				}
			};
		}
	}
}

function getPlanetAtmosphereString(planet) {
	const atmosphere = getPlanetAtmosphere(planet);
	const atmosphereThickness = atmosphere.color.a;
	const atmosphereColor = atmosphere.color.hue;
	if (atmosphereThickness === 0) {
		return 'None';
	} else if (atmosphereThickness < 0.2) {
		return 'Thin';
	} else if (atmosphereThickness < 0.4) {
		return 'Medium';
	} else if (atmosphereThickness < 0.6) {
		return 'Dense';
	}
	return 'Very dense';
}

function getPlanetSurface(star, index, moon = -1) {
	MISC.rnd = seedrandom(`planet_surface_${star.id}_${index}_${moon}`);
	return {
		texture: Math.floor(MISC.rnd() * PLANET.surfaceMax),
		texture2: Math.floor(MISC.rnd() * PLANET.surfaceMax),
		blend: MISC.rnd()
	};
}

function getPlanetRing(star, index, moon = -1) {
	if (moon === -1) {
		const size = getPlanetSize(star, index, moon);
		MISC.rnd = seedrandom(`planet_ring_${star.id}_${index}_${moon}`);
	 if (size > 0.01 && MISC.rnd() < 0.5) {
			return {
				size: size * 2 + MISC.rnd() * size * 3,
				color: {
					r: MISC.rnd(),
					g: MISC.rnd(),
					b: MISC.rnd(),
					a: MISC.rnd() * 0.5 + 0.5
				}
			};
		}
	}
}

export function getPlanetRotationSpeed(star, index, moon = -1) {
	MISC.rnd = seedrandom(`planet_rotation_speed_${star.id}_${index}_${moon}`);
	return MISC.rnd();
}

export function getPlanetStarRotationSpeed(star, index, moon = -1) {
	const starTemp = moon === -1 ? getStarTemperature(star) : getPlanetTemperature(star, index).max;
	const planetDis = getPlanetDistanceFromStar(star, index, moon);
	MISC.rnd = seedrandom(`planet_star_rotation_speed_${star.id}_${index}_${moon}`);
	return starTemp / ((MISC.rnd() * (planetDis * 2) + (planetDis * 1.5)) * 10000);
}

function getPlanetMoons(star, index) {
	const size = getPlanetSize(star, index); // 0.02 + 0.002
	MISC.rnd = seedrandom(`planet_moons_${star.id}_${index}`);
	const moonMax = Math.floor(MISC.rnd() * size * 100);
	const children = [];
	for (let moon = 0; moon < moonMax; moon++) {
		// eslint-disable-next-line no-use-before-define
		children.push(getPlanetInfo(star, index, moon));
	}
	return children;
}

export function getPlanetInfo(star, index, moon = -1) {
	return {
		id: moon === -1 ? index : moon,
		type: moon === -1 ? 'planet' : 'moon',
		name: getPlanetName(star, index, moon),
		temperature: getPlanetTemperature(star, index, moon),
		distance: getPlanetDistanceFromStar(star, index, moon),
		size: getPlanetSize(star, index, moon),
		color: getPlanetColor(star, index, moon),
		atmosphere: getPlanetAtmosphere(star, index, moon),
		ring: getPlanetRing(star, index, moon),
		surface: getPlanetSurface(star, index, moon),
		children: moon === -1 ? getPlanetMoons(star, index) : undefined
	};
}

function getPlanetMoonsString(planet) {
	return planet.children.map(moon => `  ${moon.id + 1}. ${moon.name} ${moon.size}`);
}

export function getPlanetInfoString(planet) {
	const children = planet.children && planet.children.length ? [ 'Moons:', ...getPlanetMoonsString(planet) ] : [];
	return [
		`${planet.id + 1}. ${planet.name}`,
		`Size: ${getSize(planet.size)}km`,
		`Temperature: ${toCelcius(planet.temperature.min)} to ${toCelcius(planet.temperature.max)}`,
		`Atmosphere: ${getPlanetAtmosphereString(planet)}`,
		// planet.ring ? 'Has rings' : undefined,
		...children
	];
}

export function drawPlanetRotation(star, planet, planetO, moon = -1) {
	const bodyO = moon === -1 ? planetO : planetO.children[moon];
	const body = moon === -1 ? planet : planet.children[moon];
	bodyO.position.set(0, 0, 0);
	bodyO.rotation.set(0, 0, 0);

	MISC.rnd = seedrandom(`planet_star_rotation_${star.this.id}_${planet.id}_${moon}`);
	bodyO.rotateY(getTime() * getPlanetStarRotationSpeed(star.this, planet.id, moon));
	bodyO.translateX(body.distance * 0.001 * TD.scale);
	MISC.rnd = seedrandom(`planet_rotation_${star.this.id}_${planet.id}_${moon}`);
	bodyO.rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);
	bodyO.rotateY(getTime() * 100 * getPlanetRotationSpeed(star.this, planet.id, moon));
}

export function drawPlanet(planet) {
	if (planet) {
		const star = TD.star;
		deleteThree(TD.planet.object);

		// Planet pivot
		TD.planet.object = new THREE.Object3D();
		drawPlanetRotation(star, TD.planet.this, TD.planet.object);
		star.object.add(TD.planet.object);

		// Planet sphere
		TD.colorHelper.setRGB(planet.color.r, planet.color.g, planet.color.b);
		TD.planet.sphere = createSphere({
			surface: planet.surface,
			size: planet.size * 0.001 * TD.scale,
			detail: 64,
			color: TD.colorHelper,
			// rotate,
			// distance: planet.distance * 0.001 * TD.scale,
			parent: TD.planet.object
		});

		// Planet atmosphere
		if (planet.atmosphere) {
			TD.colorHelper.setHSL(planet.atmosphere.color.hue, 1.0, 0.5);
			TD.planet.atmosphere = new THREEx.GeometricGlowMesh(TD.planet.sphere, {
				size: planet.size * 0.001 * TD.scale,
				thickness: planet.atmosphere.size * 0.001 * TD.scale,
				color: TD.colorHelper,
				opacity: planet.atmosphere.color.a
			});
		}

		// Update star spotlight
		star.light.visible = true;
		star.light.target = TD.planet.object;
		star.light.target.updateMatrixWorld();
		// const spotLightHelper = new THREE.SpotLightHelper(starO.light); TD.scene.add(spotLightHelper); // TEST
		star.light.updateMatrix();
		star.light.updateMatrixWorld();

		// Draw moons of planet
		TD.planet = drawPlanets(star.this, planet);
		TD.planet.sphere.this = planet;
	}
}
