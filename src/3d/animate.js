import { TD, EVENT } from '../variables';
import drawStars from './bodies/stars';
import raycast from './raycaster';
import { updatePlanets } from './bodies/planets';

function render() {
	raycast(TD.stars.object);
	EVENT.controls.update(TD.clock.getDelta());
	TD.renderer.render(TD.scene, TD.camera.object);
}

export default function animate() {
	requestAnimationFrame(animate);
	render();
	drawStars();
	updatePlanets();
};
