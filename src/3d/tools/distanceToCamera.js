import { TD } from '../../variables';

export default function distanceToCamera(x, y, z) {
	const pos = TD.camera.object.position;
	return Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y) + (z - pos.z) * (z - pos.z)) / TD.scale;
}
