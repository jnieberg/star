import * as THREE from 'three';
import { TD, EVENT } from '../../variables';
import { deleteThree } from '../init/init';
import { to3DCoordinate } from '../init/controls';

export function eventLabel() {
	for (const [ key, label ] of Object.entries(TD.label)) {
		if (label && label.visible) {
			const vector = to3DCoordinate(EVENT.mouse.x, EVENT.mouse.y);
			label.position.set(vector.x, vector.y, vector.z);
		}
	}
}

export function showLabel(id) {
	if (TD.label[id]) {
		TD.label[id].visible = true;
	}
}

export function hideLabel(id) {
	if (TD.label[id]) {
		TD.label[id].visible = false;
	}
}

export default function setLabel(id, textA) {
	if (!TD.label[id] || textA !== TD.label[id].text) {
		deleteThree(TD.label[id]);
		TD.label[id] = undefined;
		if (textA) {
			const text = textA.filter(txt => typeof txt !== 'undefined');
			if (text && text.length) {
				const fontSize = [ 16, 12 ];
				const borderSize = 10;
				const ctx = document.createElement('canvas').getContext('2d');
				let textWidth = 0;
				let font = undefined;
				text.forEach((t, index) => {
					font = `${index === 0 ? fontSize[0] : fontSize[1]}px Verdana`;
					ctx.font = font;
					textWidth = ctx.measureText(t).width > textWidth ? ctx.measureText(t).width : textWidth;
				});

				const width = textWidth + borderSize * 2;
				const height = (fontSize[0] + fontSize[1] * text.length - 1) + borderSize;
				const offsetX = width;
				const offsetY = height;
				ctx.canvas.width = offsetX + width;
				ctx.canvas.height = offsetY + height;

				const line = 1;
				ctx.lineWidth = line;
				ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
				ctx.fillRect(offsetX + line * 0.5, offsetY + line * 0.5, width - line * 1.5, height - line * 1.5);

				ctx.strokeStyle = 'white';
				ctx.strokeRect(offsetX + line * 0.5, offsetY + line * 0.5, width - line * 1.5, height - line * 1.5);


				ctx.scale(1, 1);
				ctx.fillStyle = 'white';
				ctx.textBaseline = 'top';
				ctx.textAlign = 'left';
				ctx.translate(borderSize + offsetX, borderSize + offsetY);
				for (let index = 0; index < text.length; index++) {
					const size = index === 0 ? fontSize[0] : fontSize[1];
					font = `${size}px Verdana`;
					ctx.font = font;
					ctx.fillText(text[index], 0, 0);// , offset, (index === 1 ? fontSize[0] + 4 : index > 1 ? fontSize[0] + 4 + (index - 1) * fontSize[1] : 0));
					ctx.translate(0, size);
				}

				const texture = new THREE.CanvasTexture(ctx.canvas);
				texture.minFilter = THREE.LinearFilter;
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				const labelMaterial = new THREE.SpriteMaterial({
					map: texture,
					depthTest: false,
					transparent: true,
					sizeAttenuation: false
				});
				TD.label[id] = new THREE.Sprite(labelMaterial);
				TD.label[id].scale.set(0.0012 * (offsetX + width), 0.0012 * (offsetY + height));
				TD.label[id].renderOrder = 999;
				TD.label[id].onBeforeRender = renderer => renderer.clearDepth();
				TD.label[id].text = textA;
				TD.camera.object.add(TD.label[id]);
			}
		}
	}
}
