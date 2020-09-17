import Random from '../../../misc/Random';
import { COLOR } from '../../../variables';
import { getColor } from '../../../misc/color';
import Globe from '../globe/Globe';
import aggregation from '../../../misc/aggregation';
import Star from './Star';

export default class SubStar extends aggregation(Globe, Star) {
  constructor({ index, system, parent }) {
    super({
      index, system, parent, type: 'sub-star',
    });
    this.random = new Random(`substar_${system.id}_${parent.id}_${index}`);
  }

  get color() {
    if (!this._color) {
      this.random.seed = 'color';
      const hue = this.system.special === 'black-hole' ? this.random.rnd() : this.random.rnd(COLOR.hue.Orange);
      const lightness = this.system.special === 'black-hole' ? this.random.rnd(COLOR.lightness.Black, 1.0) : this.random.rnd(COLOR.lightness.Black, COLOR.lightness.Dark);
      this._color = getColor({ hue, lightness });
    }
    return this._color;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const temperature = this.temperature.min;
      this.random.seed = 'children';
      const childrenLength = this.random.rndInt(Math.sqrt(temperature) * 0.05);
      if (childrenLength > 0) {
        for (let index = 0; index < childrenLength; index += 1) {
          const child = new Globe({ system: this.system, index, parent: this });
          // eslint-disable-next-line no-unused-vars
          const _ = child.children;
          children.push(child);
        }
      }
      this._children = children;
    }
    return this._children;
  }

  drawLow() {
    this.drawHigh();
  }
}