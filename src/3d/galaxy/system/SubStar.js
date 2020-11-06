import Random from '../../../misc/Random';
import { STAR } from '../../../variables';
import Globe from '../globe/Globe';
import aggregation from '../../../misc/aggregation';
import Star from './Star';
import getInfo from '../../../misc/info';

export default class SubStar extends aggregation(Globe, Star) {
  constructor(props) {
    super({
      ...props,
      type: 'sub-star',
    });
    this.random = new Random(
      `substar_${props.system.key}_${props.parent.id}_${props.index}`
    );
  }

  get info() {
    if (!this._info) {
      this.random.seed = 'info';
      this._info = getInfo(
        STAR,
        this.system.special === 'black-hole'
          ? this.random.float()
          : this.random.float(0.2)
      );
    }
    return this._info;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const { temperature } = this;
      this.random.seed = 'children';
      const childrenLength = this.random.int(Math.sqrt(temperature) * 0.05);
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
