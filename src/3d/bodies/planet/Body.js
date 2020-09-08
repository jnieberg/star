import * as THREE from 'three';
import { MISC, TD } from '../../../variables';
import setColor, { getColorMix, getColor } from '../../../misc/color';
import toCelcius from '../../../misc/temperature';
import deleteThree from '../../tools/delete';
import getTime from '../../../misc/time';
import BodySurface from './views/BodySurface';
import Atmosphere from './Atmosphere';
import Random from '../../../misc/Random';
import { toSize } from '../../../misc/size';
import Word from '../../../misc/Word';
import toPercent from '../../../misc/percent';

export default class Body {
  constructor({
    system, index, parent, type,
  }) {
    this.index = index;
    this.system = system;
    this.parent = parent;
    this.type = type || ((this.parent.type === 'star' || this.parent.type === 'substar') ? 'planet' : 'moon');
    this.random = new Random(`${this.type}_${system.id}_${this.grandParentId}_${this.parentId}_${index}`);
    this.visible = false;
    this.object = {
      low: undefined,
      high: undefined,
    };
    this.surfaceRenders = {
      resolutions: [128, 512], // 1024
      last: undefined,
    };
    if (this.type !== 'moon') {
      this._children = this.children;
    }
  }

  get name() {
    if (!this._name) {
      this.random.seed = 'name';
      this._name = new Word(this.random);
    }
    return this._name;
  }

  get size() {
    if (!this._size) {
      const parentSize = this.parent.size;
      this.random.seed = 'size';
      this._size = this.type === 'moon'
        ? parentSize * this.random.rnd(0.02, 0.2)
        : parentSize * (10 ** this.random.rnd(-2.0, 0.0)) * 0.2;
    }
    return this._size;
  }

  get parentId() {
    return this.parent ? this.parent.index : -1;
  }

  get grandParentId() {
    return this.parent && this.parent.parent ? this.parent.parent.index : -1;
  }

  get star() {
    let star = this.parent.type === 'star' && this.parent;
    star = star || (this.parent.parent && this.parent.parent.type === 'star' && this.parent.parent);
    star = star || (this.parent.parent.parent && this.parent.parent.parent.type === 'star' && this.parent.parent.parent);
    return star || null;
  }

  get subStar() {
    return this.star.children && this.star.children[0].type === 'substar';
  }

  get distanceStar() {
    let distance = this.type === 'planet' && this.distance;
    distance = distance || (this.parent.type === 'planet' && this.parent.distance);
    return distance || 0;
  }

  get distance() {
    if (!this._distance) {
      const isSubStarSystem = Boolean(this.subStar);
      const size = this.parent.size * 2;
      const scale = this.type !== 'moon' && this.parent.type === 'star' ? 5 : 0.5;
      let id = this.type === 'moon' && 1;
      id = id || (this.type === 'substar' && 3);
      id = id || (isSubStarSystem && 4);
      id = id || 2;
      id += this.index;
      this.random.seed = 'distance';
      this._distance = size + (id * id * 0.3 + (this.random.rnd(0.5, 1.0))) * scale;
    }
    return this._distance;
  }

  get temperature() {
    if (!this._temperature) {
      const starTemp = this.star.temperature.min;
      const distanceToStar = this.distanceStar * 0.5;
      const gas = (this.gas.thickness * 0.6) + 0.4;
      this.random.seed = 'temperature';
      let temp = [
        Math.floor((gas * starTemp) / this.random.rnd(distanceToStar, distanceToStar * 1.5)),
        Math.floor(starTemp / (1.0 + gas * this.random.rnd(distanceToStar, distanceToStar * 1.5))),
      ];
      temp = temp.sort((a, b) => (a > b ? 1 : -1));
      this._temperature = {
        min: temp[0],
        max: temp[1],
      };
    }
    return this._temperature;
  }

