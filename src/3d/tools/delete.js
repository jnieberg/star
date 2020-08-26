export default function deleteThree(obj, keepThis = false) {
  if (obj) {
    while (obj.children && obj.children.length > 0) {
      deleteThree(obj.children[0], false);
    }
    if (!keepThis) {
      if (obj.geometry) {
        obj.geometry.dispose();
      }

      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.map((material) => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
      if (obj.texture) {
        obj.texture.dispose();
      }
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    }
  }
}
