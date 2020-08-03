import { EVENT, TD } from '../../variables';
import setLabel, { labelShow } from '../label/label';
import distanceToCamera from '../tools/distanceToCamera';
import raycastFound from './raycastFound';
import * as THREE from 'three';

function raycastStarsEvents(intersect) {
	const distanceFar = 10;
	const distanceNear = 0.1;
	const tag = intersect.object.name;
	const id = intersect.index;
	let star = undefined;
	if (TD.stars[tag] && TD.stars[tag].this && id) {
		star = TD.stars[tag].this[id];
	}
	if (star) {
		if (intersect.distance / TD.scale < distanceFar) {
			if (!TD.star || TD.star.id !== star.id) {
				TD.star = star;
				TD.star.getChildren();
				TD.star.draw();
				const starInfo = TD.star.text;
				setLabel(starInfo);
			}
		}
		if (intersect.distance > distanceNear * TD.scale) {
			labelShow();
			return true;
		}
		return false;
	}
}

export default function raycastStars() {
	const distance = 10;
	if (TD.star && TD.star.object && TD.star.object.matrixWorld) {
		const distanceCam = distanceToCamera(TD.star.universe.x, TD.star.universe.y, TD.star.universe.z);
		EVENT.controls.speedFactorStar = distanceCam / (distance * 2);
		if (distanceCam >= distance) {
			TD.star = undefined;
			TD.planet = undefined;
			EVENT.controls.speedFactorStar = 1.0;
			return false;
		}
	}
	const obj = Object.values(TD.stars).map(star => star.object);
	const intersect = raycastFound(obj, distance, 0.1);
	if (intersect && intersect.object && intersect.object.name) {
		return raycastStarsEvents(intersect);
	}
	return false;
}
