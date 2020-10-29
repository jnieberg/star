import * as THREE from 'three';

class Biome {
  constructor({ metal, fluid, glow }) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'biomeCanvas';
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.metal = metal;
    this.fluid = fluid;
    this.glow = glow;

    // if (document.body) {
    //   document.body.appendChild(this.canvas);
    // }
  }

  generateTexture(props) {
    this.waterLevel = props.waterLevel;

    // const h = Biome.randRange(0.0, 1.0);
    // const s = Biome.randRange(0.0, 0.7);
    // const l = Biome.randRange(0.0, 0.6);
    if (!this.glow) {
      this.baseColor = new THREE.Color().setHSL(
        this.metal.hue,
        this.metal.saturation,
        this.metal.lightness
      );
    }
    this.colorAngle = Biome.randRange(0.2, 0.4);
    this.satRange = Biome.randRange(0.3, 0.5);
    this.lightRange = Biome.randRange(0.3, 0.5);
    this.circleSize = Biome.randRange(0.03, 0.25);
    // this.circleSize = 100;

    if (!this.glow) {
      this.drawBase();
      this.drawInland();

      // circles
      let numCircles = Math.round(Biome.randRange(50, 100));
      numCircles = 100;
      for (let i = 0; i < numCircles; i += 1) {
        this.randomGradientCircle();
      }

      this.drawDetail();
    }
    this.drawRivers();
    this.drawWater();
    if (!this.glow) {
      this.drawBeach();
    }

    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  drawBase() {
    this.fillBaseColor();

    for (let i = 0; i < 5; i += 1) {
      const x = 0;
      const y = 0;
      const { width } = this;
      const { height } = this;
      this.randomGradientRect(x, y, width, height);
    }
  }

  drawDetail() {
    // land detail
    const landDetail = Math.round(Biome.randRange(0, 5));
    // landDetail = 20;
    // console.log("landDetail = " + landDetail);
    for (let i = 0; i < landDetail; i += 1) {
      const x1 = Biome.randRange(0, this.width);
      const y1 = Biome.randRange(0, this.height);
      const x2 = Biome.randRange(0, this.width);
      const y2 = Biome.randRange(0, this.height);
      const width = x2 - x1;
      const height = y2 - y1;

      // this.randomGradientStrip(0, 0, this.width, this.height);
      this.randomGradientStrip(x1, y1, width, height);
    }
  }

  randomCircle() {
    const x = Biome.randRange(0, this.width);
    const y = Biome.randRange(0, this.height);
    const rad = Biome.randRange(0, 10);
    // rad = 3;

    const c = this.randomMetalColor();
    this.ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`;
    // this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.arc(x, y, rad, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  randomGradientStrip(x, y, width, height) {
    const x1 = Biome.randRange(0, this.width);
    const y1 = Biome.randRange(0, this.height);
    const x2 = Biome.randRange(0, this.width);
    const y2 = Biome.randRange(0, this.height);

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    const c = this.randomMetalColor();
    gradient.addColorStop(
      Biome.randRange(0, 0.5),
      `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`
    );
    gradient.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`);
    gradient.addColorStop(
      Biome.randRange(0.5, 1.0),
      `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  fillBaseColor() {
    if (!this.glow) {
      this.ctx.fillStyle = Biome.toCanvasColor(this.baseColor);
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  randomGradientRect(x, y, width, height) {
    const x1 = Biome.randRange(0, this.width);
    const y1 = Biome.randRange(0, this.height);
    const x2 = Biome.randRange(0, this.width);
    const y2 = Biome.randRange(0, this.height);

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    const c = this.randomMetalColor();
    gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`);
    gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 1.0)`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  drawBeach() {
    this.beachSize = Biome.randRange(0, 16);

    const x1 = 0;
    const y1 =
      this.height - this.height * this.waterLevel - this.beachSize * 0.5;
    const x2 = 0;
    const y2 =
      this.height - this.height * this.waterLevel + this.beachSize * 0.5;

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    const c = this.randomMetalColor();
    const c2 = {
      hue: Math.floor(this.fluid.hue * 360),
      saturation: Math.floor(this.fluid.saturation * 100),
      lightness: Math.floor(this.fluid.lightness * 100),
    };
    gradient.addColorStop(
      0.0,
      `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, 1.0)`
    );
    gradient.addColorStop(
      0.4,
      `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, 1.0)`
    );
    gradient.addColorStop(
      0.6,
      `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, 0.5)`
    );
    gradient.addColorStop(
      1.0,
      `hsla(${Math.round(c2.hue)}, ${Math.round(c2.saturation)}%, ${Math.round(
        c2.lightness
      )}%, 0.0)`
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.beachSize * 3);
  }

  drawInland() {
    this.inlandSize = this.height - this.height * this.waterLevel;

    const x1 = 0;
    const y1 = 0; // this.height - (this.height * this.waterLevel) - this.inlandSize;
    const x2 = 0;
    const y2 = this.height - this.height * this.waterLevel;

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    const c = this.randomMetalColor(-0.2);
    const c2 = this.randomMetalColor(0);
    const c3 = this.randomMetalColor(0.2);
    const falloff = 0.5;
    const falloff1 = 0.75;
    const falloff2 = 1.0;
    const falloff3 = 1.2;
    gradient.addColorStop(
      0.0,
      `hsla(${Math.round(c.hue)}, ${Math.round(
        c.saturation * falloff
      )}%, ${Math.round(c.lightness * falloff1)}%, 1.0)`
    );
    gradient.addColorStop(
      0.3,
      `hsla(${Math.round(c2.hue)}, ${Math.round(
        c2.saturation * falloff1
      )}%, ${Math.round(c2.lightness * falloff2)}%, 1.0)`
    );
    gradient.addColorStop(
      0.7,
      `hsla(${Math.round(c2.hue)}, ${Math.round(
        c2.saturation * falloff2
      )}%, ${Math.round(c2.lightness * falloff3)}%, 1.0)`
    );
    gradient.addColorStop(
      1.0,
      `hsla(${Math.round(c3.hue)}, ${Math.round(
        c3.saturation * falloff3
      )}%, ${Math.round(c3.lightness * falloff3)}%, 1.0)`
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.inlandSize);
  }

  drawWater() {
    const x1 = 0;
    const y1 = this.height - this.height * this.waterLevel;
    const x2 = 0;
    const y2 = this.height;

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    // const c = this.randomMetalColor();
    // const c = this.randomWaterColor();
    const c = {
      hue: Math.floor(this.fluid.hue * 360),
      saturation: Math.floor(this.fluid.saturation * 100),
      lightness: Math.floor(this.fluid.lightness * 100),
    };
    const opacity = this.glow ? 0.2 : 1;
    const opacity2 = this.glow ? 0.4 : 1;
    const opacity3 = this.glow ? 0.6 : 1;
    const opacity4 = this.glow ? 0.8 : 1;
    const opacity5 = this.glow ? 1 : 1;
    const hue = Math.round(c.hue + (this.glow ? 0 : 0)) % 360;
    const hue2 = Math.round(c.hue + (this.glow ? 0 : 0)) % 360;
    const hue3 = Math.round(c.hue + (this.glow ? 0 : 0)) % 360;
    const hue4 = Math.round(c.hue + (this.glow ? 5 : 0)) % 360;
    const hue5 = Math.round(c.hue + (this.glow ? 10 : 0)) % 360;
    const saturation = Math.round(c.saturation + (this.glow ? 0 : 0));
    const saturation2 = Math.round(c.saturation + (this.glow ? 10 : 0));
    const saturation3 = Math.round(c.saturation + (this.glow ? 20 : 0));
    const saturation4 = Math.round(c.saturation + (this.glow ? 30 : 0));
    const saturation5 = Math.round(c.saturation + (this.glow ? 50 : 0));
    const lightness = Math.round(c.lightness * (this.glow ? 1.0 : 1.0));
    const lightness2 = Math.round(c.lightness * (this.glow ? 1.0 : 0.9));
    const lightness3 = Math.round(c.lightness * (this.glow ? 1.0 : 0.8));
    const lightness4 = Math.round(c.lightness * (this.glow ? 1.0 : 0.7));
    const lightness5 = Math.round(c.lightness * (this.glow ? 1.0 : 0.6));
    gradient.addColorStop(
      0.0,
      `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
    );
    gradient.addColorStop(
      0.2,
      `hsla(${hue2}, ${saturation2}%, ${lightness2}%, ${opacity2})`
    );
    gradient.addColorStop(
      0.4,
      `hsla(${hue3}, ${saturation3}%, ${lightness3}%, ${opacity3})`
    );
    gradient.addColorStop(
      0.6,
      `hsla(${hue4}, ${saturation4}%, ${lightness4}%, ${opacity4})`
    );
    gradient.addColorStop(
      0.8,
      `hsla(${hue5}, ${saturation5}%, ${lightness5}%, ${opacity5})`
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.height);
  }

  // rivers
  drawRivers() {
    if (this.waterLevel > 0) {
      const c = {
        hue: Math.floor(this.fluid.hue * 360),
        saturation: Math.floor(this.fluid.saturation * 100),
        lightness: Math.floor(this.fluid.lightness * 100),
      };
      const opacity = 0.9;
      // this.ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.5)';
      this.ctx.strokeStyle = `hsla(${Math.round(c.hue)}, ${Math.round(
        c.saturation
      )}%, ${Math.round(c.lightness)}%, ${opacity})`;

      let x = Biome.randRange(0, this.width);
      let y = Biome.randRange(0, this.height);
      let prevX = x;
      let prevY = y;
      const riverLength = Biome.randRange(0, 8);

      for (let i = 0; i < riverLength; i += 1) {
        x = Biome.randRange(0, this.width);
        y = Biome.randRange(0, this.height);

        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        prevX = x;
        prevY = y;
      }
    }
  }

  randomGradientCircle() {
    const x1 = Biome.randRange(0, this.width);
    const y1 = Biome.randRange(0, this.height) - this.height * this.waterLevel;
    const size = Biome.randRange(10, this.circleSize);
    const x2 = x1;
    const y2 = y1;
    const r1 = 0;
    const r2 = size;

    const gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);

    const c = this.randomMetalColor();

    gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1.0)`);
    gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  randomMetalColor(hueOff = 0.0) {
    // const newColor = this.baseColor.clone();
    // const sOffset = Biome.randRange(-this.satRange, this.satRange);
    // const lOffset = Biome.randRange(-this.lightRange, this.lightRange);

    // const c = new Color();
    // newColor.getHSL(c);
    // c.h = Biome.randRange(0.0, 1.0);
    // c.s += sOffset;
    // c.l += lOffset;
    // if (c.l < 0) {
    //   c.l = Math.abs(c.l) * 0.3;
    // }
    const newColor = new THREE.Color();
    const hsl = {
      hue: this.metal.hue + hueOff, // Biome.randRange(-0.1, 0.1) +
      saturation: this.metal.saturation + Biome.randRange(-0.1, 0.1),
      lightness: this.metal.lightness + Biome.randRange(-0.1, 0.1),
    };
    hsl.hue = (hsl.hue + 100.0) % 1.0;
    newColor.setHSL(hsl.hue, hsl.saturation, hsl.lightness);
    return {
      r: Math.round(newColor.r * 255),
      g: Math.round(newColor.g * 255),
      b: Math.round(newColor.b * 255),
      hue: hsl.hue * 360,
      saturation: hsl.saturation * 100,
      lightness: hsl.lightness * 100,
    };
  }

  static toCanvasColor(c) {
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(
      c.g * 255
    )}, ${Math.round(c.b * 255)}, 1.0)`;
  }

  static randRange(low, high) {
    const range = high - low;
    const n = window.seed.rnd() * range;
    return low + n;
  }

  // static mix(v1, v2, amount) {
  //   const dist = v2 - v1;
  //   return v1 + (dist * amount);
  // }
}

export default Biome;
