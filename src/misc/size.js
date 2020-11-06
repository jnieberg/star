export default function radixToSize(r) {
  return `${Math.round(r * 695700).toLocaleString('en-US')}km`;
}
