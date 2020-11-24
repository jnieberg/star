export default class FadeIn {
  constructor() {
    this._list = [];
  }

  add(obj, speed = 0.01) {
    if (this._list.indexOf((item) => item.object === obj) === -1) {
      if (FadeIn.isShader(obj)) {
        this._list.push({
          object: obj,
          opacity: obj.material.uniforms.opacity.value,
          speed,
        });
        obj.material.uniforms.opacity.value = 0.0;
      } else if (FadeIn.isMaterialList(obj)) {
        this._list.push({
          object: obj,
          opacity: obj.material[0].opacity,
          speed,
        });
        obj.material.forEach((mat) => {
          mat.opacity = 0.0;
        });
      } else if (FadeIn.isMaterial(obj)) {
        this._list.push({
          object: obj,
          opacity: obj.material.opacity,
          speed,
        });
        obj.material.opacity = 0.0;
      }
    }
  }

  update() {
    this._list.forEach((item, index) => {
      if (FadeIn.isShader(item.object)) {
        item.object.material.uniforms.opacity.value += item.speed;
        item.object.material.uniformsNeedUpdate = true;
        if (item.object.material.uniforms.opacity.value >= item.opacity) {
          item.object.material.uniforms.opacity.value = item.opacity;
          this._list.splice(index, 1);
        }
      } else if (FadeIn.isMaterialList(item.object)) {
        item.object.material.forEach((mat) => {
          mat.opacity += item.speed;
          if (mat.opacity >= item.opacity) {
            mat.opacity = item.opacity;
            this._list.splice(index, 1);
          }
        });
      } else if (FadeIn.isMaterial(item.object)) {
        item.object.material.opacity += item.speed;
        if (item.object.material.opacity >= item.opacity) {
          item.object.material.opacity = item.opacity;
          this._list.splice(index, 1);
        }
      }
    });
  }

  static isMaterial(obj) {
    return obj.material && typeof obj.material.opacity !== 'undefined';
  }

  static isMaterialList(obj) {
    return (
      obj.material &&
      obj.material.length > 0 &&
      typeof obj.material[0].opacity !== 'undefined'
    );
  }

  static isShader(obj) {
    return (
      obj.material &&
      obj.material.uniforms &&
      obj.material.uniforms.opacity &&
      typeof obj.material.uniforms.opacity.value !== 'undefined'
    );
  }
}
