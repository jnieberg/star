import * as THREE from 'three';
import { TD } from '../../variables';
import deleteThree from '../tools/delete';

export default class Body {
  constructor() {
    this.object = {
      low: undefined,
      high: undefined,
      trajectory: undefined,
    };
  }

  setLabel() {
    if (this.visible) {
      if (!this.label) {
        this.label = document.createElement('div');
        this.label.id = 'label-body';
        this.label.classList.add('label-body', `label-${this.type}`);
        this.label.innerHTML = this.textShort;
        document.body.appendChild(this.label);
      }
      this.label.style.transform = `translate(${this.screenPosition.x}px, ${this.screenPosition.y}px)`;
    } else {
      this.removeLabel();
    }
  }

  removeLabel() {
    if (this.label) {
      this.label.remove();
      this.label = undefined;
    }
  }

  get screenPosition() {
    if (this.object) {
      const position = new THREE.Vector3();
      this.object.getWorldPosition(position);
      const p = new THREE.Vector3(position.x, position.y, position.z);
      const vector = p.project(TD.camera.object);
      const width =
        parseInt(TD.renderer.domElement.style.width, 10) ||
        TD.renderer.domElement.width;
      const height =
        parseInt(TD.renderer.domElement.style.height, 10) ||
        TD.renderer.domElement.height;
      vector.x = (vector.x + 1) * width * 0.5;
      vector.y = -(vector.y - 1) * height * 0.5;
      if (vector.z <= 1) {
        return vector;
      }
    }
    return {
      x: -9999,
      y: -9999,
    };
  }

  drawTrajectory({ thickness = 0.5, opacity = 0.25 } = {}) {
    if (this.distance && this.object) {
      const trajectoryGeometry = new THREE.RingBufferGeometry(
        1.0 - thickness / this.distance,
        1.0 + thickness / this.distance,
        128,
        1
      );
      const trajectoryMaterial = new THREE.MeshBasicMaterial({
        color: 0x0044ff,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        transparent: false,
        opacity,
        depthTest: false,
      });
      this.object.trajectory = new THREE.Mesh(
        trajectoryGeometry,
        trajectoryMaterial
      );
      this.object.trajectory.name = `${this.type} trajectory`;
      this.object.trajectory.rotation.x = Math.PI * 0.5;
      this.object.trajectory.scale.set(
        this.distance * 0.0001 * TD.scale,
        this.distance * 0.0001 * TD.scale,
        this.distance * 0.0001 * TD.scale
      );
      this.object.trajectory.castShadow = false;
      this.object.trajectory.receiveShadow = false;
      this.object.trajectory.renderOrder = -99;
      this.parent.object.high.add(this.object.trajectory);
    }
  }

  remove() {
    this.removeLabel();
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    delete this;
  }
}
