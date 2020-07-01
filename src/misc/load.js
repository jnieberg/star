import { MISC } from '../variables';

export default function load(file, callback) {
	if (!MISC.loading) {
		MISC.loading = true;
		const client = new XMLHttpRequest();
		client.open('GET', file);
		client.onload = function() {
			callback(client.responseText);
			MISC.loading = false;
		};
		client.send();
	}
}
