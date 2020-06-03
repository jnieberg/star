import { TD, EVENT } from '../variables';
import drawStars, { getStar } from './bodies/stars';
import { getPlanets } from './bodies/planet';
import { eventLabel } from './label/label';

function render() {
	TD.renderer.render(TD.scene, TD.camera.object);
}

export function loop() {
	setInterval(() => {
		drawStars();
		getStar();
		getPlanets();
	}, 100);
}

export default function animate() {
	EVENT.controls.update(TD.clock.getDelta());
	eventLabel();
	requestAnimationFrame(animate);
	render();
};
