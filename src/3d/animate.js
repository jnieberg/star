import { TD, EVENT, MISC } from '../variables';
import drawStars, { getStars, eventStars } from './bodies/star/stars';
import { getPlanets, eventPlanets } from './bodies/planet/planets';
import { eventLabel } from './label/label';
import { getStar } from './bodies/star/stars';

export function render() {
	TD.renderer.render(TD.scene, TD.camera.object);
}

export function loop() {
	EVENT.controls.update(TD.clock.getDelta());
	eventStars();
	eventLabel();
}

export function interval() {
	setInterval(() => {
		drawStars();
		getStars();
		getStar();
		getPlanets();
	}, 100);
}

export default function animate() {
	loop();
	MISC.animation = requestAnimationFrame(animate);
	render();
};
