import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { TD } from '../../variables';
import deleteThree from '../tools/delete';

export default class Body {
  constructor({ index, system, parent = system } = {}) {
    if (typeof index !== 'undefined') this.index = index;
    if (typeof system !== 'undefined') this.system = system;
    if (typeof parent !== 'undefined') this.parent = parent;
    this.object = {
      low: undefined,
      high: undefined,
      trajectory: undefined,
    };
  }

  get id() {
    const id = typeof this.parent.id !== 'undefined' ? this.parent.id : [];
    id.push(this.index);
    return id;
  }

  get distanceToCamera() {
    if (this.object) {
      const position = new THREE.Vector3();
      this.object.getWorldPosition(position);
      return TD.camera.distanceTo(position);
    }
    return 99999999;
  }

  get star() {
    return this.ancestor('star');
  }

  get subStar() {
    return this.ancestor('sub-star');
  }

  ancestor(type) {
    let ancestor = this.parent.type === type && this.parent; // get parent
    ancestor = // get grandparent
      ancestor ||
      (this.parent.parent &&
        this.parent.parent.type === type &&
        this.parent.parent);
    ancestor = // get great grandparent
      ancestor ||
      (this.parent.parent.parent &&
        this.parent.parent.parent.type === type &&
        this.parent.parent.parent);
    ancestor = // get sibling
      ancestor ||
      (this.parent.children &&
        this.parent.children.length > 0 &&
        this.parent.children[0].type === type &&
        this.parent.children[0]);
    ancestor = ancestor || (this.parent.ancestor && this.parent.ancestor(type)); // get uncle
    return ancestor || null;
  }

  setLabel(distance = 0.2) {
    if (this.visible && this.distanceToCamera < distance) {
      const opacity = (distance - this.distanceToCamera) * (1.0 / distance);
      if (!this.label) {
        this.labelContainer = document.createElement('div');
        this.labelContainer.classList.add(
          'label-container',
          `label-${this.type}`
        );

        this.labelElement = document.createElement('div');
        this.labelElement.classList.add('label-body', `label-${this.type}`);
        this.labelElement.innerHTML = this.textShort;

        this.labelContainer.appendChild(this.labelElement);

        this.label = new CSS2DObject(this.labelContainer);
        this.label.position.set(0, 0, 0);
        this.object.add(this.label);
      } else {
        this.labelElement.style.opacity = opacity;
      }
    } else {
      this.removeLabel();
    }
  }

  removeLabel() {
    if (this.label) {
      this.labelElement.remove();
      this.labelElement = undefined;
      this.labelContainer.remove();
      this.labelContainer = undefined;
      this.label.remove();
      this.label = undefined;
    }
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
      this.parent.object.add(this.object.trajectory);
    }
  }

  remove() {
    this.removeLabel();
    this.children.forEach((child) => {
      child.remove();
    });
    deleteThree(this.object);
    deleteThree(this.camera); // !!!
    delete this;
  }
}
