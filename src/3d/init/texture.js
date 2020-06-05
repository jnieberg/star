import { TD, PLANET } from '../../variables';
import * as THREE from 'three';

export default function initTextures() {
	const loader = new THREE.TextureLoader();
	TD.texture.star.small = loader.load('/star/star.png');
	TD.texture.star.large = loader.load('/star/star.png');
	TD.texture.star.surface = loader.load('/star/surface2.jpg');
	TD.texture.planet.ring = loader.load('/planet/ring.png');
	for (let s = 0; s < PLANET.surfaceMax; s++) {
		TD.texture.planet.surface.push(loader.load(`/planet/surface${s}.jpg`));
	}
}
