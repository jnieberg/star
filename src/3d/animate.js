import { TD, EVENT } from '../variables';
import drawStars, { getStars } from './bodies/stars';
import { getPlanets, eventPlanets } from './bodies/planets';
import { eventLabel } from './label/label';
import { getStar } from './bodies/star';
import { eventCamera } from './init/camera';

function render() {
	TD.renderer.render(TD.scene, TD.camera.object);
}

export function loop() {
	EVENT.controls.update(TD.clock.getDelta());
	eventCamera();
	eventPlanets();
	eventLabel();
}

export function interval() {
	 setInterval(() => {
		drawStars();
		getStar();
		getStars();
		getPlanets();
	}, 100);
}

export default function animate() {
	loop();
	requestAnimationFrame(animate);
	render();
};
