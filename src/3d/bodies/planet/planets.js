import { MISC, TD } from '../../../variables';
import seedrandom from 'seedrandom';
import * as THREE from 'three';
import createSphere from '../../tools/createObject';
import { deleteThree } from '../../init/init';
import raycastPlanet from '../../raycast/raycastPlanet';
import { drawPlanetRotation, drawPlanet } from './planet';
import setColor, { getColorMix } from '../../../misc/color';
import Planet from './views/Planet';
import THREEx from '../../../lib/threex';

export function getPlanets() {
	if (TD.star && TD.star.this && TD.star.this.children && TD.star.children) {
		raycastPlanet(TD.star.children);
	}
}

export function eventPlanets() {
	if (TD.star && TD.star.this && TD.star.this.children && TD.star.children) {
		for (let index = 0; index < TD.star.children.length; index++) {
			drawPlanetRotation(TD.star, TD.star.children[index].this, TD.star.children[index]);
		}
		if (TD.star && TD.planet && TD.planet.this && TD.planet.object) {
			drawPlanetRotation(TD.star, TD.planet.this, TD.planet.object);
			// if (TD.planet.atmosphere && TD.planet.atmosphere.inside) {
			// TD.planet.atmosphere.inside.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(TD.camera.object.position, TD.planet.atmosphere.inside.position);
			// TD.planet.atmosphere.outside.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(TD.camera.object.position, TD.planet.atmosphere.outside.position);
			// }
			// for (let index = 0; index < TD.planet.children.length; index++) {
			// drawPlanetRotation(TD.star, TD.planet.this, TD.planet.object, index);
			// }
		}
	}
}

