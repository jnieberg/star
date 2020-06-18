import { TD, PLANET, MISC } from '../../variables';
import * as THREE from 'three';

function loadTexture(filename, detail = true) {
	const loader = new THREE.ImageLoader(TD.texture.manager);
	var texture = new THREE.Texture();
	loader.load(filename, image => {
		texture.needsUpdate = true;
		texture.image = image;
		if (detail) {
			// texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			texture.anisotropy = 16;
		}
	});
	return texture;
}

export default function initTextures(callback = () => {}) {
	TD.texture.manager = new THREE.LoadingManager();
	TD.texture.manager.onProgress = (item, loaded, total) => {
		// this gets called after any item has been loaded
	};

	TD.texture.manager.onLoad = () => {
		callback();
	};

	TD.texture.star.small = loadTexture('/star/star3.png', false);
	TD.texture.star.large = loadTexture('/star/star.png');
	TD.texture.star.surface = loadTexture('/star/surface2.jpg');
	TD.texture.planet.ring = loadTexture('/planet/ring.png');
	for (let s = 0; s < MISC.planet.surfaceMax; s++) {
		TD.texture.planet.surface.push(loadTexture(`/planet/surface${s}.jpg`));
	}
}
