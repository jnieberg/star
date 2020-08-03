import { TD, EVENT, MISC } from '../variables';
import drawStars, { eventStars } from './bodies/star/stars';
import { eventLabel, labelHide } from './label/label';
import raycastStars from './raycast/raycastStars';
import raycastBody from './raycast/raycastPlanets';

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
		let keepLabel = raycastStars();
		keepLabel = raycastBody() || keepLabel;
		if (!keepLabel && TD.label && TD.label.visible) {
			labelHide();
		}
	}, 100);
}

export default function animate() {
	loop();
	MISC.animation = requestAnimationFrame(animate);
	render();
};
