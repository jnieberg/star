import * as THREE from 'three';

import Random from '../../../misc/Random';
import { STAR, TD, MISC } from '../../../variables';
import deleteThree from '../../tools/delete';
import setColor, { getColor } from '../../../misc/color';
import Atmosphere from '../planet/Atmosphere';
import { toSize, toSizeString } from '../../../misc/size';
import toRoman from '../../../misc/to-roman';
import toCelcius from '../../../misc/temperature';
import Body from '../planet/Body';
import getTime from '../../../misc/time';
import SubStar from './SubStar';
import BlackHole from './BlackHole';

export default class Star {
  constructor({ index, system, parent = system }) {
    this.random = new Random(`star_${system.id}_${index}`);
    this.index = index;
    this.system = system;
    this.parent = parent;
    this.type = 'star';
    this.parent.random.seed = 'black-hole';
    this.special = this.parent.random.rndInt(1000) === 0 ? 'black-hole' : '';
    this.object = {
      low: undefined,
      high: undefined,
    };
  }

  get textShort() {
    return `${this.name}${this.children && this.children.length ? `<span class="children">${this.children.length}</span>` : ''}`;
  }

  get text() {
    const stars = this.children.filter((child) => child.type === 'sub-star');
    const children = this.children.filter((child) => child.type !== 'sub-star');
    return `
      <div class="label--h1">${this.name}</div>
      ${this.parent.children > 1 ? `<div class="label--h2">Star #${this.index + 1} of ${this.parent.name}</div>` : ''}
      <div>${this.color.text} ${this.size.text}</div>
      <div>Size:<span>${toSize(this.size)}</span></div>
      <div>Temperature:<span>${toCelcius(this.temperature.min)}</span></div>
    ${stars && stars.length > 0
    ? `<div class="label--h3">Stars<span>Planets</span></div>
    <ol>
      ${stars.map((body) => `<li>${body.textShort}</li>`).join('\n')}
    </ol>`
    : ''}
    ${children && children.length > 0
    ? `<div class="label--h3">Planets<span>Moons</span></div>
    <ol>
      ${children.map((body) => `<li>${body.textShort}</li>`).join('\n')}
    </ol>`
    : ''}`;
  }

  get name() {
    return `${this.parent.name}${this.parent.children.length > 1 ? ` ${toRoman(this.index + 1)}` : ''}`;
  }

  get size() {
    if (!this._size) {
      this.random.seed = 'size';
      const sizeOff = this.special === 'black-hole' ? this.random.rnd(1, 2) : this.random.rnd(0.3, 0.4);
      const size = this.parent.size * sizeOff;
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
      const hueOff = this.random.rnd(-0.05, 0.05);
      const brightOff = this.random.rnd(0.9, 1.1);
      const hue = Number(this.parent.color.hue) + hueOff;
      const lightness = Number(this.parent.color.lightness) * brightOff;
      this._color = getColor({ hue, lightness });
    }
    return this._color;
  }

  // Star temperature in Kelvin
  get temperature() {
    if (!this._temperature) {
      this._temperature = {
        min: 0,
        max: 0,
      };
      this.random.seed = 'temperature';
      Object.keys(STAR.temperature).forEach((colorKey) => {
        if (colorKey === this.color.hue.text) {
          const temp = STAR.temperature[colorKey];
          const tempBright = temp.min + (temp.max - temp.min) * 0.75;
          const tempDark = temp.max - (temp.max - temp.min) * 0.75;
          let temperature = 0;
          switch (this.color.lightness.text) {
            case 'Bright':
              temperature = this.random.rndInt(tempBright, temp.max);
              break;
            case 'Dark':
              temperature = this.random.rndInt(temp.min, tempDark);
              break;
            case '':
              temperature = this.random.rndInt(tempDark, tempBright);
              break;
            default:
              temperature = this.random.rndInt(temp.min, temp.max);
              break;
          }
          this._temperature = {
            min: temperature,
            max: temperature,
          };
        }
      });
    }
    return this._temperature;
  }

  // temperature + size?
  get rotationSpeedAroundAxis() {
    const temperature = this.temperature.min;
    const direction = this.random.rndInt(2) === 0 ? -1 : 1;
    const speed = this.special === 'black-hole'
      ? this.random.rnd(temperature * 0.0003, temperature * 0.0004)
      : this.random.rnd(temperature * 0.000003, temperature * 0.000004);
    this.random.seed = 'rotation_speed';
    return direction * speed;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const temperature = this.temperature.min;
      this.random.seed = 'planets';
      // number of planets depends on star temperature and number of stars
      let childrenLength = this.random.rndInt(Math.sqrt(temperature) * 0.02)
        / this.parent.children.length;
      childrenLength = this.special === 'black-hole'
        ? childrenLength
        : this.random.rndInt(Math.sqrt(temperature) * 0.1) / this.parent.children.length;
      if (childrenLength > 0) {
        this.hasSubStar = false;
        this.random.seed = 'sub-star';
        for (let index = 0; index < childrenLength; index += 1) {
          const subStar = (this.size.text === 'Supergiant' || this.size.text === 'Hypergiant') && this.random.rndInt(5) === 0;
          let child;
          if (this.special === 'black-hole') {
            child = new SubStar({ system: this.system, index, parent: this });
          } else if (subStar) {
            this.hasSubStar = true;
            child = new SubStar({ system: this.system, index, parent: this });
          } else {
            child = new Body({ system: this.system, index, parent: this });
          }
          if (this.system.starDistance === 0 || child.distance < this.system.starDistance) {
            children.push(child);
          }
        }
      }
      this._children = children;
    }
    return this._children;
  }

  hideChildren() {
    for (let c = 0; c < this.children.length; c += 1) {
      const child = this.children[c];
      if (child.type !== 'sub-star' && child.object && child.object.high) {
        child.hideHigh();
      }
    }
  }

  update() {
    if (this.object && this.object.rotation) {
      this.object.rotation.set(0, 0, 0);
      this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
      if (this.object.ring) {
        const rotate = -((0.5 * getTime() * this.rotationSpeedAroundAxis) % (2 * Math.PI));
        const rotateInner = -((1 * getTime() * this.rotationSpeedAroundAxis) % (2 * Math.PI));
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
    }
  }

  drawHigh() {
    const size = this.size * 0.0001 * TD.scale;
    deleteThree(this.object); // WIP. Maybe we can hide it?
    const hue2 = this.color.hue - 0.05 > 0 ? this.color.hue - 0.05 : 0;
    setColor(1, this.color.hue, 1.0, this.color.lightness, 'hsl');
    setColor(2, hue2, 1.0, this.color.lightness + 0.25, 'hsl');
    setColor(3, this.color.hue, 0.5, this.color.lightness + 0.25, 'hsl');
    this.random.seed = 'rotation';

    // Star pivot
    this.object = new THREE.Object3D();

    const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
    if (this.special === 'black-hole') {
      this.blackHole = new BlackHole(this, geometry);
    } else {
      // Star inner
      const material = new THREE.MeshBasicMaterial({
        color: MISC.colorHelper2,
        side: THREE.BackSide,
        transparent: true,
        alphaTest: 0,
      });
      this.object.low = new THREE.Mesh(geometry, material);
      this.object.low.name = 'Star low';
      this.object.low.castShadow = false;
      this.object.low.receiveShadow = false;
      this.object.add(this.object.low);

      // Star spots
      const materialSpots = new THREE.MeshBasicMaterial({
        map: TD.texture.star.surface,
        color: MISC.colorHelper,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 1,
        alphaTest: 0,
      });
      this.object.high = new THREE.Mesh(geometry, materialSpots);
      this.object.high.name = 'Star high';
      this.object.high.scale.set(1, 1, 1);// 0.98, 0.98, 0.98);
      this.object.high.castShadow = false;
      this.object.high.receiveShadow = false;
      this.object.add(this.object.high);

      // Star corona
      // eslint-disable-next-line no-unused-vars
      const _ = new Atmosphere(this.object.high, {
        size: size * 1.005,
        thickness: size * 1.5,
        color: MISC.colorHelper,
        colorInner: MISC.colorHelper,
        blending: THREE.AdditiveBlending,
        opacity: 0.75,
      });
    }

    // Star point light
    const near = TD.camera.near * 100 * TD.scale;
    const far = TD.camera.far * 0.001 * TD.scale;
    this.light = new THREE.PointLight(MISC.colorHelper3);
    this.light.name = 'Star light';
    this.light.power = 30;
    this.light.decay = 2;
    this.light.distance = far;
    this.light.castShadow = true;
    this.light.shadow.bias = -near * 0.001; // < more   > less
    // this.light.shadow.radius = 2;
    // this.light.shadow.normalBias = -0.15;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = near;
    this.light.shadow.camera.far = far;
    this.light.shadow.autoUpdate = false;
    this.light.shadow.needsUpdate = true;
    this.object.high.add(this.light);

    // Draw planets of star
    if (this.children && this.children.length) {
      for (let c = 0; c < this.children.length; c += 1) {
        deleteThree(this.children[c].object.high); // WIP. Same... maybe hide it?
        this.children[c].drawLow();
      }
    }

    // Set star position
    this.object.rotateY(((2 * Math.PI) / this.parent.children.length) * this.index);
    this.object.translateX(this.parent.starDistance * 0.0001 * TD.scale);

    // Add star to scene
    this.parent.object.add(this.object);
    this.object.low.this = this;
  }

  remove() {
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    delete this;
  }
}
