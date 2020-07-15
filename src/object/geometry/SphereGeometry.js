import * as THREE from 'three';

export default class SphereGeometry {
	constructor(size = 1, segments = 64) {
		const geometry = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments);
		for (const vertex of geometry.vertices) {
  		vertex.normalize().multiplyScalar(size);
  	}
  	geometry.computeVertexNormals();
  	geometry.computeFaceNormals();
  	geometry.computeMorphNormals();
  	geometry.computeBoundingSphere();
  	geometry.computeBoundingBox();
  	geometry.verticesNeedUpdate = true;
  	geometry.elementsNeedUpdate = true;
  	geometry.uvsNeedUpdate = true;
  	geometry.normalsNeedUpdate = true;
  	geometry.colorsNeedUpdate = true;
  	geometry.lineDistancesNeedUpdate = true;
		geometry.groupsNeedUpdate = true;
		const newGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
		geometry.dispose();
		return newGeometry;
	}
}
