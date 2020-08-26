import * as THREE from 'three';
import { TD } from '../../variables';

function loadTexture(filename, detail = true) {
  const loader = new THREE.ImageLoader(TD.texture.manager);
  const texture = new THREE.Texture();
  loader.load(filename, (image) => {
    texture.needsUpdate = true;
    texture.image = image;
    if (detail) {
      // texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.encoding = THREE.sRGBEncoding;
    }
  });
  return texture;
}

export default function initTextures(callback = () => {}) {
  TD.texture.manager = new THREE.LoadingManager();
  TD.texture.manager.onProgress = (item, loaded, total) => {
    console.log('TEXTURE LOADED:', item, loaded, total);
    // this gets called after any item has been loaded
  };

  TD.texture.manager.onLoad = () => {
    callback();
  };

  TD.texture.star.small = loadTexture('/public/star/star3.png', false);
  // TD.texture.star.large = loadTexture('/public/star/star.png');
  TD.texture.star.surface = loadTexture('/public/star/surface3.jpg');
  TD.texture.planet.rings = loadTexture('/public/planet/rings.png');
}
