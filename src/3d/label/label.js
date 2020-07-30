import { TD, EVENT } from '../../variables';

export function eventLabel() {
	for (const label of Object.values(TD.label)) {
		if (label && label.visible) {
			const margin = 5;
			const x = EVENT.mouse2d.x + label.offsetWidth > TD.canvas.width - margin ?
				TD.canvas.width - label.offsetWidth - margin :
				EVENT.mouse2d.x < margin ?
					margin :
					EVENT.mouse2d.x;
			const y = EVENT.mouse2d.y + label.offsetHeight > TD.canvas.height - margin ?
				TD.canvas.height - label.offsetHeight - margin :
				EVENT.mouse2d.y < margin ?
					margin :
					EVENT.mouse2d.y;
			label.style.left = `${x}px`;
			label.style.top = `${y}px`;
		}
	}
}

export function labelShow(id) {
	if (TD.label[id]) {
		TD.label[id].style.opacity = 1;
		TD.label[id].visible = true;
	}
}

export function labelHide(id) {
	if (TD.label[id]) {
		TD.label[id].style.opacity = 0;
		TD.label[id].visible = false;
	}
}

export default function setLabel(id, text) {
	if (!TD.label[id] || text !== TD.label[id].text) {
		if (TD.label[id]) {
			TD.label[id].remove();
			TD.label[id] = undefined;
		}
		if (text) {
			if (text && text.length) {
				// const fontSize = [ 14, 10 ];
				// const lineHeight = 1.2;
				// const borderSize = 10;
				// const ctx = document.createElement('canvas').getContext('2d');
				// let textWidth = 0;
				// let font = undefined;
				// text.forEach((t, index) => {
				// 	font = `${index === 0 ? fontSize[0] : fontSize[1]}px Verdana`;
				// 	ctx.font = font;
				// 	textWidth = ctx.measureText(t).width > textWidth ? ctx.measureText(t).width : textWidth;
				// });

				// const width = textWidth + borderSize * 2;
				// const height = (fontSize[0] + fontSize[1] * text.length * lineHeight - 1) + borderSize;
				// const offsetX = 0;
				// const offsetY = 0;
				// ctx.canvas.id = `label-${id}`;
				// ctx.canvas.classList.add('label');
				// ctx.canvas.width = offsetX + width;
				// ctx.canvas.height = offsetY + height;

				// const line = 1;
				// ctx.lineWidth = line;
				// ctx.fillStyle = 'rgba(0, 32, 64, 0.5)';
				// ctx.fillRect(offsetX + line * 0.5, offsetY + line * 0.5, width - line * 1.5, height - line * 1.5);

				// ctx.strokeStyle = 'white';
				// ctx.strokeRect(offsetX + line * 0.5, offsetY + line * 0.5, width - line * 1.5, height - line * 1.5);

				// ctx.scale(1, 1);
				// ctx.fillStyle = 'white';
				// ctx.textBaseline = 'top';
				// ctx.textAlign = 'left';
				// ctx.translate(borderSize + offsetX, borderSize + offsetY);
				// for (let index = 0; index < text.length; index++) {
				// 	const size = index === 0 ? fontSize[0] : fontSize[1];
				// 	font = `${size}px Verdana`;
				// 	ctx.font = font;
				// 	ctx.fillText(text[index], 0, 0);// , offset, (index === 1 ? fontSize[0] + 4 : index > 1 ? fontSize[0] + 4 + (index - 1) * fontSize[1] : 0));
				// 	ctx.translate(0, size * lineHeight);
				// }
				TD.label[id] = document.createElement('div');
				TD.label[id].id = `label-${id}`;
				TD.label[id].classList.add('label');
				TD.label[id].innerHTML = String(text);
				document.querySelector('#root').appendChild(TD.label[id]);
			}
		}
	}
}
