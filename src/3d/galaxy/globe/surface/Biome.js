import * as THREE from 'three';

class Biome {
  constructor({ random, land, liquid, glow, show = false }) {
    this.random = random;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'biomeCanvas';
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.land = land;
    this.liquid = liquid;
    this.glow = !!glow;

    if (document.body && show) {
      document.body.appendChild(this.canvas);
    }
  }

  generateTexture(props) {
    this.waterLevel = props.waterLevel;

    this.drawBase();
    this.drawInland();
    this.randomGradientCircles();
    this.drawDetail();
    // this.drawNerfs();
    this.drawRivers();
    this.drawWater();
    this.drawBeach();

    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  drawNerfs() {
    this.random.seed = 'biome_nerfs';
    if (this.random.int(1) === 0) {
      const c = {
        hue: Math.floor(this.liquid.hue * 360),
        saturation: Math.floor(this.liquid.saturation * 100),
        lightness: Math.floor(this.liquid.lightness * 100),
      };
      const opacity = 0.6;
      this.ctx.strokeStyle = `hsla(${Math.round(c.hue)}, ${Math.round(
        c.saturation
      )}%, ${Math.round(c.lightness)}%, ${opacity})`;
      this.ctx.lineWidth = 3;

      const lines = this.random.int(64, 256);
      for (let i = 0; i < lines; i += 1) {
        const x1 = this.random.int(-512, 1024);
        const y1 = this.random.int(-512, 1024);
        const x2 = this.random.int(-256, 256);
        const y2 = this.random.int(-256, 256);
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1 + x2, y1 + y2);
        this.ctx.moveTo(x1 - 512, y1);
        this.ctx.lineTo(x1 + x2 - 512, y1 + y2);
        this.ctx.moveTo(x1 + 512, y1);
        this.ctx.lineTo(x1 + x2 + 512, y1 + y2);
        this.ctx.stroke();
      }
    }
  }

  drawBase() {
    if (!this.glow) {
      this.random.seed = 'biome_base';
      this.fillBaseColor();

      for (let i = 0; i < 5; i += 1) {
        const x = 0;
        const y = 0;
        const { width } = this;
        const { height } = this;
        this.randomGradientRect(x, y, width, height);
      }
    }
  }

