import * as THREE from "three";
import { TD } from "../../variables";

export default function initCamera() {
	TD.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, TD.cameraNear, 200);
}
