import { MISC, TD } from '../../variables';
import seedrandom from 'seedrandom';
import * as THREE from 'three';
import createSphere from '../tools/createObject';
import { deleteThree } from '../init/init';

export default function drawPlanets(star) {
	if (star.planets) {
		for (let index = 0; index < star.planets.length; index++) {
			const planet = star.planets[index];
			MISC.rnd = seedrandom(`planet_rotation_${star.id}_${index}`);
			// const geometry = new THREE.SphereGeometry(planet.size * 0.001 * TD.scale, 16, 16);
			// TD.colorHelper.setRGB(planet.color.r, planet.color.g, planet.color.b);
			// const material = new THREE.MeshStandardMaterial({ color: TD.colorHelper });
			// TD.star.planets[index] = new THREE.Mesh(geometry, material);
			// TD.star.planets[index].position.set(0, 0, 0);
			// TD.star.planets[index].rotation.y = Math.PI * MISC.rnd() * 2;
			// TD.star.planets[index].translateX(-planet.distance * 0.001 * TD.scale);
			deleteThree(TD.star.planets[index]);
			TD.star.planets[index] = createSphere({
				size: planet.size * 0.001 * TD.scale,
				detail: 16,
				color: planet.color,
				emissive: planet.atmosphere.color,
				rotate: Math.PI * MISC.rnd() * 2,
				distance: planet.distance * 0.001 * TD.scale,
				parent: TD.star.sphere
			});
			const trajectoryGeometry = new THREE.RingBufferGeometry(1.0, 1.0 + (0.005 / planet.distance), 128, 1);
			const trajectoryMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, blending: THREE.NormalBlending, transparent: true, opacity: 0.2 });
			const trajectoryMesh = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
			trajectoryMesh.rotation.x = Math.PI * 0.5;
			trajectoryMesh.scale.set(planet.distance * 0.001 * TD.scale, planet.distance * 0.001 * TD.scale, planet.distance * 0.001 * TD.scale);
			trajectoryMesh.position.set(-planet.distance * 0.001 * TD.scale, 0, 0);
			TD.star.planets[index].add(trajectoryMesh);
			TD.star.planets[index].obj = planet;
			if (planet.ring) {
				MISC.rnd = seedrandom(`ring_rotation_${TD.star.this.id}_${planet.id}`);
				TD.colorHelper.setRGB(planet.ring.color.r, planet.ring.color.g, planet.ring.color.b);
				const ringGeometry = new THREE.RingBufferGeometry(planet.ring.size * 0.0006 * TD.scale, planet.ring.size * 0.001 * TD.scale, 12);
				// ringGeometry.verticesNeedUpdate = true;
				// ringGeometry.elementsNeedUpdate = true;
				// ringGeometry.morphTargetsNeedUpdate = true;
				// ringGeometry.uvsNeedUpdate = true;
				// ringGeometry.normalsNeedUpdate = true;
				// ringGeometry.colorsNeedUpdate = true;
				// ringGeometry.tangentsNeedUpdate = true;
				const ringMaterial = new THREE.MeshLambertMaterial({
					map: TD.texture.planet.ring,
					side: THREE.DoubleSide,
					color: TD.colorHelper,
					emissive: TD.colorHelper,
					emissiveIntensity: 0.5,
					opacity: planet.ring.color.a,
					transparent: true,
					blending: THREE.NormalBlending
				});
				const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
				ringMesh.renderOrder = 1;
				ringMesh.rotation.set(Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2, Math.PI * MISC.rnd() * 2);
				ringMesh.castShadow = true;
				ringMesh.receiveShadow = true;
				TD.star.planets[index].add(ringMesh);
			}
		}
	}
}

