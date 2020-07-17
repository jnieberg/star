import { MISC } from '../../variables';

export default function wait() {
	const callback = typeof arguments[0] === 'function' ? arguments[0] : typeof arguments[1] === 'function' ? arguments[1] : () => {};
	const interrupt = typeof arguments[0] === 'boolean' ? arguments[0] : typeof arguments[1] === 'boolean' ? arguments[1] : false;
	if (interrupt) {
		for (let i = 0; i < MISC.timers.length; i++) {
			clearTimeout(MISC.timers[i]);
		}
		MISC.timers = [];
	}
	MISC.timers.push(setTimeout(callback));
}
