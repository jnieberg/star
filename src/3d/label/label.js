import { TD, EVENT } from '../../variables';

export function eventLabel() {
	if (TD.label && TD.label.visible) {
		const margin = 5;
		const x = EVENT.mouse2d.x + TD.label.offsetWidth > TD.canvas.width - margin ?
			TD.canvas.width - TD.label.offsetWidth - margin :
			EVENT.mouse2d.x < margin ?
				margin :
				EVENT.mouse2d.x;
		const y = EVENT.mouse2d.y + TD.label.offsetHeight > TD.canvas.height - margin ?
			TD.canvas.height - TD.label.offsetHeight - margin :
			EVENT.mouse2d.y < margin ?
				margin :
				EVENT.mouse2d.y;
		TD.label.style.left = `${x}px`;
		TD.label.style.top = `${y}px`;
	}
}

export function labelShow(id) {
	if (TD.label) {
		TD.label.style.opacity = 1;
		TD.label.visible = true;
	}
}

export function labelHide(id) {
	if (TD.label) {
		TD.label.style.opacity = 0;
		TD.label.visible = false;
	}
}

export default function setLabel(id, text) {
	if (!TD.label || text !== TD.label.text) {
		// if (TD.label) {
		// 	TD.label.remove();
		// 	TD.label = undefined;
		// }
		if (text) {
			if (text && text.length) {
				if (!TD.label) {
					TD.label = document.createElement('div');
					TD.label.id = 'label';
					TD.label.classList.add('label');
					document.querySelector('#root').appendChild(TD.label);
				}
				TD.label.text = text;
				TD.label.innerHTML = String(text);
			}
		}
	}
}
