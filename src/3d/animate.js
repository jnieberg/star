import { TD, EVENT } from '../variables';
import drawStars, { getStar } from './bodies/stars';
import { getPlanets } from './bodies/planets';

function render() {
	drawStars();
	getStar();
	getPlanets();
	EVENT.controls.update(TD.clock.getDelta());
	TD.renderer.render(TD.scene, TD.camera.object);
}

export default function animate() {
	requestAnimationFrame(animate);
	render();
};
