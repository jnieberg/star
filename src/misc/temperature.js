export default function toCelcius(kelvin) {
  return `${Math.round(kelvin - 273.25).toLocaleString('en-US')}°C`;
}
