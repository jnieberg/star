import * as THREE from 'three';
import { BODY, GLOBE, LAYER, MISC, TD } from '../../../variables';
import setColor, { getColor } from '../../../misc/color';
import toCelcius from '../../../misc/temperature';
import deleteThree from '../../tools/delete';
import getTime from '../../../misc/time';
import GlobeSurface from './surface/GlobeSurface';
import Atmosphere from './Atmosphere';
import Random from '../../../misc/Random';
import radixToSize from '../../../misc/size';
import Word from '../../../misc/Word';
import toPercent from '../../../misc/percent';
import Body from '../Body';
import Thing from '../../../object/Thing';

export default class Globe extends Body {
  constructor({ system, index, parent, type, distance = 0.0 }) {
    super({ index, system, parent });
    this.type = type || (this.parent.type === 'planet' ? 'moon' : 'planet');
    this.random = new Random(
      `${this.type}_${system.key}_${this.grandParentId}_${this.parentId}_${index}`
    );
    this.visible = false;
    this.distanceMin = distance;
    this.surfaceRenders = {
      resolutions: [512], // 1024
      last: undefined,
    };
    // this._info = this.info;
    if (this.type !== 'moon') {
      this._children = this.children;
    }
  }

  get name() {
    if (typeof this._name === 'undefined') {
      this.random.seed = 'name';
      this._name = new Word(this.random);
    }
    return this._name;
  }

