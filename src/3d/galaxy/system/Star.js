import * as THREE from 'three';

import setColor from '../../../misc/color';
import { toSize, toSizeString } from '../../../misc/size';
import toCelcius from '../../../misc/temperature';
import { LOD, MISC, STAR, TD } from '../../../variables';
import deleteThree from '../../tools/delete';
import Body from '../Body';
import Atmosphere from '../globe/Atmosphere';

export default class Star extends Body {
  constructor(props) {
    super(props);
    this.visible = true;
  }

  get size() {
    if (!this._size) {
      this.random.seed = 'size';
      const sizeOff = this.random.rnd(0.2, 0.4);
      const size = this.parent.size * sizeOff;
      this._size = {
        valueOf: () => size,
        text: toSizeString(size),
      };
    }
    return this._size;
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

  get textShort() {
    return `<span class="index">${this.index + 1}</span>${this.name}${
      this.children && this.children.length
        ? `<span class="children">${this.children.length}</span>`
        : ''
    }`;
  }

  get text() {
    const stars = this.children.filter((child) => child.type === 'sub-star');
    const children = this.children.filter((child) => child.type !== 'sub-star');
    return `
      <div class="label--h1 ${this.type}">${this.name}</div>
      ${
        this.parent.children > 1
          ? `<div class="label--h2">Star #${this.index + 1} of ${
              this.parent.name
            }</div>`
          : ''
      }
      <div>${this.color.text} ${this.size.text}</div>
      <div>Size:<span>${toSize(this.size)}</span></div>
      <div>Temperature:<span>${toCelcius(this.temperature.min)}</span></div>
    ${
      stars && stars.length > 0
        ? `<div class="label--h3">Stars<span>Planets</span></div>
    <ol>
      ${stars
        .map((body) => `<li class="star">${body.textShort}</li>`)
        .join('\n')}
    </ol>`
        : ''
    }
    ${
      children && children.length > 0
        ? `<div class="label--h3">Planets<span>Moons</span></div>
    <ol>
      ${children
        .map((body) => `<li class="planet">${body.textShort}</li>`)
        .join('\n')}
    </ol>`
        : ''
    }`;
  }

  // temperature + size?
  get rotationSpeedAroundAxis() {
    if (!this._rotationSpeedAroundAxis) {
      const temperature = this.temperature.min;
      const direction = this.random.rndInt(2) === 0 ? -1 : 1;
      const speed = this.random.rnd(
        temperature * 0.000003,
        temperature * 0.000004
      );
      this.random.seed = 'rotation_speed';
      this._rotationSpeedAroundAxis = direction * speed;
    }
    return this._rotationSpeedAroundAxis;
  }

  hideChildren() {
    for (let c = 0; c < this.children.length; c += 1) {
      const child = this.children[c];
      if (child.type !== 'sub-star' && child.object && child.object.high) {
        child.hideHigh();
      }
    }
  }

  drawPre() {
    deleteThree(this.object); // WIP. Maybe we can hide it?
    const hue2 = this.color.hue - 0.08 > 0 ? this.color.hue - 0.08 : 0;
    setColor(1, this.color.hue, 1.0, this.color.lightness, 'hsl'); // Inner
    setColor(2, hue2, 1.0, this.color.lightness - 0.15, 'hsl'); // Outer
    setColor(3, this.color.hue, 0.25, this.color.lightness + 0.15, 'hsl'); // Light

    // Star pivot
    this.object = new THREE.Object3D();
    this.object.name = 'Star pivot';
  }

  drawPost() {
    // Star point light
    const near = MISC.camera.near * 100 * TD.scale;
    const far = MISC.camera.far * 0.001 * TD.scale;
    this.light = new THREE.PointLight(MISC.colorHelper3);
    this.light.name = 'Star light';
    this.light.power = MISC.lod === LOD.LOW ? 30 : 10;
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
    this.object.rotateY(
      ((2.0 * Math.PI) / this.system.stars.length) * this.index
    );
    this.object.translateX(this.system.distance * 0.0001 * TD.scale);

    // Add star to scene
    this.parent.object.add(this.object);
    this.object.this = this;
    this.object.low.this = this;
  }

  drawHigh() {
    this.drawPre();
    const size = this.size * 0.0001 * TD.scale;

    // Star inner
    const geometry = new THREE.SphereBufferGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: MISC.colorHelper2,
      side: THREE.BackSide,
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
      alphaTest: 0,
    });
    this.object.high = new THREE.Mesh(geometry, materialSpots);
    this.object.high.name = 'Star high';
    this.object.high.scale.set(1, 1, 1);
    this.object.high.castShadow = false;
    this.object.high.receiveShadow = false;

    this.object.add(this.object.high);

    if (MISC.lod === LOD.LOW) {
      // Sub star flare
      const materialFlare = new THREE.SpriteMaterial({
        map: TD.texture.star.large,
        color: MISC.colorHelper,
        transparent: true,
        blending: THREE.AdditiveBlending,
        alphaTest: 0,
        depthTest: false,
        rotation: Math.PI * 0.25,
      });
      const objectFlare = new THREE.Sprite(materialFlare);
      objectFlare.name = 'Star flare';
      objectFlare.scale.set(size * 8, size * 8, size * 8);
      objectFlare.castShadow = false;
      objectFlare.receiveShadow = false;
      this.object.add(objectFlare);

      // Star corona
      const atmosphere = new Atmosphere({
        size: size * 1.01,
        thickness: 15.0,
        color: MISC.colorHelper,
        color2: MISC.colorHelper2,
        blending: THREE.AdditiveBlending,
        opacity: 0.75,
        power: 5.0,
        depth: false,
      });
      atmosphere.add(this.object.high);
    }

    // Star trajectory
    if (this.drawTrajectory) {
      this.drawTrajectory({
        thickness: 2,
      });
    }

    this.drawPost();
  }

  drawLow() {
    this.drawHigh();
  }
}
