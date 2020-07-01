import seedrandom from 'seedrandom';
import getName from '../../misc/name';
import { getStarTemperature, getStarSize } from './star';
import { MISC, TD } from '../../variables';
import setColor from '../../misc/color';
import { toCelcius } from '../../misc/temperature';
import getSize from '../../misc/size';
import createSphere from '../tools/createObject';
import { deleteThree } from '../init/init';
import THREEx from '../../lib/threex';
import getTime from '../../misc/time';
import * as THREE from 'three';
import drawPlanets from './planets';
import { Vector3 } from 'three';

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

function getPlanetColor(star, index, moon = -1, seed = '') {
	MISC.rnd = seedrandom(`planet_color${seed}_${star.id}_${index}_${moon}`);
	return { r: MISC.rnd(), g: MISC.rnd(), b: MISC.rnd() };
}

function getPlanetSurface(star, index, moon = -1, seed = '') {
	MISC.rnd = seedrandom(`planet_surface${seed}_${star.id}_${index}_${moon}`);
	return Math.floor(MISC.rnd() * MISC.planet.surfaceMax);
}

function getPlanetOuterOpacity(star, index, moon = -1) {
	MISC.rnd = seedrandom(`planet_outer_opacity_${star.id}_${index}_${moon}`);
	return MISC.rnd();
}

function getPlanetDistanceFromStar(star, index, moon = -1) {
	let scale = 0.5;
	let size = getStarSize(star) * 0.2;
	MISC.rnd = seedrandom(`planet_distance_${star.id}_${index}_${moon}`);
	let number = index + 1;
	if (moon > -1) {
		size = getPlanetSize(star, index);
		scale = 0.05;
		MISC.rnd = seedrandom(`planet_distance_${star.id}_${index}_${moon}`);
		number = moon;

		// return (size * 2) * (number * number * 0.5 + 1 + MISC.rnd() * 0.5);
	}
	// return starSize * (MISC.rnd() + 2) + (Math.pow(number + 1 + MISC.rnd() * 0.5, 4)) * 0.02;
	return size + ((number * number * ((MISC.rnd() * 0.25) + 1) + 3 + MISC.rnd() * 0.5)) * scale;
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
	let atmosphere = {
		size: 0,
		color: {
			hue: 0,
			saturation: 0,
			lightness: 0,
			a: 0
		}
	};
	if (moon === -1) {
		const planetSize = getPlanetSize(star, index);
		MISC.rnd = seedrandom(`planet_atmosphere_${star.id}_${index}_${moon}`);
		if (MISC.rnd() > 0.1) {
			atmosphere = {
				size: MISC.rnd() * planetSize * 0.1,
				color: {
					hue: MISC.rnd(),
					saturation: MISC.rnd() * 0.5 + 0.25,
					lightness: MISC.rnd() * 0.5 + 0.25,
					a: MISC.rnd()
				}
			};
		}
	}
	return atmosphere;
}

function getPlanetAtmosphereString(star, index, moon = -1) {
	const atmosphere = getPlanetAtmosphere(TD.star, index, moon);
	const atmosphereThickness = atmosphere.color.a;
	if (atmosphereThickness === 0) {
		return 'None';
	} else if (atmosphereThickness < 0.2) {
		return 'Very thin';
	} else if (atmosphereThickness < 0.4) {
		return 'Thin';
	} else if (atmosphereThickness < 0.6) {
		return 'Normal';
	}
	return 'Dense';
}

function getPlanetRing(star, index, moon = -1) {
	if (moon === -1) {
		const size = getPlanetSize(star, index, moon);
		MISC.rnd = seedrandom(`planet_ring_${star.id}_${index}_${moon}`);
	 	if (size > 0.01 && MISC.rnd() < 0.5) {
			return {
				thickness: MISC.rnd(),
				size: size * 2 + MISC.rnd() * size * 3,
				color: {
					r: MISC.rnd(),
					g: MISC.rnd(),
					b: MISC.rnd(),
					a: MISC.rnd() * 0.75 + 0.25
				}
			};
		}
	}
}

function getPlanetMoons(star, index) {
	const size = getPlanetSize(star, index);
	MISC.rnd = seedrandom(`planet_moons_${star.id}_${index}`);
	const moonMax = Math.floor(MISC.rnd() * size * 50);
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
		surface: getPlanetSurface(star, index, moon),
		atmosphere: getPlanetAtmosphere(star, index, moon),
		ring: getPlanetRing(star, index, moon),
		outer: {
			color: getPlanetColor(star, index, moon, '_outer'),
			surface: getPlanetSurface(star, index, moon, '_outer'),
			opacity: getPlanetOuterOpacity(star, index, moon)
		},
		children: moon === -1 ? getPlanetMoons(star, index) : undefined
	};
}

