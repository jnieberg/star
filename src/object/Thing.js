import * as THREE from 'three';
import { MISC, TD } from '../variables';

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

  material(materialClass, params = {}) {
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
    this.mesh.thing = this;
    TD.fade.add(this.mesh);
    parent.add(this.mesh);
    return this.mesh;
  }

  remove() {
    MISC.things.remove(this.id);
    return this;
  }

  static setParameters(objA, params) {
    const obj = objA;
    Object.keys(params).forEach((p) => {
      // eslint-disable-next-line no-unused-vars
      const param = params[p];
      try {
        // eslint-disable-next-line no-eval
        eval(`obj.${p} = param`);
      } catch (error) {
        console.error(
          `Evaluation error in class Thing, method setParameters(). Not possible to assign to variable "obj.${p} = params[p]"`
        );
      }
    });
    return obj;
  }
}