  drawInland() {
    if (!this.glow) {
      this.random.seed = 'biome_inland';
      this.inlandSize = this.height - this.height * this.waterLevel;

      const x1 = 0;
      const y1 = 0; // this.height - (this.height * this.waterLevel) - this.inlandSize;
      const x2 = 0;
      const y2 = this.height - this.height * this.waterLevel;

      const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

      const c = this.randomLandColor(-30 / 360);
      const c2 = this.randomLandColor(0);
      const c3 = this.randomLandColor(30 / 360);
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
  }

  drawDetail() {
    if (!this.glow) {
      this.random.seed = 'biome_detail';
      // land detail
      const landDetail = this.random.int(5);
      // landDetail = 20;
      // console.log("landDetail = " + landDetail);
      for (let i = 0; i < landDetail; i += 1) {
        const x1 = this.random.float(0, this.width);
        const y1 = this.random.float(0, this.height);
        const x2 = this.random.float(0, this.width);
        const y2 = this.random.float(0, this.height);
        const width = x2 - x1;
        const height = y2 - y1;

        // this.randomGradientStrip(0, 0, this.width, this.height);
        this.randomGradientStrip(x1, y1, width, height);
      }
    }
  }

  randomGradientStrip(x, y, width, height) {
    const x1 = this.random.float(0, this.width);
    const y1 = this.random.float(0, this.height);
    const x2 = this.random.float(0, this.width);
    const y2 = this.random.float(0, this.height);

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    const c = this.randomLandColor();
    gradient.addColorStop(
      this.random.float(0, 0.5),
      `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`
    );
    gradient.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`);
    gradient.addColorStop(
      this.random.float(0.5, 1.0),
      `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  fillBaseColor() {
    this.baseColor = new THREE.Color().setHSL(
      this.land.hue,
      this.land.saturation,
      this.land.lightness
    );
    this.ctx.fillStyle = Biome.toCanvasColor(this.baseColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  randomGradientRect(x, y, width, height) {
    const x1 = this.random.float(0, this.width);
    const y1 = this.random.float(0, this.height);
    const x2 = this.random.float(0, this.width);
    const y2 = this.random.float(0, this.height);

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    const c = this.randomLandColor();
    gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`);
    gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 1.0)`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  drawBeach() {
    if (!this.glow) {
      this.random.seed = 'biome_beach';
      this.beachSize = this.random.float(0, 16);

      const x1 = 0;
      const y1 =
        this.height - this.height * this.waterLevel - this.beachSize * 0.5;
      const x2 = 0;
      const y2 =
        this.height - this.height * this.waterLevel + this.beachSize * 0.5;

      const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

      const c = this.randomLandColor();
      const c2 = {
        hue: Math.floor(this.liquid.hue * 360),
        saturation: Math.floor(this.liquid.saturation * 100),
        lightness: Math.floor(this.liquid.lightness * 100),
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
        `hsla(${Math.round(c2.hue)}, ${Math.round(
          c2.saturation
        )}%, ${Math.round(c2.lightness)}%, 0.0)`
      );

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x1, y1, this.width, this.beachSize * 3);
    }
  }

  drawWater() {
    this.random.seed = 'biome_water';
    const x1 = 0;
    const y1 = this.height - this.height * this.waterLevel;
    const x2 = 0;
    const y2 = this.height;

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    // const c = this.randomLandColor();
    // const c = this.randomWaterColor();
    const c = {
      hue: Math.floor(this.liquid.hue * 360),
      saturation: Math.floor(this.liquid.saturation * 100),
      lightness: Math.floor(this.liquid.lightness * 100),
    };
    const opacity = this.glow ? 0.2 : 1;
    const opacity2 = this.glow ? 0.4 : 1;
    const opacity3 = this.glow ? 0.6 : 1;
    const opacity4 = this.glow ? 0.8 : 1;
    const opacity5 = this.glow ? 1 : 1;
    const hue = Math.round(c.hue + (this.glow ? -20 : 0) + 360) % 360;
    const hue2 = Math.round(c.hue + (this.glow ? -10 : 0) + 360) % 360;
    const hue3 = Math.round(c.hue + (this.glow ? 0 : 0) + 360) % 360;
    const hue4 = Math.round(c.hue + (this.glow ? 10 : 0) + 360) % 360;
    const hue5 = Math.round(c.hue + (this.glow ? 20 : 0) + 360) % 360;
    const saturation = Math.round(c.saturation + (this.glow ? 0 : 0));
    const saturation2 = Math.round(c.saturation + (this.glow ? 10 : 0));
    const saturation3 = Math.round(c.saturation + (this.glow ? 20 : 0));
    const saturation4 = Math.round(c.saturation + (this.glow ? 30 : 0));
    const saturation5 = Math.round(c.saturation + (this.glow ? 50 : 0));
    const lightness = Math.round(c.lightness * (this.glow ? 0.8 : 1.0));
    const lightness2 = Math.round(c.lightness * (this.glow ? 0.8 : 0.9));
    const lightness3 = Math.round(c.lightness * (this.glow ? 0.8 : 0.8));
    const lightness4 = Math.round(c.lightness * (this.glow ? 0.8 : 0.7));
    const lightness5 = Math.round(c.lightness * (this.glow ? 0.8 : 0.6));
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
      this.random.seed = 'biome_rivers';
      const c = {
        hue: Math.floor(this.liquid.hue * 360),
        saturation: Math.floor(this.liquid.saturation * 100),
        lightness: Math.floor(this.liquid.lightness * 100),
      };
      const opacity = 0.9;
      // this.ctx.strokeStyle = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0.5)';
      this.ctx.strokeStyle = `hsla(${Math.round(c.hue)}, ${Math.round(
        c.saturation
      )}%, ${Math.round(c.lightness)}%, ${opacity})`;
      this.ctx.lineWidth = 1;
      let x = this.random.float(0, this.width);
      let y = this.random.float(0, this.height);
      let prevX = x;
      let prevY = y;
      const riverLength = this.random.float(0, 8);

      for (let i = 0; i < riverLength; i += 1) {
        x = this.random.float(0, this.width);
        y = this.random.float(0, this.height);

        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        prevX = x;
        prevY = y;
      }
    }
  }

  randomGradientCircles() {
    if (!this.glow) {
      this.random.seed = 'biome_circles';
      const numCircles = this.random.int(50, 100);
      for (let i = 0; i < numCircles; i += 1) {
        const x1 = this.random.float(0, this.width);
        const y1 =
          this.random.float(0, this.height) - this.height * this.waterLevel;
        const size = this.random.float(1, 20);
        const x2 = x1;
        const y2 = y1;
        const r1 = 0;
        const r2 = size;

        const gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);

        const c = this.randomLandColor();

        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1.0)`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }
    }
  }

  randomLandColor(hueOff = 0.0) {
    this.random.seed = 'biome_land';
    const newColor = new THREE.Color();
    const hsl = {
      hue: this.land.hue + hueOff,
      saturation: this.land.saturation + this.random.float(-0.1, 0.1),
      lightness: this.land.lightness + this.random.float(-0.1, 0.1),
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
}
export default Biome;
