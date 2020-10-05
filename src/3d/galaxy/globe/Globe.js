import * as THREE from 'three';
import { BODY, MISC, TD } from '../../../variables';
import setColor, { getColorMix, getColor } from '../../../misc/color';
import toCelcius from '../../../misc/temperature';
import deleteThree from '../../tools/delete';
import getTime from '../../../misc/time';
import GlobeSurface from './surface/GlobeSurface';
import Atmosphere from './Atmosphere';
import Random from '../../../misc/Random';
import { toSize } from '../../../misc/size';
import Word from '../../../misc/Word';
import toPercent from '../../../misc/percent';
import Body from '../Body';

export default class Globe extends Body {
  constructor({ system, index, parent, type, distance = 0.0 }) {
    super();
    this.index = index;
    this.system = system;
    this.parent = parent;
    this.type = type || (this.parent.type === 'planet' ? 'moon' : 'planet');
    this.random = new Random(
      `${this.type}_${system.id}_${this.grandParentId}_${this.parentId}_${index}`
    );
    this.visible = false;
    this.distanceMin = distance;
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
      this._size =
        this.type === 'moon'
          ? parentSize * this.random.rnd(0.02, 0.2)
          : parentSize * 10 ** this.random.rnd(-2.0, 0.0) * 0.2;
    }
    return this._size;
  }

  get parentId() {
    return this.parent ? this.parent.index : -1;
  }

  get grandParentId() {
    return this.parent && this.parent.parent
      ? this.parent.parent.index || '0'
      : -1;
  }

  get star() {
    let star = this.parent.type === 'star' && this.parent; // get parent star
    star = // get grandparent star
      star ||
      (this.parent.parent &&
        this.parent.parent.type === 'star' &&
        this.parent.parent);
    star = // get great grandparent star
      star ||
      (this.parent.parent.parent &&
        this.parent.parent.parent.type === 'star' &&
        this.parent.parent.parent);
    star = // get sibling star
      star ||
      (this.parent.children &&
        this.parent.children.length > 0 &&
        this.parent.children[0].type === 'star' &&
        this.parent.children[0]);
    star = star || this.parent.star; // get uncle star
    return star || null;
  }

  get distanceStar() {
    let distance = this.type === 'planet' && this.distance;
    distance =
      distance || (this.parent.type === 'planet' && this.parent.distance);
    return distance || 0;
  }

  get distance() {
    if (!this._distance) {
      let factor = this.type === 'moon' && 0.5; // moon around planet
      factor =
        factor ||
        (this.type === 'sub-star' && this.system.special === 'black-hole' && 8); // stars around black hole
      factor = factor || (this.type === 'sub-star' && 3); // substar around star
      factor = factor || (this.parent.type === 'sub-star' && 2); // planets around a substar
      factor = factor || (this.parent.type === 'system' && 2); // planets in system, without star
      factor = factor || (this.star.hasSubStar && 3); // planets around star, in a substar system
      factor = factor || 2; // planets around star
      const size = this.parent.size * factor * 4 + this.distanceMin;
      this.random.seed = 'distance';
      factor *= this.index + this.random.rnd(0.8, 1.2);
      this._distance = size + (factor ** 2 + 1.0);
    }
    return this._distance;
  }

  get temperature() {
    if (!this._temperature) {
      const starTemp = this.star.temperature.min;
      const distanceToStar = this.distanceStar * 0.5;
      const gas = this.gas.density * 0.6 + 0.4;
      this.random.seed = 'temperature';
      let temp = [
        Math.floor(
          (gas * starTemp) /
            this.random.rnd(distanceToStar, distanceToStar * 1.5)
        ),
        Math.floor(
          starTemp /
            (1.0 + gas * this.random.rnd(distanceToStar, distanceToStar * 1.5))
        ),
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
        density: 0,
        blend: BODY.gas.Dust,
        color: {
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
      };
      this.random.seed = 'gas';
      const blend = this.random.rndInt(2);
      if (this.random.rndInt(5) > 0) {
        // const hsl = {
        //   hue: this.random.rnd(),
        //   saturation: this.random.rnd(),
        //   lightness:
        //     blend === BODY.gas.Dust
        //       ? this.random.rnd(0.0, 1.0)
        //       : this.random.rnd(0.5, 1.0),
        // };
        const hsl = blend === BODY.gas.Dust ? this.metal : this.fluid;
        this._atmosphere = {
          size: this.random.rnd(this.size * 0.1),
          density: this.random.rnd(0.1, 1.0),
          blend,
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
    if (
      this.type === 'planet' &&
      this.gas.density > 0 &&
      this.random.rndInt(2) === 0
    ) {
      return {
        hue: this.gas.color.hue,
        saturation: this.gas.color.saturation,
        lightness: this.gas.color.lightness + this.random.rnd(0.25),
        density: this.gas.density,
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
      this.random.seed = 'children';
      const childrenLength = this.random.rndInt(Math.sqrt(size) * 10);
      if (this.type === 'planet' && childrenLength) {
        for (let index = 0; index < childrenLength; index += 1) {
          const child = new Globe({ system: this.system, index, parent: this });
          children.push(child);
        }
      }
      this._children = children;
    }
    return this._children;
  }

  get letter() {
    return this.parent.letter.toLowerCase() || '';
  }

  get textShort() {
    return `<span class="index">${this.index + 1}${this.letter}</span>${
      this.name
    }${
      this.children && this.children.length
        ? `<span class="children">${this.children.length}</span>`
        : ''
    }`;
  }

  get text() {
    return `
      <div class="label--h1 ${this.type}">${this.name}</div>
      <div class="label--h2">${this.type === 'moon' ? 'Moon' : 'Planet'} #${
      this.index + 1
    } of ${this.parent.name}</div>
      <div>Size:<span>${toSize(this.size)}</span></div>
      <div>Temperature:<span>${toCelcius(this.temperature.min)} to ${toCelcius(
      this.temperature.max
    )}</span></div>
      ${this.rings ? '<div>Has rings</div>' : ''}
      ${this.clouds ? '<div>Cloudy</div>' : ''}
      <div>&nbsp;</div>
      ${
        this.fluid.level < 1
          ? `<div>Metal: ${toPercent(1.0 - this.fluid.level)}<span>${
              this.metal.text
            }</span></div>`
          : ''
      }
      ${
        this.fluid.level > 0
          ? `<div>Liquid: ${toPercent(this.fluid.level)}<span>${
              this.fluid.text
            }</span></div>`
          : ''
      }
      ${
        this.gas.density > 0
          ? `<div>${
              this.gas.blend === BODY.gas.Dust ? 'Dust' : 'Moist'
            }: ${toPercent(this.gas.density)}<span>${
              this.gas.color.text
            }</span></div>`
          : ''
      }
      ${
        this.children && this.children.length > 0
          ? `<div>&nbsp;</div>
    <div class="label--h3">Moons</div>
    <ol>
      ${this.children
        .map((body) => `<li class="moon">${body.textShort}</li>`)
        .join('\n')}
    </ol>`
          : ''
      }`;
  }

  get rotationSpeedAroundParent() {
    this.random.seed = 'rotation_speed_parent';
    const velocity = (1.0 / this.parent.size) * this.distance;
    let speed = this.parent.type === 'planet' && this.random.rnd(10, 15);
    speed =
      speed || (this.parent.type === 'sub-star' && this.random.rnd(0.1, 0.15));
    speed = speed || this.random.rnd(0.01, 0.015);
    return (
      this.parent.rotationSpeedAroundAxis / (velocity ** 2 * speed) -
      this.parent.rotationSpeedAroundAxis
    );
  }

  get rotationSpeedAroundAxis() {
    if (!this._rotationSpeedAroundAxis) {
      this.random.seed = 'rotation_speed';
      this._rotationSpeedAroundAxis = this.random.rnd(0.01, 0.2);
    }
    return this._rotationSpeedAroundAxis;
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
      setColor(
        1,
        this.gas.color.hue,
        this.gas.color.saturation,
        this.gas.color.lightness + 0.25,
        'hsl'
      );
      const globeSurface = new GlobeSurface(
        {
          rnd: this.random.seed,
          size: this.size * 0.0001 * TD.scale,
          resolution,
          detail: 2 - this.surfaceRenders.resolutions.length,
          biome: this.surfaceRenders.last && this.surfaceRenders.last.biome,
          hasClouds: this.clouds,
          cloudColor: MISC.colorHelper,
          metal: this.metal,
          fluid: this.fluid,
        },
        () => {
          if (this.surfaceRenders.last) {
            deleteThree(this.surfaceRenders.last.ground);
          }
          this.surfaceRenders.resolutions.shift();
          this.surfaceRenders.last = globeSurface;
          this.drawSurface();
        },
        () => {
          console.log('INTERRUPT SUCCESS!!!');
        }
      );
      globeSurface.ground.name = `${this.type} high ${resolution}`;
      this.object.high.add(globeSurface.ground);
      // this.object.high = globeSurface.ground;
      if (globeSurface.clouds) {
        globeSurface.clouds.sphere.name = `${this.type} clouds`;
        this.object.high.add(globeSurface.clouds.sphere);
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

  // show high detailed globe
  showHigh() {
    if (this.object && this.object.high) {
      this.object.high.visible = true;
      this.object.trajectory.visible = false;
      this.object.low.material.opacity = 0;
      for (let c = 0; c < this.children.length; c += 1) {
        const child = this.children[c];
        child.show();
      }
    }
  }

  // hide high detailed globe
  hideHigh() {
    if (this.object && this.object.high) {
      this.object.high.visible = false;
      this.object.trajectory.visible = true;
      this.object.low.material.opacity = 1;
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
      setColor(
        2,
        this.gas.color.hue,
        this.gas.color.saturation,
        this.gas.color.lightness,
        'hsl'
      );
    }

    // Mix inner and outer color
    if (this.outer && this.type === 'planet') {
      const mix = getColorMix(
        this.color.r,
        this.color.g,
        this.color.b, // mix inner and outer sphere color
        this.outer.color.r,
        this.outer.color.g,
        this.outer.color.b,
        this.outer.opacity
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
    const globeSurface = new GlobeSurface({
      rnd: this.random.seed,
      size: this.size * 0.000099 * TD.scale,
      resolution: 16,
      detail: 0,
      metal: this.metal,
      fluid: this.fluid,
    });
    this.object.low = globeSurface.ground;
    this.object.low.name = this.type === 'planet' ? 'Planet low' : 'Moon low';
    this.object.low.castShadow = true;
    this.object.low.receiveShadow = false;
    this.object.add(this.object.low);

    // Planet rings
    if (this.rings) {
      setColor(
        1,
        this.metal.hue,
        this.metal.saturation,
        this.metal.lightness,
        'hsl'
      );
      const ringGeometry = new THREE.RingBufferGeometry(
        this.rings.size * 0.00006 * TD.scale,
        this.rings.size * (this.rings.thickness * 0.00004 + 0.00006) * TD.scale,
        64
      );
      const ringMaterial = new THREE.MeshStandardMaterial({
        map: TD.texture.planet.rings,
        color: MISC.colorHelper,
        emissive: MISC.colorHelper,
        emissiveIntensity: 0.01,
        opacity: this.rings.color.a,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        alphaTest: 0,
        transparent: true,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.name = 'Planet rings';
      ringMesh.renderOrder = 0;
      ringMesh.rotateX(Math.PI * 0.5);
      ringMesh.castShadow = true;
      ringMesh.receiveShadow = true;
      this.object.low.add(ringMesh);
    }

    this.drawTrajectory({
      thickness: this.type === 'moon' ? 0.1 : 0.5,
      opacity: this.type === 'moon' ? 0.15 : 0.25,
    });
    this.object.low.this = this;
    return this.object.low;
  }

  drawHigh() {
    if (this.object) {
      this.object.trajectory.visible = false;
      this.object.low.material.opacity = 0;
      if (this.object.high) {
        this.drawSurface();
        this.showHigh();
      } else {
        this.object.high = new THREE.Object3D();
        this.object.high.name = `${this.type} high pivot`;
        this.object.add(this.object.high);
        this.drawSurface();

        // Planet gas
        if (this.gas.density) {
          const hue2 =
            this.gas.color.hue + 0.1 < 1 ? this.gas.color.hue + 0.1 : 0;
          setColor(
            1,
            this.gas.color.hue,
            this.gas.color.saturation,
            this.gas.color.lightness,
            'hsl'
          );
          setColor(
            2,
            hue2,
            this.gas.color.saturation,
            this.gas.color.lightness - 0.25,
            'hsl'
          );
          // eslint-disable-next-line no-unused-vars
          const _ = new Atmosphere(this.object.high, {
            size: this.size * 0.000101 * TD.scale,
            thickness: this.gas.size * 0.000101 * TD.scale,
            color: MISC.colorHelper,
            color2: MISC.colorHelper2,
            blending:
              this.gas.blend === BODY.gas.Dust
                ? THREE.NormalBlending
                : THREE.AdditiveBlending,
            transparent: true,
            opacity: this.gas.density,
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
}
