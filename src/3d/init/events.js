import { saveStorage } from '../init/init';
import { TD } from '../../variables';
import { getMouse, getKeys } from './controls';

export default function initEvents() {
	window.onbeforeunload = () => {
		saveStorage();
	};

	window.addEventListener('resize', () => {
		TD.camera.object.aspect = window.innerWidth / window.innerHeight;
		TD.camera.object.updateProjectionMatrix();
		TD.renderer.setSize(window.innerWidth, window.innerHeight);
	}, false);

	window.addEventListener('mousemove', getMouse, false);
	window.addEventListener('keypress', getKeys, false);
	window.dispatchEvent(new MouseEvent('mousemove'));
}
