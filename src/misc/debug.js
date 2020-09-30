import { TD, MISC } from '../variables';
import wait from '../3d/tools/wait';
import { getWorldCamera } from '../3d/init/camera';

export default class Debug {
  constructor() {
    this.view = document.createElement('div');
    this.view.id = 'debug';
    document.body.appendChild(this.view);
    this.frames = 0;
    this.framesList = [];
  }

  get fps() {
    this.framesList.push(this.frames);
    this.frames = 0;
    if (this.framesList.length > 1000 / MISC.interval) {
      this.framesList.shift();
    }
    return (
      this.framesList.reduce((a, b) => a + b, 0) *
      (1000 / MISC.interval - this.framesList.length + 1)
    );
  }

  update() {
    const pos = getWorldCamera();
    wait('debug', () => {
      this.view.innerHTML = `
        <div>FPS:<span>${this.fps}</span></div>
        <div>Objects:<span>${Debug.meshes}</span></div>
        <div>Coordinate:<span>${TD.camera.coordinate.x || 0}, ${
        TD.camera.coordinate.y || 0
      }, ${TD.camera.coordinate.z || 0}</span></div>
        <div>Position:<span>${Math.floor(pos.x / TD.scale)}, ${Math.floor(
        pos.y / TD.scale
      )}, ${Math.floor(pos.z / TD.scale)}</span></div>
    `;
    });
  }

  static get meshes() {
    let number = 0;
    TD.scene.traverse(() => {
      number += 1;
    });
    return number;
  }
}
