import { TD, MISC } from '../variables';
import wait from '../3d/tools/wait';

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
    const pos = TD.camera.universe;
    const bodyType = TD.camera.orbit ? TD.camera.orbit.type : '';
    let bodyScale = bodyType === 'star' && 1000;
    bodyScale = bodyScale || (bodyType === 'planet' && 100000);
    bodyScale = bodyScale || (bodyType === 'moon' && 100000);
    bodyScale = bodyScale || 1.0;
    const toSystemCoord = (coor) =>
      Math.floor((coor / TD.scale) * bodyScale * 100) / 100;
    const system = {
      x: toSystemCoord(TD.camera.object.position.x),
      y: toSystemCoord(TD.camera.object.position.y),
      z: toSystemCoord(TD.camera.object.position.z),
    };
    wait('debug').then(() => {
      this.view.innerHTML = `
        <div>FPS:<span>${this.fps}</span></div>
        <div>Objects:<span>${Debug.meshes}</span></div>
        <div>Coordinate:<span>${TD.camera.coordinate.x || 0}, ${
        TD.camera.coordinate.y || 0
      }, ${TD.camera.coordinate.z || 0}</span></div>
        <div>Position:<span>${Math.floor((pos.x / TD.scale) * 100) / 100}, ${
        Math.floor((pos.y / TD.scale) * 100) / 100
      }, ${Math.floor((pos.z / TD.scale) * 100) / 100}</span></div>
      ${
        bodyType &&
        `<div>Position ${bodyType}:<span>${system.x}, ${system.y}, ${system.z}</span></div>`
      }
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
