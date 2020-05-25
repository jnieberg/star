import { TD, EVENT } from "../variables";
import drawStar from "./bodies/star";
import drawStars from "./bodies/stars";
import raycast from "./raycaster";

export default function animate() {
	requestAnimationFrame(animate);
	render();
	drawStars();
};

function render() {
	raycast(TD.stars.object);
	EVENT.controls.update(TD.clock.getDelta());
	TD.renderer.render(TD.scene, TD.camera);
}