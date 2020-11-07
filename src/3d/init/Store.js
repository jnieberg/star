/* eslint-disable no-eval */
import * as THREE from 'three';

import { MISC, TD } from '../../variables';

export default class Store {
  static get(id, id2) {
    const query = new URLSearchParams(window.location.search);
    let data = query.get('data');
    if (!data) {
      data = localStorage.getItem(id);
    }
    try {
      data = JSON.parse(data);
    } catch (err) {
      data = {};
    }
    if (id2 && data && eval(`data.${id2}`)) {
      return eval(`data.${id2}`);
    }
    if (!id2 && data) {
      return data;
    }
    return null;
  }

  static set() {
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
    let data = {
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
    data = JSON.stringify(data);
    const query = new URLSearchParams(window.location.search);
    query.set('data', data);
    const newPath = `${window.location.pathname}?${data}`;
    window.history.pushState(null, '', newPath);
    localStorage.setItem('data', data);
    // localStorage.setItem('time', Date.now() - MISC.timeStart);
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
    } else {
      TD.camera.reset();
    }
    MISC.reload = true;
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
    if (!MISC.loaded) {
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
      MISC.loaded = true;
    }
  }

  static timeout() {
    setTimeout(() => {
      MISC.loaded = true;
    }, 2000);
  }
}
