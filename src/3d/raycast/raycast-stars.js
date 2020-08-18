import { EVENT, TD } from '../../variables';
import setLabel, { labelShow } from '../label/label';
import { distanceToCamera, fixObjectToCamera } from '../init/camera';
import raycastFound from './raycast-found';
import { deleteThree } from '../init/init';

function raycastStarsEvents(intersect) {
	const distanceFar = 10;
	const distanceNear = 0.1;
	const tag = intersect.object.name;
	const id = intersect.index;
	let system = undefined;
	if (TD.stars[tag] && TD.stars[tag].this && id) {
		system = TD.stars[tag].this[id].system;
	}
	if (system) {
		if (intersect.distance / TD.scale < distanceFar) {
			if (!TD.system || TD.system.id !== system.id) {
				deleteThree(TD.system && TD.system.object);
				TD.system = system;
				TD.system.draw();
				const starInfo = TD.system.text;
				setLabel(starInfo);
				console.log(TD.system);
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
	if (TD.system && TD.system.object) {
		fixObjectToCamera(TD.system.object);
		const distanceCam = distanceToCamera(TD.system.object.position.x, TD.system.object.position.y, TD.system.object.position.z);
		if (distanceCam >= distance) {
			TD.system.remove();
			TD.system = undefined;
			TD.star = undefined;
			TD.planet = undefined;
			TD.moon = undefined;
			EVENT.controls.speedFactorStar = 1.0;
			EVENT.controls.speedFactorPlanet = 1.0;
			return false;
		}
		EVENT.controls.speedFactorStar = distanceCam / (distance * 2) < 1.0 ? distanceCam / (distance * 2) : 1.0;
	}
	const obj = Object.values(TD.stars).map(star => star.object);
	const intersect = raycastFound(obj, distance, 0.1);
	if (intersect && intersect.object && intersect.object.name) {
		return raycastStarsEvents(intersect);
	}
	return false;
}
