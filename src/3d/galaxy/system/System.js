import * as THREE from 'three';
import Word from '../../../misc/Word';
import { TD, MISC, LAYER, STAR } from '../../../variables';
import deleteThree from '../../tools/delete';
import Random from '../../../misc/Random';
import MainStar from './MainStar';
import BlackHole from './BlackHole';
import setColor from '../../../misc/color';
import getTime from '../../../misc/time';
import getInfo from '../../../misc/info';

export default class System {
  constructor({ parent, index, x, y, z }) {
    this.parent = parent;
    this.type = 'system';
    this.config = TD.entity[this.type];
    this.coordinate = { x, y, z };
    this.index = index;
    this.key = `${this.coordinate.x}.${this.coordinate.y}.${this.coordinate.z}:${this.index}`;
    this.random = new Random(`system_${this.key}`);
    this.object = {
      low: undefined,
      high: undefined,
    };
    this.drawLow();
  }

  get name() {
    if (!this._name) {
      this.random.seed = 'name';
      this._name = new Word(this.random, {
        syllablesMin: 3,
        syllablesMax: 5,
      });
    }
    return this._name;
  }

  get position() {
    if (!this._position) {
      this.random.seed = 'position';
      this._position = {
        x: this.random.float(this.config.size),
        y: this.random.float(this.config.size),
        z: this.random.float(this.config.size),
      };
    }
    return this._position;
  }

  get universe() {
    return {
      x: (this.position.x + this.coordinate.x * this.config.size) * TD.scale, // absolute
      y: (this.position.y + this.coordinate.y * this.config.size) * TD.scale,
      z: (this.position.z + this.coordinate.z * this.config.size) * TD.scale,
      xr:
        // relative
        (this.position.x +
          (this.coordinate.x - (TD.camera.coordinate.x || 0)) *
            this.config.size) *
        TD.scale,
      yr:
        (this.position.y +
          (this.coordinate.y - (TD.camera.coordinate.y || 0)) *
            this.config.size) *
        TD.scale,
      zr:
        (this.position.z +
          (this.coordinate.z - (TD.camera.coordinate.z || 0)) *
            this.config.size) *
        TD.scale,
    };
  }

  get special() {
    this.random.seed = 'special';
    if (this.random.int(1000) === 0) {
      // black hole
      return 'black-hole';
    }
    return undefined;
  }

  get infoFactor() {
    if (!this._infoFactor) {
      this.random.seed = 'infoFactor';
      const pow = 10;
      this._infoFactor = this.random.float() ** pow;
    }
    return this._infoFactor;
  }

  get info() {
    if (!this._info) {
      this._info = getInfo(STAR, this.infoFactor);
    }
    return this._info;
  }

  get size() {
    this.random.seed = 'size';
    const pow = 1;
    const max = 1;
    return this.info.size + this.random.float() ** pow * max;
  }

  get color() {
    return this.info.index;
  }

  // Radius amongst multinairy stars
  get distance() {
    this.random.seed = 'distance';
    if (this.stars.length > 1) {
      const size = this.stars
        .map((child) => child.size)
        .reduce((acc, cur) => acc + cur);
      return size * this.random.float(1, 15);
    }
    return 0;
  }

  get children() {
    if (!this._children) {
      this.random.seed = 'stars';
      let childrenLength = 0;
      do {
        // chance on multinary stars
        childrenLength += 1;
      } while (this.random.int(15) === 0);
      const children = [];
      for (let i = 0; i < childrenLength; i += 1) {
        const StarClass = this.special === 'black-hole' ? BlackHole : MainStar;
        const star = new StarClass({
          system: this,
          index: children.length,
        });
        children.push(star);
      }
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
    let system = this.stars.length > 1 && 'Multinary system';
    system = system || (this.special === 'black-hole' && 'Black hole system');
    system = system || 'System';
    return `
    <div class="label--h1 star">${this.name}</div>
    <div class="label--h2">${system} #${this.key}</div>
    ${
      this.stars.length
        ? `<div class="label--h3">Stars<span>Bodies</span></div>
          <ol>
            ${this.stars.map((star) => `<li>${star.textShort}</li>`).join('\n')}
          </ol>`
        : ''
    }
    ${
      this.planets.length
        ? `<div class="label--h3">Planets<span>Bodies</span></div>
          <ol>
            ${this.planets
              .map((planet) => `<li>${planet.textShort}</li>`)
              .join('\n')}
          </ol>`
        : ''
    }`;
  }

  getBodyByIds(ids, children = this.children) {
    const index = ids.shift();
    const found = children.find((child) => child.index === index);
    if (ids.length > 0) {
      return this.getBodyByIds(ids, found.children);
    }
    return found;
  }

  // temperature + size?
  get rotationSpeedAroundAxis() {
    if (!this._rotationSpeedAroundAxis) {
      if (this.stars.length > 1) {
        let temperature = 0;
        this.stars.forEach((child) => {
          temperature += child.temperature;
        });
        this.random.seed = 'rotation_speed';
        this._rotationSpeedAroundAxis =
          (this.random.int(1) === 0 ? -1 : 1) *
          this.random.float(temperature * 0.000002, temperature * 0.000004);
      } else {
        this._rotationSpeedAroundAxis = 0;
      }
    }
    return this._rotationSpeedAroundAxis;
  }

  get rotation() {
    if (!this._rotation) {
      this.random.seed = 'rotation';
      this._rotation = {
        x: this.random.float(2 * Math.PI),
        y: this.random.float(2 * Math.PI),
        z: this.random.float(2 * Math.PI),
      };
    }
    return this._rotation;
  }

  get stars() {
    return this.children.filter((child) => child.type === 'star');
  }

  get planets() {
    return this.children.filter((child) => child.type === 'planet');
  }

  update() {
    if (this.object && this.object.rotation) {
      this.object.rotation.set(
        this.rotation.x,
        this.rotation.y,
        this.rotation.z
      );
      this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
    }
    this.children.forEach((child) => {
      child.update();
    });
  }

  hideChildren() {
    this.stars.forEach((child) => child.hideChildren());
  }

  updateShadows() {
    this.stars.forEach((child) => {
      if (child.light) {
        child.light.shadow.needsUpdate = true;
      }
    });
  }

  setLayer() {
    if (this.object) {
      this.object.layers.set(LAYER.SYSTEM);
      this.object.traverse((child) => {
        child.layers.set(LAYER.SYSTEM);
      });
    }
  }

  // Draw all stars and bodies here
  draw() {
    this.object = new THREE.Object3D();
    this.object.high = this.object;
    this.object.position.set(
      this.position.x * TD.scale,
      this.position.y * TD.scale,
      this.position.z * TD.scale
    );
    this.children.forEach((child) => child.drawLow());
    // this.setLayer();
    TD.scene.add(this.object);
  }

  drawLow() {
    const pos = this.universe;
    // eslint-disable-next-line no-unused-vars
    const { hue, lightness } = this.info;
    setColor(1, hue, 1.0, lightness, 'hsl');
    const id = `${this.coordinate.x}_${this.coordinate.y}_${this.coordinate.z}`;
    this.parent.group[id].this.push(this);
    this.parent.group[id].positions.push(pos.xr, pos.yr, pos.zr);
    this.parent.group[id].colors.push(
      MISC.colorHelper.r,
      MISC.colorHelper.g,
      MISC.colorHelper.b
    );
    this.parent.group[id].sizes.push(this.size * TD.scale);
  }

  remove() {
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    delete this;
  }
}
