import { TD, EVENT } from '../variables';
import drawStars, { getStar } from './bodies/stars';
import { getPlanets } from './bodies/planets';

function render() {
	TD.renderer.render(TD.scene, TD.camera.object);
}

export default function animate() {
	requestAnimationFrame(animate);
	drawStars();
	getStar();
	getPlanets();
	EVENT.controls.update(TD.clock.getDelta());
	render();
};
