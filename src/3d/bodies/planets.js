import { MISC, TD } from '../../variables';
import seedrandom from 'seedrandom';
import * as THREE from 'three';
import createSphere from '../tools/createObject';
import { deleteThree } from '../init/init';
import raycastPlanet from '../raycast/raycastPlanet';

export function getPlanets() {
	if (TD.star && TD.star.this && TD.star.this.children && TD.star.children) {
		// setPlanetRotation();
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
			TD.colorHelper2.setHSL(0, 0, 0);
			if (child.atmosphere) {
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
				rotate: Math.PI * MISC.rnd() * 2,
				distance: child.distance * 0.001 * TD.scale,
				parent: bodyO.object
			});
			MISC.rnd = seedrandom(planet ? `planet_rotation_${star.id}_${planet.id}_${c}` : `planet_rotation_${star.id}_${c}`);
			bodyO.children[c].rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);


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
				const ringGeometry = new THREE.RingGeometry(child.ring.size * 0.0006 * TD.scale, child.ring.size * 0.001 * TD.scale, 12);
				const ringMaterial = new THREE.MeshStandardMaterial({
					map: TD.texture.planet.ring,
					color: TD.colorHelper,
					emissive: TD.colorHelper,
					emissiveIntensity: 0.15,
					opacity: child.ring.color.a,
					side: THREE.DoubleSide,
					transparent: true,
					blending: THREE.NormalBlending
				});
				const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
				ringMesh.renderOrder = 2;
				ringMesh.rotateX(Math.PI * 0.5);
				// ringMesh.rotation.set(Math.PI * MISC.rnd() * 0.2, Math.PI * MISC.rnd() * 0.2, Math.PI * MISC.rnd() * 0.2); // TEST
				ringMesh.castShadow = true;
				ringMesh.receiveShadow = true;
				bodyO.children[c].add(ringMesh);
			}
			bodyO.children[c].this = child;
			// if (!planet) {
			// 	bodyO.children[c] = drawPlanets(star, child);
			// }
		}
	}
	return bodyO;
}

