import seedrandom from 'seedrandom';
import { TD, MISC } from '../../variables';
import setColor from '../../misc/color';

export function getStarPosition(star) {
	return {
		x: (star.x + (star.cx - TD.camera.coordinate.x) * TD.stargrid.size) * TD.scale,
		y: (star.y + (star.cy - TD.camera.coordinate.y) * TD.stargrid.size) * TD.scale,
		z: (star.z + (star.cz - TD.camera.coordinate.z) * TD.stargrid.size) * TD.scale
	};
}

export function getRealCoordinate(x, y, z) {
	return {
		x: (x - TD.camera.coordinate.x) * TD.stargrid.size * TD.scale,
		y: (y - TD.camera.coordinate.y) * TD.stargrid.size * TD.scale,
		z: (z - TD.camera.coordinate.z) * TD.stargrid.size * TD.scale
	};
}

function getStarData(cx, cy, cz, index) {
	return {
		id: `${cx}_${cy}_${cz}_${index}`,
		size: Math.pow(10, MISC.rnd() * 2 + 1) * 0.01,
		hue: MISC.rnd(),
		brightness: MISC.rnd() * 0.9 + 0.1,
		cx, cy, cz,
		x: MISC.rnd() * TD.stargrid.size,
		y: MISC.rnd() * TD.stargrid.size,
		z: MISC.rnd() * TD.stargrid.size
	};
}

function createStars(x, y, z, i) {
	const star = getStarData(x, y, z, i);
	const pos = getStarPosition(star);
	setColor(1, star.hue, 1.0, star.brightness, 'hsl');
	TD.stars[`${x}_${y}_${z}`].this.push(star);
	TD.stars[`${x}_${y}_${z}`].positions.push(pos.x, pos.y, pos.z);
	TD.stars[`${x}_${y}_${z}`].colors.push(MISC.colorHelper.r, MISC.colorHelper.g, MISC.colorHelper.b);
	TD.stars[`${x}_${y}_${z}`].sizes.push(star.size * 0.5 * TD.scale);
}

export default function starList({ posx, posy, posz }, callback) {
	let count = (TD.stargrid.radius * 2 + 1);
	count = count * count * count;
	const content = TD.stargrid.size * TD.stargrid.size * TD.stargrid.size;
	for (let z = posz - TD.stargrid.radius; z <= posz + TD.stargrid.radius; z++) {
		for (let y = posy - TD.stargrid.radius; y <= posy + TD.stargrid.radius; y++) {
			for (let x = posx - TD.stargrid.radius; x <= posx + TD.stargrid.radius; x++) {
				((x, y, z) => {
					setTimeout(() => {
						if (!TD.stars[`${x}_${y}_${z}`]) {
							TD.stars[`${x}_${y}_${z}`] = {
								x, y, z,
								this: [],
								positions: [],
								colors: [],
								sizes: []
							};
							MISC.rnd = seedrandom(`stars_${x}_${y}_${z}`);
							const quantity = Math.floor(MISC.rnd() * TD.stargrid.density * content) + TD.stargrid.density * content;
							for (let i = 0; i < quantity; i++) {
								createStars(x, y, z, i);
							}
						}
						if (--count === 0) {
							callback();
						}
					});
				})(x, y, z);
			}
		}
	}
}
