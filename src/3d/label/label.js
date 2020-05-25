import * as THREE from 'three';
import { TD } from "../../variables";
import { deleteThree } from '../init/init';

export default function setLabel(text) {
    deleteThree(TD.label);
    if (text && text.length) {
        const fontSize = [16, 12];
        const borderSize = 10;
        const ctx = document.createElement('canvas').getContext('2d');
        let textWidth = 0;
        let font;
        text.forEach((t, index) => {
            font = `${index === 0 ? fontSize[0] : fontSize[1]}px Verdana`;
            ctx.font = font
            textWidth = ctx.measureText(t).width > textWidth ? ctx.measureText(t).width : textWidth
        });
        const offset = textWidth + borderSize + 32;

        const width = textWidth + borderSize * 2;
        const height = (fontSize[0] + fontSize[1] * text.length - 1) + borderSize;
        ctx.canvas.width = offset + width;
        ctx.canvas.height = height;

        const line = 1;
        ctx.lineWidth = line;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(offset + line * 0.5, line * 0.5, width - line * 1.5, height - line * 1.5);

        ctx.strokeStyle = 'white';
        ctx.strokeRect(offset + line * 0.5, line * 0.5, width - line * 1.5, height - line * 1.5);


        ctx.scale(1, 1);
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.translate(borderSize + offset, borderSize);
        for (let index = 0; index < text.length; index++) {
            var size = index === 0 ? fontSize[0] : fontSize[1];
            font = `${size}px Verdana`;
            ctx.font = font;
            ctx.fillText(text[index], 0, 0);//, offset, (index === 1 ? fontSize[0] + 4 : index > 1 ? fontSize[0] + 4 + (index - 1) * fontSize[1] : 0));
            ctx.translate(0, size);
        }

        const texture = new THREE.CanvasTexture(ctx.canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        const labelMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        TD.label = new THREE.Sprite(labelMaterial);
        TD.label.scale.set(0.0015 * (offset + width), 0.0015 * height);
        TD.label.material.sizeAttenuation = false;
        TD.label.material.depthTest = false;
        TD.scene.add(TD.label);
    }
}