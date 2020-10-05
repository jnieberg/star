import { TD, MISC } from '../../variables';
import {
  getCoordinateOffset,
  setCameraPosition,
  updateCameraCoordinatesByOffset,
} from '../init/camera';
import Entity from './Entity';

export default class Galaxy {
  constructor() {
    this.star = new Entity({
      type: 'system',
      buffered: 'sprite',
      galaxy: this,
      texture: TD.texture.star.small,
    });
    this.nebula = new Entity({
      type: 'nebula',
      galaxy: this,
      texture: TD.texture.misc.nebula,
    });
    // console.log(this);
  }

  update(off = { x: 0, y: 0, z: 0 }) {
    if (this.star) this.star.update(off);
    if (this.nebula) this.nebula.update(off);
    if (TD.system) {
      TD.system.update();
    }
  }

  draw() {
    if (MISC.reload || Galaxy.newEntitiesCanBeRendered()) {
      MISC.reload = false;
      updateCameraCoordinatesByOffset();
      const coord = TD.camera.coordinate;
      if (this.star) {
        this.star.draw(
          { coordx: coord.x, coordy: coord.y, coordz: coord.z },
          () => {
            if (this.nebula) {
              this.nebula.draw(
                { coordx: coord.x, coordy: coord.y, coordz: coord.z },
                () => {
                  const off = setCameraPosition();
                  this.update(off);
                }
              );
            }
          }
        );
      }
    }
    // this.update();
  }

  remove() {
    this.star.remove();
    if (this.nebula) this.nebula.remove();
  }

  static newEntitiesCanBeRendered(config) {
    const offset = getCoordinateOffset(config);
    return offset.x !== 0 || offset.y !== 0 || offset.z !== 0;
  }
}