export default function drawPlanets(star, planet) {
	const isMoon = Boolean(planet);
	const body = isMoon ? planet : star;
	const bodyO = isMoon ? TD.planet : TD.star;
	if (body.children) {
		for (let c = 0; c < body.children.length; c++) {
			((body, bodyO, c) => {
				// wait(() => {
				const child = body.children[c];

				deleteThree(bodyO.children[c]);
				setColor(1, child.color.r, child.color.g, child.color.b);
				setColor(2, 0, 0, 0);
				// MISC.colorHelper.setRGB(child.color.r, child.color.g, child.color.b);
				// MISC.colorHelper2.setRGB(0, 0, 0);

				// Set atmosphere color as emmisive
				if (child.atmosphere && !isMoon) {
					setColor(2, child.atmosphere.color.hue, child.atmosphere.color.saturation, child.atmosphere.color.lightness, 'hsl');
					// MISC.colorHelper2.setHSL(child.atmosphere.color.hue, child.atmosphere.color.saturation, child.atmosphere.color.lightness);
				}

				// Mix inner and outer color
				if (child.outer && !isMoon) {
					const mix = getColorMix(
						child.color.r, child.color.g, child.color.b, // mix inner and outer sphere color
						child.outer.color.r, child.outer.color.g, child.outer.color.b,
						child.outer.opacity);
					setColor(1, ...mix);
					// MISC.colorHelper.setRGB(...mix);
				}

				// Planet sphere
				MISC.rnd = seedrandom(isMoon ? `planet_star_rotation_${star.id}_${planet.id}_${c}` : `planet_star_rotation_${star.id}_${c}`);

				// bodyO.children[c] = createSphere({
				// 	size: child.size * 0.00097 * TD.scale,
				// 	detail: 16,
				// 	color: isMoon ? MISC.colorHelper : 0xffffff,
				// 	rotate: Math.PI * MISC.rnd() * 2,
				// 	distance: child.distance * 0.001 * TD.scale,
				// 	parent: bodyO.object
				// });
				const planetLow = new Planet({
					rnd: isMoon ? `planet_${star.id}_${planet.id}_${c}` : `planet_${star.id}_${c}`,
					size: child.size * 0.00097 * TD.scale,
					resolution: 32
				});
				bodyO.children[c] = planetLow.view;
				bodyO.children[c].rotation.y = Math.PI * MISC.rnd() * 2 || 0;
				bodyO.children[c].translateX(child.distance * 0.001 * TD.scale || 0);
				bodyO.object.add(bodyO.children[c]);

				// New Planet
				// console.log(body);
				// bodyO.children[c] = drawPlanet(child);
				// console.log(bodyO.children[c]);

				// if (isMoon) {
				// 	bodyO.children[c].castShadow = true;
				// 	bodyO.children[c].receiveShadow = true;
				// } else {
				// 	bodyO.children[c].castShadow = true;
				// 	bodyO.children[c].receiveShadow = false;
				// }
				// MISC.rnd = seedrandom(isMoon ? `planet_rotation_${star.id}_${planet.id}_${c}` : `planet_rotation_${star.id}_${c}`);
				// bodyO.children[c].rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);


				// Planet trajectory
				// if (!isMoon) {
				const trajectoryGeometry = new THREE.RingBufferGeometry(1.0 - ((isMoon ? 0.01 : 0.05) / child.distance), 1.0 + ((isMoon ? 0.01 : 0.05) / child.distance), 128, 1);
				const trajectoryMaterial = new THREE.MeshBasicMaterial({
					color: 0x0044ff,
					side: THREE.DoubleSide,
					blending: THREE.AdditiveBlending,
					transparent: false,
					opacity: isMoon ? 0.15 : 0.25,
					depthTest: false
				});
				const trajectoryMesh = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
				trajectoryMesh.rotation.x = Math.PI * 0.5;
				trajectoryMesh.scale.set(child.distance * 0.001 * TD.scale, child.distance * 0.001 * TD.scale, child.distance * 0.001 * TD.scale);
				trajectoryMesh.castShadow = false;
				trajectoryMesh.receiveShadow = false;
				trajectoryMesh.renderOrder = -1;
				bodyO.object.add(trajectoryMesh);
				bodyO.children[c].this = child;
				// }

				// Planet ring
				if (child.ring) {
					setColor(1, child.ring.color.r, child.ring.color.g, child.ring.color.b);
					// MISC.colorHelper.setRGB(child.ring.color.r, child.ring.color.g, child.ring.color.b);
					const ringGeometry = new THREE.RingBufferGeometry(child.ring.size * 0.0006 * TD.scale, child.ring.size * ((child.ring.thickness * 0.0004) + 0.0006) * TD.scale, 64);
					const ringMaterial = new THREE.MeshPhongMaterial({
						map: TD.texture.planet.ring,
						color: MISC.colorHelper,
						emissive: MISC.colorHelper,
						emissiveIntensity: 0.01,
						opacity: child.ring.color.a,
						side: THREE.DoubleSide,
						blending: THREE.NormalBlending,
						alphaTest: 0,
						transparent: true
					});
					const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
					ringMesh.customDepthMaterial = new THREE.MeshDepthMaterial({
						depthPacking: THREE.RGBADepthPacking,
						map: TD.texture.planet.ring,
						side: THREE.DoubleSide,
						opacity: child.ring.color.a,
						alphaTest: 0
					});
					ringMesh.renderOrder = 1;
					ringMesh.rotateX(Math.PI * 0.5);
					// ringMesh.translateZ(0.1);
					// ringMesh.rotation.set(Math.PI * MISC.rnd() * 0.1, Math.PI * MISC.rnd() * 0.1, Math.PI * MISC.rnd() * 0.1); // TEST
					ringMesh.castShadow = true;
					ringMesh.receiveShadow = true;
					bodyO.children[c].add(ringMesh);
					// const ringMesh2 = ringMesh.clone();
					// ringMesh2.material = ringMesh.material.clone();
					// ringMesh2.material.side = THREE.BackSide;
					// ringMesh2.material.shadowSide = THREE.FrontSide;
					// // ringMesh.rotateX(Math.PI);
					// // ringMesh2.translateZ(-2);
					// bodyO.children[c].add(ringMesh2);
				}
				bodyO.children[c].this = child;
				// if (!isMoon) {
				// 	bodyO.children[c] = drawPlanets(star, child);
				// }
				// });
			})(body, bodyO, c);
		}
	}
	return bodyO;
}

