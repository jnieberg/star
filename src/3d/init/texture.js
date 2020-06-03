import { TD } from '../../variables';
import * as THREE from 'three';

export default function initTextures() {
	TD.texture.stars = new THREE.TextureLoader().load('/sun.png');
	TD.texture.star = new THREE.TextureLoader().load('/sun.png');
	TD.texture.ring = new THREE.TextureLoader().load('/ring.png');
}
