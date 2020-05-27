import { EVENT, TD } from '../variables';
import setLabel from './label/label';
import drawStar, { getStarInfoString, getStarInfo } from './bodies/star';

function distanceToCamera(x, y, z) {
	const cx = TD.camera.object.position.x;
	const cy = TD.camera.object.position.y;
	const cz = TD.camera.object.position.z;
	const distance = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz));
	return distance;
}

function raycastEvents(intersect) {
	const index = intersect.index;
	const star = TD.stars.list[index];
	if (star && (!TD.star.this || TD.star.this.id !== star.id || !TD.star.label)) {
		const pos = TD.stars.positions;
		TD.star.this = getStarInfo(star);
		setLabel(getStarInfoString(TD.star.this));
		drawStar();
		TD.star.label.position.set(pos[index * 3], pos[index * 3 + 1], pos[index * 3 + 2]);
	} else {
		// console.log(intersect, index);
	}
}

export default function raycast(obj) {
	if (obj) {
		TD.raycaster.setFromCamera(EVENT.mouse, TD.camera.object);
		const intersects = TD.raycaster.intersectObject(obj, true);
		if (intersects.length > 0 && intersects[0].index && intersects[0].distance < 10 * TD.scale) { // && intersects[0].distance > TD.camera.near * TD.scale
			raycastEvents(intersects[0]);
		} else if (TD.star.label) {
			setLabel();
			TD.star.label = undefined;
		}
		if (TD.star.this) {
			const starDistance = distanceToCamera(TD.star.this.x * 100 * TD.scale, TD.star.this.y * 100 * TD.scale, TD.star.this.z * 100 * TD.scale);
			if (starDistance >= 10 * TD.scale) {
				TD.star = undefined;
				EVENT.controls.speedFactor = 1;
			} else {
				EVENT.controls.speedFactor = starDistance / (20 * TD.scale); // starDistance > TD.camera.near * TD.scale ? starDistance / (20 * TD.scale) : 1;
			}
		}
	}
}
