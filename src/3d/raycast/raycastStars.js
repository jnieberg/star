import { EVENT, TD } from '../../variables';
import setLabel, { labelHide, labelShow } from '../label/label';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';

function raycastStarsEvents(intersect) {
	const distanceNear = 0.1;
	const tag = intersect.object.name;
	const id = intersect.index;
	if (TD.stars[tag] && TD.stars[tag].this && id) {
		const star = TD.stars[tag].this[id];
		if (star && (!TD.star || TD.star.id !== star.id)) {
			if (TD.star && TD.star.id !== star.id) {
				EVENT.controls.speedFactorPlanet = 1.0;
			}
			TD.star = star;
			TD.star.getChildren();
			const starInfo = TD.star.text;
			setLabel('stars', starInfo);
			setLabel('star', starInfo);
			labelHide('star');
			TD.star.draw();
		}
	}
	if (intersect.distance <= distanceNear * TD.scale) {
		labelHide('stars');
		return false;
	}
	labelShow('stars');
	return true;
}

export default function raycastStars() {
	let result = false;
	// if (stars) {
	const distance = 10;
	const obj = Object.values(TD.stars).map(star => star.object);
	const intersect = raycastFound(obj, distance, 0.1);
	if (intersect && intersect.object && intersect.object.name) {
		result = raycastStarsEvents(intersect); // , stars.this
	} else if (TD.star && TD.label.stars && TD.label.stars.visible) {
		result = false;
		// hideLabel('stars');
	}
	if (TD.star) {
		const distanceCam = distanceToCamera(TD.star.position.x, TD.star.position.y, TD.star.position.z);
		if (distanceCam >= distance) {
			TD.star = undefined;
			TD.planet = undefined;
			EVENT.controls.speedFactorStar = 1.0;
		} else {
			EVENT.controls.speedFactorStar = distanceCam / (distance * 2);
		}
	}
	// }
	return result;
}
