import seedrandom from 'seedrandom';
import { getPlanetInfo } from '../planet/planet';
import { toCelcius } from '../../../misc/temperature';
import getName from '../../../misc/name';
import { TD, MISC, STAR } from '../../../variables';
import * as THREE from 'three';
import { deleteThree } from '../../init/init';
import drawPlanets from '../planet/planets';
import raycastStar from '../../raycast/raycastStar';
import setColor from '../../../misc/color';
import { getStarPosition } from '../../tools/starList';

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
		const pos = getStarPosition(star);
		const size = star.size * 0.002 * TD.scale;
		deleteThree(TD.star.object);
		const hue2 = star.hue - 0.05 > 0 ? star.hue - 0.05 : 0;
		setColor(1, star.hue, 1.0, star.brightness * 0.5, 'hsl');
		setColor(2, hue2, 1.0, star.brightness, 'hsl');
		setColor(3, star.hue, 0.25, star.brightness, 'hsl');
		MISC.rnd = seedrandom(`star_rotation_${star.id}`);

		// Star pivot
		TD.star.object = new THREE.Object3D();
		TD.star.object.rotation.x = Math.PI * MISC.rnd() * 2;
		TD.star.object.rotation.y = Math.PI * MISC.rnd() * 2;
		TD.star.object.rotation.z = Math.PI * MISC.rnd() * 2;

		// Star backside
		const geometry = new THREE.SphereBufferGeometry(size * 0.1, 32, 32);
		const material = new THREE.MeshBasicMaterial({
			color: MISC.colorHelper,
			side: THREE.BackSide,
			transparent: true,
			alphaTest: 0.5,
		});
		TD.star.sphere = new THREE.Mesh(geometry, material);
		TD.star.sphere.renderOrder = 1;
		TD.star.sphere.castShadow = false;
		TD.star.sphere.receiveShadow = false;
		TD.star.object.add(TD.star.sphere);

		// Star frontside
		const material2 = new THREE.MeshBasicMaterial({
			color: MISC.colorHelper2,
			blending: THREE.AdditiveBlending,
			side: THREE.FrontSide,
			transparent: true,
			alphaTest: 0.5,
		});
		const starInner = new THREE.Mesh(geometry, material2);
		starInner.renderOrder = 1;
		starInner.castShadow = false;
		starInner.receiveShadow = false;
		TD.star.object.add(starInner);

		// Star inside
		const material3 = new THREE.MeshBasicMaterial({
			map: TD.texture.star.surface,
			color: MISC.colorHelper,
			transparent: true,
			alphaTest: 0.5,
		});
		const starInner3 = new THREE.Mesh(geometry, material3);
		starInner3.scale.set(1, 1, 1);// 0.98, 0.98, 0.98);
		starInner3.castShadow = false;
		starInner3.receiveShadow = false;
		TD.star.object.add(starInner3);

		// Star corona
		// MISC.colorHelper2.setHSL(hue2, 1.0, star.brightness);
		const flareMaterial = new THREE.SpriteMaterial({
			map: TD.texture.star.large,
			color: MISC.colorHelper2,
			opacity: 1,
			blending: THREE.AdditiveBlending,
			alphaTest: 0.5,
			depthTest: false
		});
		const starFlare = new THREE.Sprite(flareMaterial);
		starFlare.scale.set(size, size, size);
		starFlare.castShadow = false;
		starFlare.receiveShadow = false;
		TD.star.object.add(starFlare);

		// Star point light
		TD.star.pointLight = new THREE.PointLight(MISC.colorHelper3, 2, TD.camera.far * 0.1 * TD.scale);
		TD.star.pointLight.castShadow = false;
		TD.star.object.add(TD.star.pointLight);

		// Star spot light
		TD.star.light = new THREE.DirectionalLight(MISC.colorHelper3);
		TD.star.light.intensity = 1;
		TD.star.light.power = 20;
		TD.star.light.decay = 0;
		TD.star.light.distance = TD.camera.far * 0.0001 * TD.scale;
		TD.star.light.angle = Math.PI / 4;
		TD.star.light.penumbra = 0.1;
		const grid = 0.005;
		TD.star.light.shadow.bias = 0.00000001;// -TD.camera.near * 0.0001 * TD.scale;
		TD.star.light.shadow.mapSize.width = 1024 * 2;
		TD.star.light.shadow.mapSize.height = 1024 * 2;
		// TD.star.light.shadow.camera.fov = 30;
		// TD.star.light.shadow.camera.aspect = 1;
		TD.star.light.shadow.camera.left = -grid * TD.scale;
		TD.star.light.shadow.camera.right = grid * TD.scale;
		TD.star.light.shadow.camera.top = grid * TD.scale;
		TD.star.light.shadow.camera.bottom = -grid * TD.scale;
		TD.star.light.shadow.camera.near = 0.00000001;// TD.camera.near * TD.scale;
		TD.star.light.shadow.camera.far = TD.camera.far * 0.0001 * TD.scale;
		TD.star.light.castShadow = true;
		TD.star.light.visible = false;

		// TD.star.object.add(TD.star.light.target);
		TD.star.object.add(TD.star.light);

		// Set star position
		TD.star.object.position.set(pos.x, pos.y, pos.z);

		// Draw planets of star
		TD.star = drawPlanets(star);

		// Add star to scene
		TD.scene.add(TD.star.object);
		// TD.star.light.updateMatrix();
		// TD.star.light.updateMatrixWorld();
		TD.star.sphere.this = star;
	}
}

export function getStar() {
	if (TD.star.sphere && TD.star.this) {
		raycastStar(TD.star.sphere);
	}
}
