import { TD, MISC } from '../../../variables';
import setColor from '../../../misc/color';
import Star from './Star';
import random from '../../../misc/random';
import { deleteThree } from '../../init/init';

function createStar({ x, y, z, index }) {
	const star = new Star({ x, y, z, index });
	const pos = star.universe;
	setColor(1, Number(star.color.hue), 1.0, Number(star.color.brightness), 'hsl');
	TD.stars[`${x}_${y}_${z}`].this.push(star);
	TD.stars[`${x}_${y}_${z}`].positions.push(pos.x, pos.y, pos.z);
	TD.stars[`${x}_${y}_${z}`].colors.push(MISC.colorHelper.r, MISC.colorHelper.g, MISC.colorHelper.b);
	TD.stars[`${x}_${y}_${z}`].sizes.push(star.size * 0.5 * TD.scale);
}

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
	let count = (TD.stargrid.radius * 2 + 1);
	count = count * count * count;
	const content = TD.stargrid.size * TD.stargrid.size * TD.stargrid.size;
	for (let z = posz - TD.stargrid.radius; z <= posz + TD.stargrid.radius; z++) {
		for (let y = posy - TD.stargrid.radius; y <= posy + TD.stargrid.radius; y++) {
			for (let x = posx - TD.stargrid.radius; x <= posx + TD.stargrid.radius; x++) {
				if (!TD.stars[`${x}_${y}_${z}`]) {
					TD.stars[`${x}_${y}_${z}`] = {
						x, y, z,
						this: [],
						positions: [],
						colors: [],
						sizes: []
					};
					MISC.rnd = random(`stars_${x}_${y}_${z}`);
					const quantity = Math.floor(MISC.rnd() * TD.stargrid.density * content) + TD.stargrid.density * content;
					for (let index = 0; index < quantity; index++) {
						createStar({ x, y, z, index });
					}
				}
				if (--count === 0) {
					callback();
				}
			}
		}
	}
	deleteStarsOutsideRange({ posx, posy, posz });
}