function getPlanetMoonsString(planet) {
	return planet.children.map(moon => `  ${moon.id + 1}. ${moon.name}`);
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

export function getPlanetRotationSpeed(star, index, moon = -1) {
	MISC.rnd = seedrandom(`planet_rotation_speed_${star.id}_${index}_${moon}`);
	return MISC.rnd() / 100.0;
}

export function getPlanetStarRotationSpeed(star, index, moon = -1) {
	const starTemp = moon === -1 ? getStarTemperature(star) : getPlanetTemperature(star, index).max;
	const planetDis = getPlanetDistanceFromStar(star, index, moon);
	MISC.rnd = seedrandom(`planet_star_rotation_speed_${star.id}_${index}_${moon}`);
	return starTemp / ((MISC.rnd() * (planetDis * 2) + (planetDis * 1.5)) * 100000);
}

export function drawPlanetRotation(star, planet, planetO, moon = -1) {
	const bodyO = moon === -1 ? planetO : planetO.children[moon];
	const body = moon === -1 ? planet : planet.children[moon];
	bodyO.position.set(0, 0, 0);
	bodyO.rotation.set(0, 0, 0);

	MISC.rnd = seedrandom(`planet_star_rotation_${star.this.id}_${planet.id}_${moon}`);
	bodyO.rotateY((getTime() * getPlanetStarRotationSpeed(star.this, planet.id, moon)) + Math.PI * MISC.rnd() * 2);
	bodyO.translateX(body.distance * 0.001 * TD.scale);
	MISC.rnd = seedrandom(`planet_rotation_${star.this.id}_${planet.id}_${moon}`);
	bodyO.rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);
	bodyO.rotateY(getTime() * TD.stargrid.size * getPlanetRotationSpeed(star.this, planet.id, moon));
}

export function drawPlanet(planet) {
	if (planet) {
		deleteThree(TD.planet.object);

		// Planet pivot
		TD.planet.object = new THREE.Object3D();
		drawPlanetRotation(TD.star, TD.planet.this, TD.planet.object);
		TD.star.object.add(TD.planet.object);

		// Planet sphere
		setColor(1, planet.color.r, planet.color.g, planet.color.b);
		setColor(2, planet.outer.color.r, planet.outer.color.g, planet.outer.color.b);
		// MISC.colorHelper.setRGB(planet.color.r, planet.color.g, planet.color.b); MISC.colorHelper.convertSRGBToLinear();
		// MISC.colorHelper2.setRGB(planet.outer.color.r, planet.outer.color.g, planet.outer.color.b); MISC.colorHelper2.convertSRGBToLinear();
		TD.planet.sphere = createSphere({
			color: MISC.colorHelper,
			surface: planet.surface,
			size: planet.size * 0.001 * TD.scale,
			detail: 64,
			// rotate,
			// distance: planet.distance * 0.001 * TD.scale,
			parent: TD.planet.object
		});
		TD.planet.sphereOut = createSphere({
			color: MISC.colorHelper2,
			surface: planet.outer.surface,
			size: (planet.size * 0.001 + 0.0000002) * TD.scale,
			detail: 64,
			parent: TD.planet.sphere
		});
		MISC.rnd = seedrandom(`planet_outer_rotation_${TD.star.this.id}_${planet.id}`);
		TD.planet.sphereOut.rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);
		TD.planet.sphereOut.castShadow = false;
		TD.planet.sphereOut.receiveShadow = false;
		TD.planet.sphereOut.material.opacity = planet.outer.opacity;
		TD.planet.sphereOut.material.blending = THREE.NormalBlending;
		TD.planet.sphereOut.material.transparent = true;
		TD.planet.sphereOut.material.alphaTest = 0;

		// Planet atmosphere
		if (planet.atmosphere) {
			setColor(1, planet.atmosphere.color.hue, planet.atmosphere.color.saturation, planet.atmosphere.color.lightness, 'hsl');
			// MISC.colorHelper.setHSL(planet.atmosphere.color.hue, planet.atmosphere.color.saturation, planet.atmosphere.color.lightness);
			TD.planet.atmosphere = new THREEx.GeometricGlowMesh(TD.planet.sphere, {
				size: (planet.size * 0.001 + 0.0000004) * TD.scale,
				thickness: (planet.atmosphere.size * 0.001 + 0.0000004) * TD.scale,
				color: MISC.colorHelper,
				opacity: planet.atmosphere.color.a
			});
		}

		// Update star spotlight
		TD.star.light.target = TD.planet.object;
		// TD.star.light.target.updateMatrix();
		// TD.star.light.target.updateMatrixWorld();
		// const vector = new THREE.Vector3(TD.planet.object.position.x, TD.planet.object.position.y, TD.planet.object.position.z);
		// TD.planet.object.updateMatrix();
		// TD.planet.object.getWorldPosition(vector);
		// TD.star.light.lookAt(vector);
		// TD.star.light.position.set(TD.planet.object.position.x * 0.8, TD.planet.object.position.y * 0.8, TD.planet.object.position.z * 0.8);
		// TD.star.light.updateMatrix();
		// TD.star.light.updateMatrixWorld();
		TD.star.light.visible = true;
		// TD.scene.add(new THREE.CameraHelper(TD.star.light.shadow.camera)); // TEST

		// Draw moons of planet
		TD.planet = drawPlanets(TD.star.this, planet);
		TD.planet.sphere.this = planet;
	}
}
