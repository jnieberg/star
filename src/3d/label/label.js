import { TD, EVENT } from '../../variables';

export function eventLabel() {
  if (TD.label && TD.label.visible) {
    const { width, height } = TD.canvas.getBoundingClientRect();
    const margin = 5;
    let x = EVENT.mouse2d.x + TD.label.offsetWidth > width - margin
      && width - TD.label.offsetWidth - margin;
    x = x || (EVENT.mouse2d.x < margin && margin);
    x = x || EVENT.mouse2d.x;
    let y = EVENT.mouse2d.y + TD.label.offsetHeight > height - margin
      && height - TD.label.offsetHeight - margin;
    y = y || (EVENT.mouse2d.y < margin && margin);
    y = y || EVENT.mouse2d.y;
    TD.label.style.left = `${x}px`;
    TD.label.style.top = `${y}px`;
  }
}

export function labelShow() {
  if (TD.label) {
    TD.label.style.opacity = 1;
    TD.label.visible = true;
  }
}

export function labelHide() {
  if (TD.label) {
    TD.label.style.opacity = 0;
    TD.label.visible = false;
  }
}

export default function setLabel(text) {
  if (!TD.label || text !== TD.label.text) {
    if (text) {
      if (text && text.length) {
        if (!TD.label) {
          TD.label = document.createElement('div');
          TD.label.id = 'label';
          TD.label.classList.add('label');
          document.body.appendChild(TD.label);
        }
        TD.label.text = text;
        TD.label.innerHTML = String(text);
      }
    }
  }
}
