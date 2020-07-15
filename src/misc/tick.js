import { render } from './../3d/animate';
import { TD } from '../variables';

export default function tick() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		});
	});
}
