import { TD } from '../../variables';

export default function distanceToCamera(x, y, z) {
	const cx = TD.camera.object.position.x;
	const cy = TD.camera.object.position.y;
	const cz = TD.camera.object.position.z;
	const distance = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz));
	return distance;
}
