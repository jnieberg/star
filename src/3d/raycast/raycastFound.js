import { TD, EVENT } from '../../variables';

export default function raycastFound(obj, distance, radius) {
	if (obj) {
		TD.raycaster.params.Points.threshold = radius * TD.scale;
		TD.raycaster.setFromCamera(EVENT.mouse, TD.camera.object);
		let intersects = [];
		if (obj.length) {
			intersects = TD.raycaster.intersectObjects(obj, true);
		} else if (obj.layers) {
			intersects = TD.raycaster.intersectObject(obj, true);
		}
		if (intersects.length > 0 && intersects[0].distance < distance * TD.scale) { // intersects[0].index &&
			return intersects[0];
		}
	}
	return null;
}
