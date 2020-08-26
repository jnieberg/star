import * as THREE from 'three';
import { MISC } from '../variables';

export default class Thing {
  constructor(id) {
    this.id = id;
    // MISC.things.add({
    //   id,
    //   thing: this,
    //   overwrite: true
    // });
  }

  geometry(GeometryClass) {
    this.geometry = GeometryClass;
    return this;
  }

  material(materialClass, params) {
    this.material = materialClass;
    this.material = Thing.setParameters(this.material, params);
    return this;
  }

  mesh(params) {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh = Thing.setParameters(this.mesh, params);
    return this;
  }

  add(parent) {
    parent.add(this.mesh);
    return this;
  }

  remove() {
    MISC.things.remove(this.id);
    return this;
  }

  static setParameters(objA, params) {
    const obj = objA;
    Object.keys(params).forEach((p) => {
    // for (let p = 0; p < Object.keys(params).length; p += 1) {
      const param = params[p];
      try {
        // eslint-disable-next-line no-eval
        eval(`obj.${p} = param`);
      } catch (error) {
        console.error(`Evaluation error in class Thing, method setParameters(). Not possible to assign variable "obj.${p} = params[p]"`);
      }
    });
    return obj;
  }
}
