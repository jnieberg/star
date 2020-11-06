import Random from '../../../misc/Random';
import Globe from '../globe/Globe';
import getTime from '../../../misc/time';
import SubStar from './SubStar';
import Star from './Star';
import toLetter from '../../../misc/to-letter';
import { TD } from '../../../variables';

export default class MainStar extends Star {
  constructor(props) {
    super(props);
    this.type = 'star';
    this.random = new Random(`${this.type}_${props.system.key}_${props.index}`);
  }

  get letter() {
    return this.system.stars.length > 1 ? toLetter(this.index) : '';
  }

  get name() {
    if (!this._name) {
      this._name = `${this.parent.name} ${this.letter}`;
    }
    return this._name;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const { temperature } = this;
      this.random.seed = 'children';
      // number of planets depends on star temperature and number of stars
      let childrenLength = this.random.int(Math.sqrt(temperature) * 0.1);
      childrenLength = childrenLength < 18 ? childrenLength : 18;
      if (childrenLength > 0) {
        this.hasSubStar = false;
        this.random.seed = 'sub-star';
        for (let index = 0; index < childrenLength; index += 1) {
          const subStar =
            (this.sizeText === 'Supergiant' && this.random.int(20) === 0) ||
            (this.sizeText === 'Hypergiant' && this.random.int(10) === 0);
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
      this.object.rotateX(this.random.float(2.0 * Math.PI));
      this.object.rotateZ(this.random.float(2.0 * Math.PI));
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
      if (this.camera) {
        this.camera.update(TD.renderer, TD.scene);
      }
      this.setLabel(2.0);
    }
  }
}
