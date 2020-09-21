import setColor, { getColor } from '../../../misc/color';
import Random from '../../../misc/Random';
import { TD, MISC } from '../../../variables';

export default class Nebula {
  constructor({
    parent, index, x, y, z,
  }) {
    this.parent = parent;
    this.type = 'nebula';
    this.config = TD.entity[this.type];
    this.coordinate = { x, y, z };
    this.index = index;
    this.id = {
      text: `X:${this.coordinate.x}, Y:${this.coordinate.y}, Z:${this.coordinate.z}, I:${this.index}`,
      toString: () => `${this.coordinate.x}.${this.coordinate.y}.${this.coordinate.z}:${this.index}`,
    };
    this.random = new Random(`nebula_${this.id}`);
    this.drawLow();
  }

  get position() {
    if (!this._position) {
      this.random.seed = 'position';
      this._position = {
        x: this.random.rnd(this.config.size),
        y: this.random.rnd(this.config.size),
        z: this.random.rnd(this.config.size),
      };
    }
    return this._position;
  }

  get rotation() {
    if (!this._rotation) {
      this.random.seed = 'rotation';
      this._rotation = {
        x: this.random.rnd(Math.PI * 2),
        y: this.random.rnd(Math.PI * 2),
        z: this.random.rnd(Math.PI * 2),
      };
    }
    return this._rotation;
  }

  get universe() {
    return {
      x: (this.position.x + this.coordinate.x * this.config.size) * TD.scale, // absolute
      y: (this.position.y + this.coordinate.y * this.config.size) * TD.scale,
      z: (this.position.z + this.coordinate.z * this.config.size) * TD.scale,
      xr: ( // relative
        this.position.x + (this.coordinate.x - (TD.camera.coordinate.x || 0)) * this.config.size
      ) * TD.scale,
      yr: (
        this.position.y + (this.coordinate.y - (TD.camera.coordinate.y || 0)) * this.config.size
      ) * TD.scale,
      zr: (
        this.position.z + (this.coordinate.z - (TD.camera.coordinate.z || 0)) * this.config.size
      ) * TD.scale,
    };
  }

  get size() {
    if (!this._size) {
      this.random.seed = 'size';
      this._size = {
        x: this.random.rnd(this.config.size * 10, this.config.size * 30),
        y: this.random.rnd(this.config.size * 10, this.config.size * 30),
      };
    }
    return this._size;
  }

  get color() {
    if (!this._color) {
      this.random.seed = 'color';
      const hue = this.random.rnd();
      const lightness = this.random.rnd(0.5, 0.75);
      this._color = getColor({ hue, saturation: 1.0, lightness });
    }
    return this._color;
  }

  get opacity() {
    if (!this._opacity) {
      this.random.seed = 'opacity';
      this._opacity = this.random.rnd(0.1, 1.0);
    }
    return this._opacity;
  }

  drawLow() {
    const pos = this.universe;
    setColor(1, Number(this.color.hue), 1.0, Number(this.color.lightness), 'hsl');
    const id = `${this.coordinate.x}_${this.coordinate.y}_${this.coordinate.z}`;
    this.parent.group[id].this.push(this);
    this.parent.group[id].positions.push(pos.xr, pos.yr, pos.zr);
    this.parent.group[id].rotations.push(this.rotation.x, this.rotation.y, this.rotation.z);
    this.parent.group[id].colors.push(
      MISC.colorHelper.r, MISC.colorHelper.g, MISC.colorHelper.b,
    );
    this.parent.group[id].opacity.push(this.opacity);
    this.parent.group[id].sizes.push(this.size.x * TD.scale, this.size.y * TD.scale);
  }
}