  get size() {
    if (typeof this._size === 'undefined') {
      const parentSize = this.parent.size;
      this.random.seed = 'size';
      this._size =
        this.type === 'moon'
          ? parentSize * this.random.float(0.02, 0.2)
          : parentSize * 10 ** this.random.float(-2.0, 0.0) * 0.2;
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

  get distanceStar() {
    if (typeof this._distanceStar === 'undefined') {
      let distance = this.type === 'planet' && this.distance;
      distance =
        distance || (this.parent.type === 'planet' && this.parent.distance);
      this._distanceStar = distance || 0;
    }
    return this._distanceStar;
  }

  get distance() {
    if (typeof this._distance === 'undefined') {
      // let factor = this.type === 'moon' && 0.5; // moon around planet
      // factor =
      //   factor ||
      //   (this.type === 'sub-star' && this.system.special === 'black-hole' && 8); // stars around black hole
      // factor = factor || (this.type === 'sub-star' && 4); // substar around star
      // factor = factor || (this.parent.type === 'sub-star' && 1.5); // planets around a substar
      // factor = factor || (this.parent.type === 'system' && 1.5); // planets in system, without star as parent
      // factor = factor || (this.star.hasSubStar && 4); // planets around star, in a substar system
      // factor = factor || 1.5; // planets around star
      // const size = this.parent.size * factor * 2 + this.distanceMin;
      // this.random.seed = 'distance';
      // factor *= this.index + this.random.float(0.8, 1.2);
      // this._distance = size + (factor ** 2 + 1.0);
      const factor = this.type === 'moon' ? 0.3 : 0.6;
      this._distance =
        this.parent.size * 2 +
        this.parent.size *
          ((this.index + this.random.float(-0.25, 0.25) + 2) * factor) ** 2;
    }
    return this._distance;
  }

  get temperature() {
    if (typeof this._temperature === 'undefined') {
      // const gas = this.gasDensity * 0.6 + 0.4;
      // let temp = [
      //   Math.floor(
      //     (gas * starTemp) /
      //       this.random.float(distanceToStar, distanceToStar * 1.3)
      //   ),
      //   Math.floor(
      //     starTemp /
      //       (1.0 +
      //         gas * this.random.float(distanceToStar, distanceToStar * 1.3))
      //   ),
      // ];
      // temp = temp.sort((a, b) => (a > b ? 1 : -1));
      // this._temperature = {
      //   min: temp[0],
      //   max: temp[1],
      // };
      // this._temperature = Math.floor(
      //   (starTemp * 2) /
      //     (1.0 + this.random.float(distanceToStar * 0.8, distanceToStar * 1.2))
      // );
      const starTemp = this.star.temperature * 1;
      const distanceToStarSurface = this.distanceStar * 1.0; // higher colder
      const idealTemperature = MISC.KELVIN - 25;
      this.random.seed = 'temperature';
      this._temperature =
        Math.floor(
          (starTemp /
            this.random.float(
              distanceToStarSurface * 0.8,
              distanceToStarSurface * 1.2
            ) +
            idealTemperature) /
            5.0
        ) - idealTemperature;
    }
    return this._temperature;
  }

  get info() {
    if (typeof this._info === 'undefined') {
      const infos = [];
      const { level, temperature, gasDensity, gasBlend } = this;
      const [isFreezing, isCold, isModerate, isWarm, isHot] = [
        temperature + MISC.KELVIN < -50,
        temperature + MISC.KELVIN >= -50 && temperature + MISC.KELVIN < 0,
        temperature + MISC.KELVIN >= 0 && temperature + MISC.KELVIN < 50,
        temperature + MISC.KELVIN >= 50 && temperature + MISC.KELVIN < 100,
        temperature + MISC.KELVIN >= 100,
      ];
      const [hasOnlyLand, hasOnlyLiquid] = [level === 0.0, level === 1.0];
      const hasNoAtmosphere = gasDensity === 0.0;
      const hasGoodAtmosphere = gasDensity > 0.5;
      const hasMoist = gasDensity > 0.0 && gasBlend === BODY.gas.Moist;
      const hasDust = gasDensity > 0.0 && gasBlend === BODY.gas.Dust;
      const hasLandAndLiquid = level > 0.0 && level < 1.0;
      const isEarthLike = hasGoodAtmosphere && hasMoist && hasLandAndLiquid;
      const rarePlanet = () => this.random.int(0) === 0 && infos.length === 0;

      if (isFreezing) {
        infos.push(GLOBE.ARCTIC, GLOBE.ICY);
        if (hasOnlyLiquid) infos.push(GLOBE.DIAMOND);
      }
      if (isCold) {
        infos.push(GLOBE.ARCTIC);
        if (isEarthLike) infos.push(GLOBE.TUNDRA);
      }
      if (isModerate) {
        if (isEarthLike)
          infos.push(
            GLOBE.TERRESTRIAL,
            GLOBE.TERRESTRIAL,
            GLOBE.TERRESTRIAL,
            GLOBE.SWAMP,
            GLOBE.TUNDRA,
            GLOBE.SAVANNAH,
            GLOBE.TERRAFORMED
          );
        if (isEarthLike && hasOnlyLand) infos.push(GLOBE.JUNGLE);
        if (hasOnlyLand) infos.push(GLOBE.DESERT);
        if (hasOnlyLiquid) infos.push(GLOBE.OCEAN);
      }
      if (isWarm) {
        infos.push(GLOBE.CHARRED);
        if (isEarthLike) infos.push(GLOBE.SWAMP, GLOBE.SAVANNAH);
        if (isEarthLike && hasOnlyLand) infos.push(GLOBE.DESERT);
        if (hasOnlyLand) infos.push(GLOBE.DESERT);
      }
      if (isHot) {
        infos.push(GLOBE.LAVA);
        if (hasOnlyLand) infos.push(GLOBE.CHARRED);
        if (hasLandAndLiquid) infos.push(GLOBE.CHTHONIAN);
      }
      if (hasOnlyLand && (hasNoAtmosphere || hasDust))
        infos.push(GLOBE.BARREN, GLOBE.IRON, GLOBE.CARBON);

      if (hasOnlyLiquid) infos.push(GLOBE.HELIUM);

      if (rarePlanet()) {
        infos.push(GLOBE.TOXIC, GLOBE.RADIOACTIVE);
      }

      this.random.seed = 'info';
      this._info = infos[this.random.int(infos.length - 1)];

      // console.log('info', this.index, `${this.name}`, this.info, this);
    }
    return this._info;
  }

  get gas() {
    if (typeof this._gas === 'undefined') {
      this._gas = {
        size: 0,
        color: {
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
      };
      const { land, liquid, size } = this;
      this.random.seed = 'gas';
      if (this.gasDensity > 0.0) {
        // const hsl = {
        //   hue: this.random.float(),
        //   saturation: this.random.float(),
        //   lightness:
        //     blend === BODY.gas.Dust
        //       ? this.random.float(0.0, 1.0)
        //       : this.random.float(0.5, 1.0),
        // };
        const color = this.gasBlend === BODY.gas.Dust ? land : liquid;
        this._gas = {
          size: this.random.float(size * 0.1),
          text: getColor(color).text,
          color: {
            hue: color.hue,
            saturation: color.saturation + this.random.float(0, 0.25),
            lightness: color.lightness + this.random.float(0, 0.25),
          },
        };
      }
    }
    return this._gas;
  }

  get gasDensity() {
    this.random.seed = 'gasDensity';
    if (this.random.int(4) > 0) {
      return this.random.float(0.1, 1.0);
    }
    return 0.0;
  }

  get gasBlend() {
    const { level } = this;
    this.random.seed = 'gasBlend';
    let blend = this.random.int(1);
    blend = level === 0.0 ? BODY.gas.Dust : blend;
    blend = level === 1.0 ? BODY.gas.Moist : blend;
    return blend;
  }

  get clouds() {
    if (typeof this._clouds === 'undefined') {
      this.random.seed = 'clouds';
      const lightness = this.random.float(0.05, 0.5);
      const hasClouds = this.random.int(1) === 0;
      if (hasClouds && this.gasDensity > 0) {
        this._clouds = {
          hue: this.gas.color.hue,
          saturation: this.gas.color.saturation,
          lightness: this.gas.color.lightness + lightness,
          density: this.gasDensity,
        };
      } else {
        this._clouds = false;
      }
    }
    return this._clouds;
  }

  get level() {
    if (typeof this._level === 'undefined') {
      this.random.seed = 'level';
      const levelChance = this.random.int(5);
      if (levelChance <= 1) this._level = levelChance;
      else this._level = this.random.float(0.05, 0.95);
    }
    return this._level;
  }

  get liquid() {
    if (typeof this._liquid === 'undefined') {
      const { liquid } = this.info;
      // let hue = [0.0, 1.0];
      // let saturation = [0.0, 1.0];
      // if (this.temperature.min < 273 && this.temperature.max < 273)
      //   hue = getColorRangeByNames('Purple', 'Blue');
      // if (
      //   this.temperature.min >= 273 &&
      //   this.temperature.min < 325 &&
      //   this.temperature.max >= 273 &&
      //   this.temperature.max < 325
      // )
      //   hue = getColorRangeByNames('Blue', 'Green', 'Yellow');
      // if (this.temperature.min >= 325 && this.temperature.max >= 325)
      //   hue = getColorRangeByNames('Yellow', 'Orange', 'Red');
      // if (this.temperature.min < 273 && this.temperature.max >= 325)
      //   saturation = [0.0, 0.3];
      const hue =
        liquid && liquid.hue ? liquid.hue.map((h) => h / 360) : [0.0, 1.0];
      // console.log('liquid', this.index, `${this.name}`, this.info, hue);
      const saturation = (liquid && liquid.saturation) || [0.0, 1.0];
      const lightness = (liquid && liquid.lightness) || [0.0, 1.0];
      this.random.seed = 'liquid';
      const hsl = {
        hue: this.random.float(hue[0], hue[1]),
        saturation: this.random.float(saturation[0], saturation[1]),
        lightness: this.random.float(lightness[0], lightness[1]),
      };
      this._liquid = {
        level: this.level,
        ...getColor(hsl),
      };
    }
    return this._liquid;
  }

  get land() {
    if (typeof this._land === 'undefined') {
      const { land } = this.info;
      // let hue = [0.0, 1.0];
      // let saturation = [0.0, 1.0];
      // if (this.temperature.min < 273 && this.temperature.max < 273)
      //   hue = getColorRangeByNames('Purple', 'Blue');
      // if (
      //   this.temperature.min >= 273 &&
      //   this.temperature.min < 325 &&
      //   this.temperature.max >= 273 &&
      //   this.temperature.max < 325
      // )
      //   hue = getColorRangeByNames('Blue', 'Green', 'Yellow');
      // if (this.temperature.min >= 325 && this.temperature.max >= 325)
      //   hue = getColorRangeByNames('Yellow', 'Orange', 'Red');
      // if (this.temperature.min < 273 && this.temperature.max >= 325)
      //   saturation = [0.0, 0.3];
      const hue = land && land.hue ? land.hue.map((h) => h / 360) : [0.0, 1.0];
      const saturation = (land && land.saturation) || [0.0, 1.0];
      const lightness = (land && land.lightness) || [0.0, 1.0];
      this.random.seed = 'land';
      // const hueFilter = this.random.float(hue.length / 2 - 1);
      // hue = hue.filter((h, i) => i >= hueFilter && i <= hueFilter + 1);
      const hsl = {
        hue: this.random.float(hue[0], hue[1]),
        saturation: this.random.float(saturation[0], saturation[1]),
        lightness: this.random.float(lightness[0], lightness[1]),
      };
      this._land = {
        level: 1.0 - this.level,
        ...getColor(hsl),
      };
    }
    return this._land;
  }

  get glow() {
    const { glow } = this.info;
    this.random.seed = 'glow';
    return glow && this.level > 0.0
      ? this.random.float(0.1, 1.1 - this.level)
      : 0.0;
  }

  get rings() {
    if (this.type === 'planet') {
      const { level, size, land } = this;
      this.random.seed = 'ring';
      if (size > 0.02 && this.random.int(2) === 0 && level < 1.0) {
        return {
          thickness: this.random.float(0.1, 1.0),
          offset: this.random.float(),
          size: size * 2 + this.random.float() * size * 3,
          hue: land.hue + this.random.float(-0.1, 0.1),
          saturation: land.saturation + this.random.float(-0.1, 0.1),
          lightness: land.lightness + this.random.float(-0.1, 0.1),
          opacity: this.random.float(0.25, 1),
        };
      }
    }
    return false;
  }

  get children() {
    if (typeof this._children === 'undefined') {
      const children = [];
      const { size } = this;
      this.random.seed = 'children';
      let childrenLength = this.random.int(Math.sqrt(size) * 10);
      childrenLength = childrenLength < 6 ? childrenLength : 6;
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
    return (this.parent.letter && this.parent.letter.toLowerCase()) || '';
  }

  get textShort() {
    return `<span class="index">${this.index + 1}${this.letter}</span>${
      this.name
    }${
      this.children && this.children.length
        ? ` <i class="hide-info moon">(+${this.children.length})</i>`
        : ''
    }<span class="hide-info">${this.info.climate}</span>`; // this.info.climate
  }

  get text() {
    return `
      <div class="label--h1 ${this.type}">${this.name}</div>
      <div class="label--h2">${this.type === 'moon' ? 'Moon' : 'Planet'} #${
      this.index + 1
    } of ${this.parent.name}</div>
      <div>Size:<span>${radixToSize(this.size)}</span></div>
      <div>Temperature:<span>${toCelcius(this.temperature)}</span></div>
      <div>Climate:<span>${this.info.climate}</span></div>
      ${this.rings ? '<div>Has rings</div>' : ''}
      ${this.clouds ? '<div>Cloudy</div>' : ''}
      <div>&nbsp;</div>
      ${
        this.level < 1.0
          ? `<div>Land: ${toPercent(1.0 - this.level)}<span>${
              this.land.text
            }</span></div>`
          : ''
      }
      ${
        this.level > 0.0
          ? `<div>Liquid: ${toPercent(this.level)}<span>${
              this.liquid.text
            }</span></div>`
          : ''
      }
      ${
        this.gasDensity > 0
          ? `<div>${
              this.gasBlend === BODY.gas.Dust ? 'Dust' : 'Moist'
            }: ${toPercent(this.gasDensity)}<span>${this.gas.text}</span></div>`
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
    const { parent, distance } = this;
    this.random.seed = 'rotation_speed_parent';
    const velocity = (1.0 / parent.size) * distance;
    let speed = parent.type === 'planet' && this.random.float(0.1, 0.15);
    speed =
      speed || (parent.type === 'sub-star' && this.random.float(0.1, 0.15));
    speed = speed || this.random.float(0.1, 0.15);
    return (
      parent.rotationSpeedAroundAxis / (velocity ** 2 * speed) -
      parent.rotationSpeedAroundAxis
    );
  }

  get rotationSpeedAroundAxis() {
    if (typeof this._rotationSpeedAroundAxis === 'undefined') {
      this.random.seed = 'rotation_speed';
      this._rotationSpeedAroundAxis = this.random.float(0.01, 0.2);
    }
    return this._rotationSpeedAroundAxis;
  }

  update() {
    if (this.object && this.object.position) {
      const rotateY = getTime() * this.rotationSpeedAroundParent;
      this.object.position.set(0, 0, 0);
      this.object.rotation.set(0, 0, 0);

      this.random.seed = 'rotation_parent';
      this.object.rotateY(rotateY + this.random.float(2 * Math.PI));
      this.object.translateX(this.distance * 0.0001 * TD.scale);

      this.object.rotation.set(0, 0, 0);
      this.random.seed = 'rotation';
      this.object.rotateY(getTime() * -this.parent.rotationSpeedAroundAxis);
      this.object.rotateZ(this.random.float(2 * Math.PI));
      this.object.rotateX(this.random.float(2 * Math.PI));
      this.object.rotateY(getTime() * this.rotationSpeedAroundAxis);
      if (this.children) {
        for (let c = 0; c < this.children.length; c += 1) {
          const child = this.children[c];
          child.update();
        }
      }
      if (this.type === 'moon') this.setLabel(0.02);
      else this.setLabel();
    }
  }

  setLayer(sub) {
    const obj = (this.object && this.object[sub]) || this.object;
    if (obj) {
      obj.layers.set(LAYER.SYSTEM);
      obj.traverse((child) => {
        child.layers.set(LAYER.SYSTEM);
      });
    }
  }

  drawSurface() {
    if (this.surfaceRenders.resolutions.length > 0 && this.object) {
      const resolution = this.surfaceRenders.resolutions[0];
      const globeSurface = new GlobeSurface({ body: this, resolution });
      globeSurface
        .render({
          biome: this.surfaceRenders.last && this.surfaceRenders.last.biome,
        })
        .then(() => {
          if (this.surfaceRenders.last) {
            deleteThree(this.surfaceRenders.last.ground);
          }
          this.surfaceRenders.resolutions.shift();
          this.surfaceRenders.last = globeSurface;
          this.drawSurface();
          this.object.low.visible = false;
        });
      globeSurface.ground.name = `${this.type} high ${resolution}`;
      this.object.high.add(globeSurface.ground);
      if (globeSurface.clouds) {
        globeSurface.clouds.sphere.name = `${this.type} clouds`;
        globeSurface.clouds.sphereIn.name = `${this.type} clouds inner`;
        this.object.high.add(globeSurface.clouds.sphere);
        this.object.high.add(globeSurface.clouds.sphereIn);
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
      this.object.low.visible = false;
      this.object.trajectory.visible = false;
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
      this.object.low.visible = true;
      this.object.trajectory.visible = true;
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
    // if (this.gas && this.type === 'planet') {
    //   setColor(
    //     2,
    //     this.gas.color.hue,
    //     this.gas.color.saturation,
    //     this.gas.color.lightness,
    //     'hsl'
    //   );
    // }

    // Mix inner and outer color
    // if (this.outer && this.type === 'planet') {
    //   const mix = getColorMix(
    //     this.color.r,
    //     this.color.g,
    //     this.color.b, // mix inner and outer sphere color
    //     this.outer.color.r,
    //     this.outer.color.g,
    //     this.outer.color.b,
    //     this.outer.opacity
    //   );
    //   setColor(1, ...mix);
    // }

    // Planet pivot
    this.object = new THREE.Object3D();
    this.object.name = `${this.type} pivot`;
    this.parent.object.add(this.object); // .high
    this.object.rotation.y = this.random.float(2 * Math.PI) || 0;
    this.object.translateX(this.distance * 0.0001 * TD.scale || 0);

    // Planet low detail sphere
    // const globeSurface = new GlobeSurface({
    //   body: this,
    //   resolution: 32,
    //   detail: 0,
    // });
    // globeSurface.render();
    // this.object.low = globeSurface.ground;
    const color = this.level > 0.5 ? this.liquid : this.land;
    setColor(1, color.hue, color.saturation, color.lightness, 'hsl');
    this.object.low = new Thing()
      .geometry(new THREE.SphereBufferGeometry(this.size, 16, 16))
      .material(new THREE.MeshStandardMaterial({ color: MISC.colorHelper }))
      .mesh({
        name: this.type === 'planet' ? 'Planet low' : 'Moon low',
        castShadow: true,
        receiveShadow: true,
        renderOrder: 0,
        // onBeforeRender: (rend) => rend.clearDepth(),
      })
      .add(this.object);

    this.drawTrajectory({
      thickness: this.parent.size * 0.05,
      opacity: this.type === 'moon' ? 0.15 : 0.25,
    });
    this.object.this = this;
    this.object.low.this = this;

    // Draw moons of planet
    if (this.children && this.children.length) {
      for (let c = 0; c < this.children.length; c += 1) {
        const child = this.children[c];
        child.drawLow();
      }
    }
    return this.object.low;
  }

  drawHigh() {
    if (this.object) {
      this.object.trajectory.visible = false;
      if (this.object.high) {
        this.drawSurface();
        this.showHigh();
      } else {
        this.object.high = new THREE.Object3D();
        this.object.high.name = `${this.type} high pivot`;
        this.object.add(this.object.high);
        this.drawSurface();

        // Planet rings
        if (this.rings) {
          setColor(
            1,
            this.rings.hue,
            this.rings.saturation,
            this.rings.lightness,
            'hsl'
          );
          const { thickness } = this.rings;
          const ringGeometry = new THREE.RingBufferGeometry(
            this.rings.size * (-thickness * 0.00002 + 0.00006) * TD.scale,
            this.rings.size * (thickness * 0.00002 + 0.00006) * TD.scale,
            64
          );
          const ringMaterial = new THREE.MeshStandardMaterial({
            color: MISC.colorHelper,
            map: TD.texture.planet.rings,
            emissive: MISC.colorHelper,
            emissiveMap: TD.texture.planet.rings,
            emissiveIntensity: 0.5,
            opacity: this.rings.opacity,
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
          // ringMesh.onBeforeRender = (rend) => rend.clearDepth();
          this.object.add(ringMesh);
        }

        // Planet gas
        if (this.gasDensity > 0.0) {
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
          const atmosphere = new Atmosphere({
            size: this.size * 0.0001 * TD.scale,
            thickness: this.gas.size * 0.0001 * TD.scale,
            color: MISC.colorHelper,
            color2: MISC.colorHelper2,
            blending:
              this.gasBlend === BODY.gas.Dust
                ? THREE.NormalBlending
                : THREE.AdditiveBlending,
            opacity: this.gasDensity,
          });
          atmosphere.add(this.object.high);
        }
      }
    }
  }
}
