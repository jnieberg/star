import { TD } from '../../variables';

export default function raycastFound(obj, distance, radius) {
  if (obj) {
    TD.raycaster.params.Points.threshold = radius * TD.scale;
    TD.raycaster.setFromCamera({ x: 0, y: 0 }, TD.camera.object); // EVENT.mouse
    let intersects = [];
    if (obj.length) {
      intersects = TD.raycaster.intersectObjects(obj, true);
    } else if (obj.layers) {
      intersects = TD.raycaster.intersectObject(obj, true);
    }
    if (intersects.length > 0 && intersects[0].distance < distance * TD.scale) {
      return intersects[0];
    }
  }
  return null;
}
