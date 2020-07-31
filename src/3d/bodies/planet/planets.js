import { TD } from '../../../variables';
import raycastPlanet from '../../raycast/raycastPlanet';

export function getPlanets() {
	if (TD.star && TD.star.children) {
		const children = [
			TD.star.children,
			TD.star.children.map(child => child.children)
		].flat(Infinity).filter(child => child.object.low);
		raycastPlanet(children);
	}
}

