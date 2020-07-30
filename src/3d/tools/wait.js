import { MISC } from '../../variables';

export default function wait(timerBank, callback = () => {}, interrupt = false) {
	if (interrupt && MISC.timers[timerBank]) {
		console.log('TIMEOUT INTERRUPT');
		for (let i = 0; i < MISC.timers[timerBank].length; i++) {
			clearTimeout(MISC.timers[timerBank][i]);
		}
		MISC.timers[timerBank] = [];
	}
	if (!MISC.timers[timerBank]) {
		MISC.timers[timerBank] = [];
	}
	((index) => {
		const timer = setTimeout(() => {
			MISC.timers[timerBank].splice(index, 1);
			callback();
		});
		MISC.timers[timerBank].push(timer);
	})(MISC.timers[timerBank].length - 1);
}
