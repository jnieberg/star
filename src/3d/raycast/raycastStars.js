import { EVENT, TD } from '../../variables';
import setLabel, { hideLabel, showLabel } from '../label/label';
import drawStar, { getStarInfo, getStarInfoString } from '../bodies/star/star';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';

function raycastStarsEvents(intersect, stars) {
	const distanceNear = 0.1;
	const index = intersect.index;
	if (index) {
		const star = stars[index];

		if (star && (!TD.star.this || TD.star.this.id !== star.id)) {
			if (TD.star.this && TD.star.this.id !== star.id) {
				EVENT.controls.speedFactorPlanet = 1.0;
			}
			TD.star.this = getStarInfo(star);
			const starInfo = getStarInfoString(TD.star.this);
			setLabel('stars', starInfo);
			setLabel('star', starInfo);
			hideLabel('star');
			drawStar(TD.star.this);
		}
	}
	if (intersect.distance <= distanceNear * TD.scale) {
		hideLabel('stars');
		return false;
	}
	showLabel('stars');
	return true;
}

export default function raycastStars(starsO) {
	let result = false;
	if (starsO && starsO.object) {
		const distance = 10;
		const intersect = raycastFound(starsO.object, distance, 0.2);
		if (intersect) {
			result = raycastStarsEvents(intersect, starsO.this);
		} else if (TD.star && TD.star.this && TD.label.stars && TD.label.stars.visible) {
			result = false;
		// hideLabel('stars');
		}
		if (TD.star && TD.star.this) {
			const distanceCam = distanceToCamera(TD.star.this.x, TD.star.this.y, TD.star.this.z);
			if (distanceCam >= distance) {
				TD.star.this = undefined;
				EVENT.controls.speedFactorStar = 1.0;
			} else {
				EVENT.controls.speedFactorStar = distanceCam / (distance * 2);
			}
		}
	}
	return result;
}
