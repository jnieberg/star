import { TD } from '../../../variables';
import System from './System';
import Random from '../../../misc/Random';
import { deleteThree } from '../../init/init';

function deleteStarsOutsideRange({ posx, posy, posz }) {
	for (const s in TD.stars) {
		if (TD.stars[s]) {
			const coord = s.split('_').map(c => Number(c));
			if (
				coord[0] < posx - TD.stargrid.radius || coord[0] > posx + TD.stargrid.radius ||
				coord[1] < posy - TD.stargrid.radius || coord[1] > posy + TD.stargrid.radius ||
				coord[2] < posz - TD.stargrid.radius || coord[2] > posz + TD.stargrid.radius
			) {
				deleteThree(TD.stars[s].object);
				delete TD.stars[s];
			}
		}
	}
}

export default function starList({ posx, posy, posz }, callback) {
	const random = new Random('stars');
	let count = (TD.stargrid.radius * 2 + 1);
	count = count * count * count;
	const content = TD.stargrid.size * TD.stargrid.size * TD.stargrid.size;
	for (let z = posz - TD.stargrid.radius; z <= posz + TD.stargrid.radius; z++) {
		for (let y = posy - TD.stargrid.radius; y <= posy + TD.stargrid.radius; y++) {
			for (let x = posx - TD.stargrid.radius; x <= posx + TD.stargrid.radius; x++) {
				setTimeout(() => {
					const coordString = `${x}_${y}_${z}`;
					if (!TD.stars[coordString]) {
						TD.stars[coordString] = {
							x, y, z,
							this: [],
							positions: [],
							colors: [],
							sizes: []
						};
						random.seed = coordString;
						const quantity = random.rndInt(TD.stargrid.density * content, TD.stargrid.density * content * 2);
						for (let index = 0; index < quantity; index++) {
							const _foo = new System({ x, y, z, index }).children;
						}
					}
					if (--count === 0) {
						callback();
					}
				});
			}
		}
	}
	deleteStarsOutsideRange({ posx, posy, posz });
}
