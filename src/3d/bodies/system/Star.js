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

export default class Star {
  constructor({ index, system, parent = system }) {
    this.random = new Random(`star_${system.id}_${index}`);
    this.type = 'star';
    this.index = index;
    this.system = system;
    this.parent = parent;
    this.object = {
      low: undefined,
      high: undefined,
    };
    this.drawLow();
  }

  get textShort() {
    return `${this.name}${this.children && this.children.length ? `<span>${this.children.length}</span>` : ''}`;
  }

  get text() {
    const stars = this.children.filter((child) => child.type === 'substar');
    const children = this.children.filter((child) => child.type !== 'substar');
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
      const sizeOff = this.random.rnd(0.3, 0.4);
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

  get children() {
    if (!this._children) {
      const children = [];
      const temperature = this.temperature.min;
      this.random.seed = 'planets';
      // number of planets depends on star temperature and number of stars
      const childrenLength = (this.random.rndInt(Math.sqrt(temperature) * 0.1)
        / this.parent.children.length);
      if (childrenLength > 0) {
        for (let index = 0; index < childrenLength; index += 1) {
          const canHaveSubStar = index === 0 && (this.size.text === 'Supergiant' || this.size.text === 'Hypergiant');
          let child;
          if (canHaveSubStar && this.random.rndInt(5) === 0) {
            child = new SubStar({ system: this.system, index, parent: this });
          } else {
            child = new Body({ system: this.system, index, parent: this });
          }
          children.push(child);
        }
      }
      this._children = children;
    }
    return this._children;
  }

  hideChildren() {
    for (let c = 0; c < this.children.length; c += 1) {
      const child = this.children[c];
      if (child.object && child.object.high) {
        if (child.type !== 'substar') {
          child.hide();
        }
      }
    }
  }

  // temperature + size?
  get rotationSpeedAroundAxis() {
    const temperature = this.temperature.min;
    this.random.seed = 'rotation_speed';
    return (this.random.rndInt(2) === 0 ? -1 : 1) * this.random.rnd(temperature * 0.0000003,
      temperature * 0.0000004);
  }

  update() {
    if (this.object && this.object.rotation) {
      this.object.rotation.set(0, 0, 0);
      this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
      if (this.children) {
        for (let c = 0; c < this.children.length; c += 1) {
          const child = this.children[c];
          child.update();
        }
      }
    }
  }

  drawLow() {
    const pos = this.system.universe;
    setColor(1, Number(this.color.hue), 1.0, Number(this.color.lightness), 'hsl');
    const id = `${this.system.coordinate.x}_${this.system.coordinate.y}_${this.system.coordinate.z}`;
    TD.stars[id].this.push(this);
    TD.stars[id].positions.push(pos.xr, pos.yr, pos.zr);
    TD.stars[id].colors.push(MISC.colorHelper.r, MISC.colorHelper.g, MISC.colorHelper.b);
    TD.stars[id].sizes.push(this.size * 0.5 * TD.scale);
  }

  drawHigh() {
    const size = this.size * 0.0001 * TD.scale;
    deleteThree(this.object); // WIP. Maybe we can hide it?
    const hue2 = this.color.hue - 0.05 > 0 ? this.color.hue - 0.05 : 0;
    setColor(1, this.color.hue, 1.0, this.color.lightness, 'hsl');
    setColor(2, hue2, 1.0, this.color.lightness + 0.25, 'hsl');
    setColor(3, this.color.hue, 0.5, this.color.lightness, 'hsl');
    this.random.seed = 'rotation';

    // Star pivot
    this.object = new THREE.Object3D();
    const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
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
      size: size * 1.01,
      thickness: size * 1.5,
      color: MISC.colorHelper2,
      colorInner: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      opacity: 0.75,
    });

    // Star point light
    const near = TD.camera.near * 100 * TD.scale;
    const far = TD.camera.far * 0.0002 * TD.scale;
    this.light = new THREE.PointLight(new THREE.Color(1, 1, 1));// MISC.colorHelper3
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
    this.object.translateX(this.parent.starDistance * TD.scale);

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
