import { TD } from '../../variables';

export default function initEvents() {
	window.onbeforeunload = () => {
		localStorage.setItem('camera', JSON.stringify({
			position: TD.camera.object.position,
			rotation: TD.camera.object.rotation
		}));
	};
}
