import { TD, EVENT } from '../variables';
import drawStars, { getStars } from './bodies/stars';
import { getPlanets } from './bodies/planets';
import { eventLabel } from './label/label';
import { getStar } from './bodies/star';

function render() {
	TD.renderer.render(TD.scene, TD.camera.object);
}

export function loop() {
	setInterval(() => {
		drawStars();
		getStar();
		getStars();
		getPlanets();
	}, 100);
}

export default function animate() {
	EVENT.controls.update(TD.clock.getDelta());
	eventLabel();
	requestAnimationFrame(animate);
	render();
};
