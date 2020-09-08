import { MISC } from '../variables';

export default function getTime() {
  return (Date.now()) * MISC.time;
}
