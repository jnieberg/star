import Random from '../../../misc/Random';
import { getColor } from '../../../misc/color';
import Globe from '../globe/Globe';
import getTime from '../../../misc/time';
import SubStar from './SubStar';
import Star from './Star';
import toLetter from '../../../misc/to-letter';

export default class MainStar extends Star {
  constructor({ index, system, parent = system }) {
    super();
    this.type = 'star';
    this.random = new Random(`${this.type}_${system.id}_${index}`);
    this.index = index;
    this.letter = toLetter(this.index);
    this.system = system;
    this.parent = parent;
  }

  get name() {
    return `${this.parent.name}${
      this.parent.children.length > 1 ? ` ${this.letter}` : ''
    }`;
  }

  get color() {
    if (!this._color) {
      this.random.seed = 'color';
      const hueOff = this.random.rnd(-0.05, 0.05);
      const brightOff = this.random.rnd(0.9, 1.1);
      const hue = Number(this.parent.color.hue) + hueOff;
      const lightness = Number(this.parent.color.lightness) * brightOff;
      this._color = getColor({ hue, lightness });
    }
    return this._color;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const temperature = this.temperature.min;
      this.random.seed = 'children';
      // number of planets depends on star temperature and number of stars
      const childrenLength = this.random.rndInt(Math.sqrt(temperature) * 0.1);
      if (childrenLength > 0) {
        this.hasSubStar = false;
        this.random.seed = 'sub-star';
        for (let index = 0; index < childrenLength; index += 1) {
          const subStar =
            (this.size.text === 'Supergiant' && this.random.rndInt(20) === 0) ||
            (this.size.text === 'Hypergiant' && this.random.rndInt(10) === 0);
          let child;
          if (subStar) {
            this.hasSubStar = true;
            child = new SubStar({ system: this.system, index, parent: this });
          } else {
            child = new Globe({ system: this.system, index, parent: this });
          }
          // eslint-disable-next-line no-unused-vars
          const _ = child.children;
          if (
            this.system.distance === 0 ||
            child.distance <
              this.system.distance / Math.sqrt(this.parent.children.length - 1)
          ) {
            children.push(child);
          } else if (child.distance > this.system.distance * 2.0) {
            child = new Globe({
              system: this.system,
              index: this.parent.children.length,
              parent: this.parent,
              distance: this.system.distance * 2.0,
            });
            this.parent.children.push(child);
            child.drawLow();
          }
        }
      }
      this._children = children;
    }
    return this._children;
  }

  update() {
    if (this.object && this.object.rotation) {
      this.object.rotation.set(0, 0, 0);

      // Set star rotation axis
      this.random.seed = 'rotation';
      this.object.rotateX(this.random.rnd(2.0 * Math.PI));
      this.object.rotateZ(this.random.rnd(2.0 * Math.PI));
      this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
      if (this.object.ring) {
        const rotate = -(
          (0.5 * getTime() * this.rotationSpeedAroundAxis) %
          (2 * Math.PI)
        );
        const rotateInner = -(
          (1 * getTime() * this.rotationSpeedAroundAxis) %
          (2 * Math.PI)
        );
        this.object.ring.rotation.z = rotate;
        this.object.ring2.rotation.z = rotateInner;
        this.object.aura.material.rotation = rotate;
      }
      if (this.children) {
        for (let c = 0; c < this.children.length; c += 1) {
          const child = this.children[c];
          child.update();
        }
      }
      this.setLabel();
    }
  }
}
