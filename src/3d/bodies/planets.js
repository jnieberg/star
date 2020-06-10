import { MISC, TD } from '../../variables';
import seedrandom from 'seedrandom';
import * as THREE from 'three';
import createSphere from '../tools/createObject';
import { deleteThree } from '../init/init';
import raycastPlanet from '../raycast/raycastPlanet';
import { drawPlanetRotation } from './planet';

export function getPlanets() {
	if (TD.star && TD.star.this && TD.star.this.children && TD.star.children) {
		for (let index = 0; index < TD.star.children.length; index++) {
			drawPlanetRotation(TD.star, TD.star.children[index].this, TD.star.children[index]);
		}
		if (TD.star && TD.planet && TD.planet.this && TD.planet.object) {
			drawPlanetRotation(TD.star, TD.planet.this, TD.planet.object);
			for (let index = 0; index < TD.planet.children.length; index++) {
				// drawPlanetRotation(TD.star, TD.planet.this, TD.planet.object, index);
			}
		}
		raycastPlanet(TD.star.children);
	}
}

export default function drawPlanets(star, planet) {
	const body = planet ? planet : star;
	const bodyO = planet ? TD.planet : TD.star;
	if (body.children) {
		for (let c = 0; c < body.children.length; c++) {
			const child = body.children[c];
			deleteThree(bodyO.children[c]);
			TD.colorHelper.setRGB(child.color.r, child.color.g, child.color.b);
			TD.colorHelper2.setRGB(0, 0, 0);
			if (child.atmosphere && !planet) {
				TD.colorHelper2.setHSL(child.atmosphere.color.hue, 1.0, 0.5);
			}

			// Planet sphere
			MISC.rnd = seedrandom(planet ? `planet_star_rotation_${star.id}_${planet.id}_${c}` : `planet_star_rotation_${star.id}_${c}`);
			bodyO.children[c] = createSphere({
				surface: child.surface,
				size: child.size * 0.00099 * TD.scale,
				detail: 64,
				color: TD.colorHelper,
				emissive: TD.colorHelper2,
				emissiveIntensity: 0.15,
				rotate: Math.PI * MISC.rnd() * 2,
				distance: child.distance * 0.001 * TD.scale,
				parent: bodyO.object
			});
			bodyO.children[c].castShadow = true;
			bodyO.children[c].receiveShadow = true;
			MISC.rnd = seedrandom(planet ? `planet_rotation_${star.id}_${planet.id}_${c}` : `planet_rotation_${star.id}_${c}`);
			// bodyO.children[c].rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);


			// Planet trajectory
			const trajectoryGeometry = new THREE.RingBufferGeometry(1.0, 1.0 + ((planet ? 0.001 : 0.005) / child.distance), 128, 1);
			const trajectoryMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff,
				side: THREE.DoubleSide,
				blending: THREE.NormalBlending,
				transparent: true,
				opacity: 0.25
			});
			const trajectoryMesh = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
			trajectoryMesh.rotation.x = Math.PI * 0.5;
			trajectoryMesh.scale.set(child.distance * 0.001 * TD.scale, child.distance * 0.001 * TD.scale, child.distance * 0.001 * TD.scale);
			trajectoryMesh.castShadow = false;
			trajectoryMesh.receiveShadow = false;
			bodyO.object.add(trajectoryMesh);
			bodyO.children[c].this = child;

			// Planet ring
			if (child.ring) {
				TD.colorHelper.setRGB(child.ring.color.r, child.ring.color.g, child.ring.color.b);
				const ringGeometry = new THREE.RingBufferGeometry(child.ring.size * 0.0006 * TD.scale, child.ring.size * 0.001 * TD.scale, 12);
				const ringMaterial = new THREE.MeshLambertMaterial({
					depthPacking: THREE.RGBADepthPacking,
					map: TD.texture.planet.ring,
					color: TD.colorHelper,
					emissive: TD.colorHelper,
					emissiveIntensity: 0.15,
					opacity: child.ring.color.a,
					side: THREE.DoubleSide,
					blending: THREE.NormalBlending,
					transparent: true,
					alphaTest: 0.5,
					needsUpdate: true
				});
				const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
				ringMesh.customDepthMaterial = new THREE.MeshDepthMaterial({
					depthPacking: THREE.RGBADepthPacking,
					map: TD.texture.planet.ring,
					alphaTest: 0.5
				});
				// ringMesh.renderOrder = 2;
				ringMesh.rotateX(Math.PI * 0.5);
				// ringMesh.translateZ(0.01);
				// ringMesh.rotation.set(Math.PI * MISC.rnd() * 0.2, Math.PI * MISC.rnd() * 0.2, Math.PI * MISC.rnd() * 0.2); // TEST
				ringMesh.castShadow = true;
				ringMesh.receiveShadow = true;
				bodyO.children[c].add(ringMesh);
				// const ringMesh2 = ringMesh.clone();
				// ringMesh2.material = ringMesh.material.clone();
				// ringMesh2.material.side = THREE.BackSide;
				// ringMesh2.translateZ(-0.01);
				// bodyO.children[c].add(ringMesh2);
			}
			bodyO.children[c].this = child;
			// if (!planet) {
			// 	bodyO.children[c] = drawPlanets(star, child);
			// }
		}
	}
	return bodyO;
}

