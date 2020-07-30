import { TD } from '../variables';

export function toSize(size) {
	return `${Math.round(size * 1000000).toLocaleString('en-US')}km`;
}
