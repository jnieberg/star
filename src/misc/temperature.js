import { MISC } from '../variables';

export default function toCelcius(kelvin) {
  return `${Math.round(kelvin + MISC.KELVIN).toLocaleString('en-US')}°C`;
}
