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
    const b = COLOR.lightness[col];
    if (lightness < b) lightnessString = col;
  });
  Object.keys(COLOR.hue).forEach((col) => {
    const h = COLOR.hue[col];
    if (hue - 30 / 360 < h) hueString = col;
  });
  Object.keys(COLOR.saturation).forEach((col) => {
    const h = COLOR.saturation[col];
    if (saturation < h) saturationString = col;
  });
  return {
    hue,
    saturation,
    lightness,
    text: `${saturationString} ${lightnessString} ${hueString}`.replace(
      /^.*(Grey|White|Black).*$/g,
      '$1'
    ),
  };
}

export function getColorRangeByNames(...names) {
  const result = [];
  const redAdd = names.indexOf('Red') > -1 ? 1.0 : 0.0;
  names.forEach((name) => {
    switch (name) {
      case 'Red':
        result.push(COLOR.hue.Purple, COLOR.hue.Red + redAdd);
        break;
      case 'Purple':
        result.push(COLOR.hue.Blue, COLOR.hue.Purple);
        break;
      case 'Blue':
        result.push(COLOR.hue.Green, COLOR.hue.Blue);
        break;
      case 'Green':
        result.push(COLOR.hue.Yellow + redAdd, COLOR.hue.Green + redAdd);
        break;
      case 'Yellow':
        result.push(COLOR.hue.Orange + redAdd, COLOR.hue.Yellow + redAdd);
        break;
      case 'Orange':
        result.push(COLOR.hue.Red + redAdd, COLOR.hue.Orange + redAdd);
        break;
      default:
        break;
    }
  });
  // console.log(names, result, [Math.min(...result), Math.max(...result)]);
  return [Math.min(...result), Math.max(...result)];
}
