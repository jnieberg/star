import { TD } from '../../variables';

export default function distanceToCamera(x, y, z) {
	let pos = TD.camera.object.position;
	pos = {
		x: pos.x / TD.scale,
		y: pos.y / TD.scale,
		z: pos.z / TD.scale
	};
	return Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y) + (z - pos.z) * (z - pos.z));
}
