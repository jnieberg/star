import * as THREE from 'three';

import Random from '../../../misc/Random';
import { STAR, TD, MISC } from '../../../variables';
import deleteThree from '../../tools/delete';
import setColor, { getColor } from '../../../misc/color';
import Atmosphere from '../planet/Atmosphere';
import { toSize, toSizeString } from '../../../misc/size';
import toCelcius from '../../../misc/temperature';
import Body from '../planet/Body';

export default class SubStar extends Body {
  constructor({ index, system, parent }) {
    super({
      index, system, parent, type: 'substar',
    });
    this.random = new Random(`substar_${system.id}_${parent.id}_${index}`);
  }

  get textShort() {
    return `${this.name}${this.children && this.children.length ? `<span class="children">${this.children.length}</span>` : ''}`;
  }

  get text() {
    return `
      <div class="label--h1">${this.name}</div>
      ${this.system.children > 1 ? `<div class="label--h2">Star #${this.index + 1} of ${this.system.name}</div>` : ''}
      <div>${this.color.text} ${this.size.text}</div>
      <div>Size:<span>${toSize(this.size)}</span></div>
      <div>Temperature:<span>${toCelcius(this.temperature.min)}</span></div>
    ${this.children && this.children.length > 0
    ? `<div class="label--h3">Planets<span>Moons</span></div>
    <ol>
      ${this.children.map((body) => `<li>${body.textShort}</li>`).join('\n')}
    </ol>`
    : ''}`;
  }

  get size() {
    if (!this._size) {
      this.random.seed = 'size';
      const sizeOff = this.random.rnd(0.25, 0.5);
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
      const hue = this.random.rnd(0.05);
      const lightness = this.random.rnd(0.1, 0.4);
      this._color = getColor({ hue, lightness });
    }
    return this._color;
  }

  // Sub star temperature in Kelvin
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
      const childrenLength = this.random.rndInt(Math.sqrt(temperature) * 0.1);
      if (childrenLength > 0) {
        for (let index = 0; index < childrenLength; index += 1) {
          const child = new Body({ system: this.system, index, parent: this });
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
    const size = this.size * 0.0001 * TD.scale;
    deleteThree(this.object); // WIP. Maybe we can hide it?
    const hue2 = this.color.hue - 0.05 > 0 ? this.color.hue - 0.05 : 0;
    setColor(1, this.color.hue, 1.0, this.color.lightness, 'hsl');
    setColor(2, hue2, 1.0, this.color.lightness + 0.25, 'hsl');
    setColor(3, this.color.hue, 0.5, this.color.lightness, 'hsl');
    this.random.seed = 'rotation';

    // Sub star pivot
    this.object = new THREE.Object3D();
    const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: MISC.colorHelper2,
      side: THREE.BackSide,
      transparent: true,
      alphaTest: 0,
    });
    this.object.low = new THREE.Mesh(geometry, material);
    this.object.low.name = 'Sub star low';
    this.object.low.castShadow = false;
    this.object.low.receiveShadow = false;
    this.object.add(this.object.low);

    // Sub star spots
    const materialSpots = new THREE.MeshBasicMaterial({
      map: TD.texture.star.surface,
      color: MISC.colorHelper,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 1,
      alphaTest: 0,
    });
    this.object.high = new THREE.Mesh(geometry, materialSpots);
    this.object.high.name = 'Sub star high';
    this.object.high.scale.set(1, 1, 1);// 0.98, 0.98, 0.98);
    this.object.high.castShadow = false;
    this.object.high.receiveShadow = false;
    this.object.add(this.object.high);

    // Sub star corona
    // eslint-disable-next-line no-unused-vars
    const _ = new Atmosphere(this.object.high, {
      size: size * 1.01,
      thickness: size * 1.5,
      color: MISC.colorHelper2,
      colorInner: MISC.colorHelper,
      blending: THREE.AdditiveBlending,
      opacity: 1,
    });

    // Sub star point light
    const near = TD.camera.near * 100 * TD.scale;
    const far = TD.camera.far * 0.00005 * TD.scale;
    this.light = new THREE.PointLight(MISC.colorHelper3);
    this.light.name = 'Sub star light';
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

    // Planet trajectory
    const trajectoryGeometry = new THREE.RingBufferGeometry(
      1.0 - (0.2 / this.distance),
      1.0 + (0.2 / this.distance),
      128,
      1,
    );
    const trajectoryMaterial = new THREE.MeshBasicMaterial({
      color: 0x0044ff,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: false,
      opacity: this.type === 'moon' ? 0.15 : 0.25,
      depthTest: false,
    });
    const trajectoryMesh = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
    trajectoryMesh.name = 'Sub star trajectory';
    trajectoryMesh.rotation.x = Math.PI * 0.5;
    trajectoryMesh.scale.set(
      this.distance * 0.0001 * TD.scale,
      this.distance * 0.0001 * TD.scale,
      this.distance * 0.0001 * TD.scale,
    );
    trajectoryMesh.castShadow = false;
    trajectoryMesh.receiveShadow = false;
    trajectoryMesh.renderOrder = -1;
    this.parent.object.high.add(trajectoryMesh);

    // Draw planets of star
    if (this.children && this.children.length) {
      for (let c = 0; c < this.children.length; c += 1) {
        deleteThree(this.children[c].object.high); // WIP. Same... maybe hide it?
        this.children[c].drawLow();
      }
    }

    // Set star position
    this.object.rotateY(((2 * Math.PI) / this.system.children.length) * this.index);
    this.object.translateX(this.system.starDistance * TD.scale);

    // Add star to scene
    this.parent.object.add(this.object);
    this.object.low.this = this;
  }

  drawHigh() {
    return this.object && this.object.high;
  }

  remove() {
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    delete this;
  }
}
