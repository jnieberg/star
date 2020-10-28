/* eslint-disable no-eval */
import * as THREE from 'three';

import { MISC, TD } from '../../variables';

export default class Store {
  static get(id, id2) {
    let data = localStorage.getItem(id);
    data = JSON.parse(data);
    if (id2 && data && eval(`data.${id2}`)) {
      return eval(`data.${id2}`);
    }
    if (!id2 && data) {
      return data;
    }
    return null;
  }

  static loadCoordinate() {
    // let data = localStorage.getItem('camera');
    // data = JSON.parse(data);
    // if (data && data.coordinate && data.position && data.rotation) {
    //   const quaternion = new THREE.Quaternion(
    //     data.rotation.x,
    //     data.rotation.y,
    //     data.rotation.z,
    //     data.rotation.w
    //   );
    //   TD.camera.coordinate = data.coordinate;
    //   TD.camera.object.position.set(
    //     data.position.x,
    //     data.position.y,
    //     data.position.z
    //   );
    //   TD.camera.object.rotation.setFromQuaternion(quaternion);
    //   MISC.reload = true;
    // } else {
    //   TD.camera.reset();
    // }
    const coordinate = Store.get('data', 'coordinate');
    if (coordinate) {
      TD.camera.coordinate = coordinate;
      MISC.reload = true;
    } else {
      TD.camera.reset();
    }
  }

  static loadPosition() {
    const position = Store.get('data', 'position');
    if (position) {
      const quaternion = new THREE.Quaternion(
        position._x,
        position._y,
        position._z,
        position._w
      );
      TD.camera.object.position.set(position.x, position.y, position.z);
      // TD.camera.object.rotation.set(position._x, position._y, position._z);
      TD.camera.object.rotation.setFromQuaternion(quaternion);
    } else {
      TD.camera.reset();
    }
  }

  static loadSystem() {
    if (MISC.loaded === 1) {
      const ids = Store.get('data', 'orbit.id');
      if (ids) {
        const body = TD.system.getBodyByIds(ids);
        if (body) {
          TD.camera.parent = body.object;
        }
        const position = Store.get('data', 'orbit.position');
        if (position) {
          TD.camera.object.position.set(position.x, position.y, position.z);
          TD.camera.object.rotation.set(position._x, position._y, position._z);
        }
      }
      MISC.loaded = 2;
    }
  }

  static loadTime() {
    MISC.loaded = 1;
    setTimeout(() => {
      MISC.timeStart = Date.now() - (Number(Store.get('time')) || 0);
      MISC.loaded = 2;
    }, 2000);
  }

  static save() {
    // const coord = TD.camera.universe;
    // localStorage.setItem(
    //   'camera',
    //   JSON.stringify({
    //     coordinate: TD.camera.coordinate,
    //     position: { x: coord.x, y: coord.y, z: coord.z },
    //     rotation: {
    //       x: coord._x,
    //       y: coord._y,
    //       z: coord._z,
    //       w: coord._w,
    //     },
    //   })
    // );
    const data = {
      coordinate: TD.camera.coordinate,
      position: { ...TD.camera.universe },
      orbit: {
        position: {
          ...TD.camera.object.position,
          ...TD.camera.object.rotation,
        },
      },
    };
    if (TD.camera.orbit) {
      data.orbit.id = TD.camera.orbit.id;
    }
    localStorage.setItem('data', JSON.stringify(data));
    localStorage.setItem('time', Date.now() - MISC.timeStart);
  }
}
