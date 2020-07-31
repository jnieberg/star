import * as THREE from 'three';

export default class SphereGeometry {
	constructor(size = 1, segments = 64) {
		const geometry = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments);
		for (const vertex of geometry.vertices) {
  		vertex.normalize().multiplyScalar(size);
  	}
		const newGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
		geometry.dispose();
  	newGeometry.computeVertexNormals();
  	newGeometry.computeFaceNormals();
  	// newGeometry.computeMorphNormals();
  	newGeometry.computeBoundingSphere();
  	newGeometry.computeBoundingBox();
  	newGeometry.verticesNeedUpdate = true;
  	newGeometry.elementsNeedUpdate = true;
  	newGeometry.uvsNeedUpdate = true;
  	newGeometry.normalsNeedUpdate = true;
  	newGeometry.colorsNeedUpdate = true;
  	newGeometry.lineDistancesNeedUpdate = true;
		newGeometry.groupsNeedUpdate = true;
		return newGeometry;
	}
}