import { MISC, COLOR } from '../variables';

export default function setColor(helperNumber, a1, a2, a3, palette) {
  let helper = MISC.colorHelper;
  if (helperNumber === 2) helper = MISC.colorHelper2;
  if (helperNumber === 3) helper = MISC.colorHelper3;
  if (helper) {
    if (palette === 'hsl') {
      helper.setHSL(a1, a2, a3);
    } else {
      helper.setRGB(a1, a2, a3);
    }
    helper.convertSRGBToLinear();
  }
}

export function getColorMix(r1, g1, b1, r2, g2, b2, a) {
  const a1 = 1.0 - a;
  const color = {
    r: r1 * a1 + r2 * a,
    g: g1 * a1 + g2 * a,
    b: b1 * a1 + b2 * a,
  };
  return [color.r, color.g, color.b];
}

export function getColor({ hue, saturation, lightness }) {
  let lightnessString = '';
  let hueString = 'Red';
  let saturationString = '';
  Object.keys(COLOR.lightness).forEach((col) => {
    // for (const col in COLOR.lightness) {
    //  if (COLOR.lightness.hasOwnProperty(col)) {
    const b = COLOR.lightness[col];
    if (lightness < b) {
      lightnessString = col;
    }
    // }
  });
  Object.keys(COLOR.hue).forEach((col) => {
    // for (const col in COLOR.hue) {
    //   if (COLOR.hue.hasOwnProperty(col)) {
    const h = COLOR.hue[col];
    if (hue < h) {
      hueString = col;
    }
    // }
  });
  Object.keys(COLOR.saturation).forEach((col) => {
    // for (const col in COLOR.saturation) {
    //   if (COLOR.saturation.hasOwnProperty(col)) {
    const h = COLOR.saturation[col];
    if (saturation < h) {
      saturationString = col;
    }
    // }
  });
  return {
    hue: {
      valueOf: () => hue,
      text: hueString,
    },
    saturation: {
      valueOf: () => saturation,
      text: saturationString,
    },
    lightness: {
      valueOf: () => lightness,
      text: lightnessString,
    },
    text: `${saturationString} ${lightnessString} ${hueString}`.replace(
      /^.*(Grey|White|Black).*$/g,
      '$1'
    ),
  };
}
