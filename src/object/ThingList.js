export default class ThingList {
  constructor() {
    this.things = {};
  }

  add({ id, thing, overwrite = false }) {
    if (overwrite || !this.things[id]) {
      this.remove(id);
      this.things[id] = thing;
    }
    return this.things[id];
  }

  remove(id, meshA) {
    const mesh = meshA || (this.things[id] ? this.things[id].mesh : undefined);
    if (mesh) {
      while (mesh.children && mesh.children.length > 0) {
        this.remove(id, mesh.children[0]);
      }
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.map((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      }
      if (mesh.texture) {
        mesh.texture.dispose();
      }
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
      this.things[id] = undefined;
    }
  }

  hasObject(id) {
    return Object.keys(this.things).indexOf(id) === -1;
  }
}