  get gas() {
    if (!this._atmosphere) {
      this._atmosphere = {
        size: 0,
        thickness: 0,
        color: {
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
      };
      this.random.seed = 'gas';
      if (this.random.rndInt(5) > 0) {
        const hsl = {
          hue: this.random.rnd(),
          saturation: this.random.rnd(),
          lightness: this.random.rnd(),
        };
        this._atmosphere = {
          size: this.random.rnd(this.size * 0.1),
          thickness: this.random.rnd(0.1, 1.0),
          color: {
            ...hsl,
            text: getColor(hsl).text,
          },
        };
      }
    }
    return this._atmosphere;
  }

  get clouds() {
    this.random.seed = 'clouds';
    if (this.type === 'planet' && this.gas.thickness > 0 && this.random.rndInt(2) === 0) {
      return {
        hue: this.gas.color.hue + this.random.rnd(0.2),
        saturation: this.gas.color.saturation,
        lightness: this.gas.color.lightness + this.random.rnd(0.25),
      };
    }
    return false;
  }

  get fluid() {
    this.random.seed = 'fluid';
    const hsl = {
      hue: this.random.rnd(),
      saturation: this.random.rnd(),
      lightness: this.random.rnd(),
    };
    let level;
    const levelChance = this.random.rndInt(4);
    if (levelChance <= 1) level = levelChance;
    else level = this.random.rnd(0.1, 0.9);
    return {
      level,
      ...getColor(hsl),
    };
  }

  get metal() {
    this.random.seed = 'metal';
    const hsl = {
      hue: this.random.rnd(),
      saturation: this.random.rnd(),
      lightness: this.random.rnd(),
    };
    let level;
    const levelChance = this.random.rndInt(4);
    if (levelChance <= 1) level = levelChance;
    else level = this.random.rnd(0.1, 0.9);
    return {
      level,
      ...getColor(hsl),
    };
  }

  get rings() {
    if (this.type === 'planet') {
      this.random.seed = 'ring';
      if (this.size > 0.02 && this.random.rndInt(2) === 0) {
        return {
          thickness: this.random.rnd(),
          size: this.size * 2 + this.random.rnd() * this.size * 3,
          color: {
            r: this.random.rnd(),
            g: this.random.rnd(),
            b: this.random.rnd(),
            a: this.random.rnd(0.25, 1),
          },
        };
      }
    }
    return false;
  }

  get children() {
    if (!this._children) {
      const children = [];
      const { size } = this;
      this.random.seed = 'moons';
      const childrenLength = this.random.rndInt(Math.sqrt(size) * 10);
      if (this.type === 'planet' && childrenLength) {
        for (let index = 0; index < childrenLength; index += 1) {
          const child = new Body({ system: this.system, index, parent: this });
          children.push(child);
        }
      }
      this._children = children;
    }
    return this._children;
  }

  get textShort() {
    return `<span class="index">${this.index + 1}</span>${this.name}${this.children && this.children.length ? `<span class="children">${this.children.length}</span>` : ''}`;
  }

  get text() {
    return `
      <div class="label--h1">${this.name}</div>
      <div class="label--h2">${this.type === 'moon' ? 'Moon' : 'Planet'} #${this.index + 1} of ${this.parent.name}</div>
      <div>Size:<span>${toSize(this.size)}</span></div>
      <div>Temperature:<span>${toCelcius(this.temperature.min)} to ${toCelcius(this.temperature.max)}</span></div>
      ${this.rings ? '<div>Has rings</div>' : ''}
      ${this.clouds ? '<div>Cloudy</div>' : ''}
      <div>&nbsp;</div>
      ${this.fluid.level < 1 ? `<div>Metal: ${toPercent(1.0 - this.fluid.level)}<span>${this.metal.text}</span></div>` : ''}
      ${this.fluid.level > 0 ? `<div>Liquid: ${toPercent(this.fluid.level)}<span>${this.fluid.text}</span></div>` : ''}
      ${this.gas.thickness > 0 ? `<div>Gas: ${toPercent(this.gas.thickness)}<span>${this.gas.color.text}</span></div>` : ''}
      ${this.children && this.children.length > 0
    ? `<div>&nbsp;</div>
    <div class="label--h3">Moons</div>
    <ol>
      ${this.children.map((body) => `<li>${body.textShort}</li>`).join('\n')}
    </ol>`
    : ''}`;
  }

  get rotationSpeedAroundParent() {
    this.random.seed = 'rotation_speed_parent';
    const speed = this.type === 'moon' ? this.random.rnd(10.0, 15.0) : this.random.rnd(0.00000001, 0.000000015);// this.random.rnd(0.000001, 0.0000015);
    return this.parent.rotationSpeedAroundAxis
      / ((this.distance ** 6) * speed + 1.0)
      - this.parent.rotationSpeedAroundAxis;
  }

  get rotationSpeedAroundAxis() {
    this.random.seed = 'rotation_speed';
    return this.random.rnd(0.01, 0.20);
  }

  setLabel() {
    if (this.visible) {
      if (!this.label) {
        this.label = document.createElement('div');
        this.label.id = 'label-body';
        this.label.classList.add('label-body', `label-${this.type}`);
        this.label.innerHTML = this.textShort;
        document.body.appendChild(this.label);
      }
      this.label.style.transform = `translate(${this.screenPosition.x}px, ${this.screenPosition.y}px)`;
    } else {
      this.removeLabel();
    }
  }

  removeLabel() {
    if (this.label) {
      this.label.remove();
      this.label = undefined;
    }
  }

  get screenPosition() {
    if (this.object) {
      const position = new THREE.Vector3();
      this.object.getWorldPosition(position);
      const p = new THREE.Vector3(position.x, position.y, position.z);
      const vector = p.project(TD.camera.object);
      const width = parseInt(TD.renderer.domElement.style.width, 10)
        || TD.renderer.domElement.width;
      const height = parseInt(TD.renderer.domElement.style.height, 10)
        || TD.renderer.domElement.height;
      vector.x = (vector.x + 1) * width * 0.5;
      vector.y = -(vector.y - 1) * height * 0.5;
      if (vector.z <= 1) {
        return vector;
      }
    }
    return {
      x: -9999,
      y: -9999,
    };
  }

  update() {
    if (this.object && this.object.position) {
      const rotateY = getTime() * this.rotationSpeedAroundParent;
      this.object.position.set(0, 0, 0);
      this.object.rotation.set(0, 0, 0);

      this.random.seed = 'rotation_parent';
      this.object.rotateY(rotateY + this.random.rnd(2 * Math.PI));
      this.object.translateX(this.distance * 0.0001 * TD.scale);

      this.object.rotation.set(0, 0, 0);
      this.random.seed = 'rotation';
      this.object.rotateY(getTime() * -this.parent.rotationSpeedAroundAxis);
      this.object.rotateZ(this.random.rnd(2 * Math.PI));
      this.object.rotateX(this.random.rnd(2 * Math.PI));
      this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
      if (this.children) {
        for (let c = 0; c < this.children.length; c += 1) {
          const child = this.children[c];
          child.update();
        }
      }
      this.setLabel();
    }
  }

  drawSurface() {
    if (this.surfaceRenders.resolutions.length > 0 && this.object) {
      const resolution = this.surfaceRenders.resolutions[0];
      setColor(1, this.gas.color.hue, this.gas.color.saturation, this.gas.color.lightness + 0.25, 'hsl');
      const bodySurface = new BodySurface({
        rnd: this.random.seed,
        size: this.size * 0.0001 * TD.scale,
        resolution,
        detail: 2 - this.surfaceRenders.resolutions.length,
        biome: this.surfaceRenders.last && this.surfaceRenders.last.biome,
        hasClouds: this.clouds,
        cloudColor: MISC.colorHelper,
        metal: this.metal,
        fluid: this.fluid,
      }, () => {
        if (this.surfaceRenders.last) {
          deleteThree(this.surfaceRenders.last.ground);
        }
        this.surfaceRenders.resolutions.shift();
        this.surfaceRenders.last = bodySurface;
        this.drawSurface();
      }, () => {
        console.log('INTERRUPT SUCCESS!!!');
      });
      bodySurface.ground.name = `${this.type} high ${resolution}`;
      this.object.high.add(bodySurface.ground);
      // this.object.high = bodySurface.ground;
      if (bodySurface.clouds) {
        bodySurface.clouds.sphere.name = `${this.type} clouds`;
        this.object.high.add(bodySurface.clouds.sphere);
      }
    } else {
      this.setSurfaceRender();
    }
  }

  setSurfaceRender({ resolutions = [], last } = {}) {
    this.surfaceRenders = { resolutions, last };
  }

  show() {
    this.object.visible = true;
    this.visible = true;
  }

  hide() {
    this.object.visible = false;
    this.visible = false;
  }

  // show high detailed body
  showHigh() {
    if (this.object && this.object.high) {
      this.object.high.visible = true;
      for (let c = 0; c < this.children.length; c += 1) {
        const child = this.children[c];
        child.show();
      }
    }
  }

  // hide high detailed body
  hideHigh() {
    if (this.object && this.object.high) {
      this.object.high.visible = false;
      for (let c = 0; c < this.children.length; c += 1) {
        const child = this.children[c];
        child.hide();
      }
    }
  }

  hideChildren() {
    for (let c = 0; c < this.children.length; c += 1) {
      const child = this.children[c];
      child.hideHigh();
    }
  }

  drawLow() {
    this.show();

    // Set gas color as emissive
    if (this.gas && this.type === 'planet') {
      setColor(2, this.gas.color.hue, this.gas.color.saturation, this.gas.color.lightness, 'hsl');
    }

    // Mix inner and outer color
    if (this.outer && this.type === 'planet') {
      const mix = getColorMix(
        this.color.r, this.color.g, this.color.b, // mix inner and outer sphere color
        this.outer.color.r, this.outer.color.g, this.outer.color.b,
        this.outer.opacity,
      );
      setColor(1, ...mix);
    }

    // Planet pivot
    this.object = new THREE.Object3D();
    this.object.name = `${this.type} pivot`;
    this.parent.object.high.add(this.object);
    this.object.rotation.y = this.random.rnd(2 * Math.PI) || 0;
    this.object.translateX(this.distance * 0.0001 * TD.scale || 0);

    // Planet sphere
    const bodySurface = new BodySurface({
      rnd: this.random.seed,
      size: (this.size * 0.000099) * TD.scale,
      resolution: 16,
      detail: 0,
      metal: this.metal,
      fluid: this.fluid,
    });
    this.object.low = bodySurface.ground;
    this.object.low.name = this.type === 'planet' ? 'Planet low' : 'Moon low';
    this.object.low.castShadow = true;
    this.object.low.receiveShadow = false;
    this.object.add(this.object.low);

    // Planet trajectory
    const trajectoryGeometry = new THREE.RingBufferGeometry(1.0 - ((this.type === 'moon' ? 0.01 : 0.05) / this.distance), 1.0 + ((this.type === 'moon' ? 0.01 : 0.05) / this.distance), 128, 1);
    const trajectoryMaterial = new THREE.MeshBasicMaterial({
      color: 0x0044ff,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: false,
      opacity: this.type === 'moon' ? 0.15 : 0.25,
      depthTest: false,
    });
    const trajectoryMesh = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
    trajectoryMesh.name = this.type === 'planet' ? 'Planet trajectory' : 'Moon trajectory';
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

    // Planet rings
    if (this.rings) {
      setColor(1, this.metal.hue, this.metal.saturation, this.metal.lightness, 'hsl');
      const ringGeometry = new THREE.RingBufferGeometry(
        this.rings.size * 0.00006 * TD.scale,
        this.rings.size * ((this.rings.thickness * 0.00004) + 0.00006) * TD.scale,
        64,
      );
      const ringMaterial = new THREE.MeshPhongMaterial({
        map: TD.texture.planet.rings,
        color: MISC.colorHelper,
        emissive: MISC.colorHelper,
        emissiveIntensity: 0.01,
        opacity: this.rings.color.a,
        side: THREE.DoubleSide,
        alphaTest: 0,
        transparent: true,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.name = 'Planet rings';
      ringMesh.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: TD.texture.planet.rings,
        side: THREE.DoubleSide,
        opacity: this.rings.color.a,
        alphaTest: 0,
      });
      ringMesh.renderOrder = 2;
      ringMesh.rotateX(Math.PI * 0.5);
      ringMesh.castShadow = true;
      ringMesh.receiveShadow = true;
      ringMesh.material.needsUpdate = true;
      this.object.low.add(ringMesh);
    }
    this.object.low.this = this;
    return this.object.low;
  }

  drawHigh() {
    if (this.object) {
      if (this.object.high) {
        this.drawSurface();
        this.showHigh();
      } else {
        this.object.high = new THREE.Object3D();
        this.object.high.name = `${this.type} high pivot`;
        this.object.add(this.object.high);
        this.drawSurface();

        // Planet gas
        if (this.gas.thickness) {
          setColor(1, this.gas.color.hue, this.gas.color.saturation, this.gas.color.lightness, 'hsl');
          // eslint-disable-next-line no-unused-vars
          const _ = new Atmosphere(this.object.high, {
            size: (this.size * 0.0001017) * TD.scale,
            thickness: (this.gas.size * 0.0001017) * TD.scale,
            color: MISC.colorHelper,
            // blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: this.gas.thickness,
          });
        }

        // Draw moons of planet
        if (this.children && this.children.length) {
          for (let c = 0; c < this.children.length; c += 1) {
            const child = this.children[c];
            child.drawLow();
          }
        }
      }
    }
  }

  remove() {
    this.removeLabel();
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    delete this;
  }
}
