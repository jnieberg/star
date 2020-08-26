import * as THREE from 'three';
import Word from '../../../misc/Word';
import { TD, MISC } from '../../../variables';
import deleteThree from '../../tools/delete';
import Random from '../../../misc/Random';
import Star from './Star';
import { toSizeString } from '../../../misc/size';
import { getColor } from '../../../misc/color';

export default class System {
  constructor({
    index, x, y, z,
  }) {
    this.coordinate = { x, y, z };
    this.type = 'system';
    this.index = index;
    this.id = {
      text: `X:${this.coordinate.x}, Y:${this.coordinate.y}, Z:${this.coordinate.z}, I:${this.index}`,
      toString: () => `${this.coordinate.x}.${this.coordinate.y}.${this.coordinate.z}:${this.index}`,
    };
    this.random = new Random(`system_${this.id}`);
    this.object = {
      low: undefined,
      high: undefined,
    };
  }

  get name() {
    if (!this._name) {
      this.random.seed = 'name';
      this._name = new Word(this.random, {
        syllablesMin: 3,
        syllablesMax: 7,
      });
    }
    return this._name;
  }

  get position() {
    if (!this._position) {
      this.random.seed = 'position';
      this._position = {
        x: this.random.rnd(TD.stargrid.size),
        y: this.random.rnd(TD.stargrid.size),
        z: this.random.rnd(TD.stargrid.size),
      };
    }
    return this._position;
  }

  get universe() {
    return {
      x: (this.position.x + this.coordinate.x * TD.stargrid.size) * TD.scale, // absolute
      y: (this.position.y + this.coordinate.y * TD.stargrid.size) * TD.scale,
      z: (this.position.z + this.coordinate.z * TD.stargrid.size) * TD.scale,
      xr: (
        this.position.x + (this.coordinate.x - TD.camera.coordinate.x) * TD.stargrid.size
      ) * TD.scale, // relative
      yr: (
        this.position.y + (this.coordinate.y - TD.camera.coordinate.y) * TD.stargrid.size
      ) * TD.scale,
      zr: (
        this.position.z + (this.coordinate.z - TD.camera.coordinate.z) * TD.stargrid.size
      ) * TD.scale,
    };
  }

  get size() {
    if (!this._size) {
      this.random.seed = 'size';
      const size = this.random.rnd(0.3, 15);
      this._size = {
        valueOf: () => size,
        text: toSizeString(size),
      };
    }
    return this._size;
  }

  get color() {
    if (!this._color) {
      this.random.seed = 'color';
      const hue = this.random.rnd();
      const lightness = this.random.rnd(0.1, 1.0);
      this._color = getColor({ hue, lightness });
    }
    return this._color;
  }

  get starDistance() {
    if (this.children.length > 1) {
      return this.random.rnd(0.005, 0.01);
    }
    return 0;
  }

  get children() {
    if (!this._children) {
      this.random.seed = 'stars';
      const children = [];
      do {
        children.push(
          new Star({
            system: this,
            index: children.length,
          }),
        );
      } while (this.random.rndInt(15) === 0); // chance on multinary stars
      this._children = children;
    }
    return this._children;
  }

  getAllChildren(root = this) {
    let bodies = [];
    if (root && root.children) {
      const obj = root.children;
      bodies = [
        obj,
        ...root.children.map((child) => this.getAllChildren(child)),
      ];
    }
    return bodies.flat(Infinity).filter((body) => body);
  }

  get text() {
    return `
    <div class="label--h1">${this.name}</div>
    <div class="label--h2">${this.children.length > 1 ? 'Multinary system' : 'System'} #${this.id}</div>
    <div class="label--h3">Stars<span>Bodies</span></div>
    <ol>
      ${this.children.map((star) => `<li>${star.textShort}</li>`).join('\n')}
    </ol>`;
  }

  // temperature + size?
  get rotationSpeedAroundAxis() {
    if (this.children.length > 1) {
      let temperature = 0;
      this.children.forEach((child) => {
        temperature += child.temperature.min;
      });
      this.random.seed = 'rotation_speed';
      return (this.random.rndInt(2) === 0 ? -1 : 1)
        * this.random.rnd(temperature * 0.00002, temperature * 0.00004);
    }
    return 0;
  }

  update() {
    if (this.object && this.object.rotation) {
      this.object.rotateY(this.rotationSpeedAroundAxis * MISC.time);
    }
    this.children.forEach((child) => {
      child.update();
    });
  }

  hideChildren() {
    this.children.forEach((child) => child.hideChildren());
  }

  updateShadows() {
    this.children.forEach((child) => {
      // eslint-disable-next-line no-param-reassign
      child.light.shadow.needsUpdate = true;
    });
  }

  // Draw all stars and bodies here
  draw() {
    this.random.seed = 'rotation';
    this.object = new THREE.Object3D();
    this.object.position.set(
      this.position.x * TD.scale,
      this.position.y * TD.scale,
      this.position.z * TD.scale,
    );
    this.object.rotation.set(
      this.random.rnd(2 * Math.PI),
      this.random.rnd(2 * Math.PI),
      this.random.rnd(2 * Math.PI),
    );
    this.children.forEach((child) => child.drawHigh());
    TD.scene.add(this.object);
  }

  remove() {
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    delete this;
  }
}
