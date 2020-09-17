import * as THREE from 'three';
import { TD, EVENT } from '../../variables';
import { resetCamera } from './camera';
import { labelHide } from '../label/label';
import Galaxy from '../galaxy/Galaxy';

function fingersTouching(event) {
  return event.changedTouches && event.changedTouches.length;
}

function getClick(event) {
  return {
    x: (fingersTouching(event) && event.changedTouches[0].clientX) || event.clientX,
    y: (fingersTouching(event) && event.changedTouches[0].clientY) || event.clientY,
  };
}

class FirstPersonControls {
  constructor(object) {
    this.object = object;

    // API
    this.enabled = true;

    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = true;

    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.mouseDragOn = false;

    this.acceleration = true;

    // internals
    this.speedFactorStar = 1.0;
    this.speedFactorPlanet = 1.0;

    this.autoSpeedFactor = 0.0;

    this.mouseX = 0;
    this.mouseY = 0;

    this.moveForward = 0;
    this.moveBackward = 0;
    this.moveLeft = 0;
    this.moveRight = 0;
    this.rotate = false;

    this.accF = 0;
    this.accL = 0;
    this.accU = 0;
    this.accRoll = 0;
    this.actualLookSpeed = 0;

    this.lookDirection = new THREE.Vector3();
    this.spherical = new THREE.Spherical();
    this.target = new THREE.Vector3();

    //

    if (TD.canvas !== document) {
      TD.canvas.setAttribute('tabindex', -1);
    }

    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);

    document.addEventListener('contextmenu', FirstPersonControls.contextmenu, false);
    TD.canvas.addEventListener('mousemove', this._onMouseMove, false);
    TD.canvas.addEventListener('mousedown', this._onMouseDown, false);
    TD.canvas.addEventListener('mouseup', this._onMouseUp, false);
    TD.canvas.addEventListener('touchstart', this._onMouseDown, false);
    TD.canvas.addEventListener('touchend', this._onMouseUp, false);
    TD.canvas.addEventListener('touchmove', this._onMouseMove, false);

    window.addEventListener('keydown', this._onKeyDown, false);
    window.addEventListener('keyup', this._onKeyUp, false);

    this.setOrientation();
  }

  //

  onMouseDown(event) {
    if (TD.canvas !== document) {
      TD.canvas.focus();
    }

    event.preventDefault();
    event.stopPropagation();
    if (this.activeLook) {
      if (event.button === 0) {
        this.moveForward = true;
        this.rotate = true;
      } else if (event.button === 2) {
        this.moveBackward = true;
        this.rotate = true;
      } else if (fingersTouching(event) === 1) { // tablet
        this.moveForward = true;
        this.rotate = true;
      } else if (fingersTouching(event) === 2) { // tablet
        this.moveBackward = true;
        this.rotate = true;
      }
    }

    this.mouseDragOn = true;
  }

  onMouseUp(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.activeLook) {
      if (event.button === 0) {
        this.moveForward = false;
        this.rotate = false;
      } else if (event.button === 2) {
        this.moveBackward = false;
        this.rotate = false;
      } else if (fingersTouching(event) === 1) { // tablet
        this.moveForward = false;
        this.rotate = false;
      } else if (fingersTouching(event) === 2) { // tablet
        this.moveBackward = false;
        this.rotate = false;
      }
    }

    this.mouseDragOn = false;
  }

  onMouseMove(event) {
    // if (TD.canvas === document) {
    const { x, y } = getClick(event);
    this.mouseX = x - window.innerWidth / 2;
    this.mouseY = y - window.innerHeight / 2;
    // } else {
    //   this.mouseX = event.pageX - TD.canvas.offsetLeft - this.viewHalfX;
    //   this.mouseY = event.pageY - TD.canvas.offsetTop - this.viewHalfY;
    // }
  }

  onKeyDown(event) {
    // event.preventDefault();

    switch (event.keyCode) {
      case 38: /* up */
      case 87: /* W */ this.moveForward = true; this.rotate = true; break;

      case 37: /* left */
      case 65: /* A */ this.moveLeft = true; this.rotate = true; break;

      case 40: /* down */
      case 83: /* S */ this.moveBackward = true; this.rotate = true; break;

      case 39: /* right */
      case 68: /* D */ this.moveRight = true; this.rotate = true; break;

      case 82: /* R */ this.moveUp = true; this.rotate = true; break;
      case 70: /* F */ this.moveDown = true; this.rotate = true; break;

      case 81: /* Q */ this.rollLeft = true; this.rotate = true; break;
      case 69: /* E */ this.rollRight = true; this.rotate = true; break;

      default: break;
    }
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 38: /* up */
      case 87: /* W */ this.moveForward = false; this.rotate = false; break;

      case 37: /* left */
      case 65: /* A */ this.moveLeft = false; this.rotate = false; break;

      case 40: /* down */
      case 83: /* S */ this.moveBackward = false; this.rotate = false; break;

      case 39: /* right */
      case 68: /* D */ this.moveRight = false; this.rotate = false; break;

      case 82: /* R */ this.moveUp = false; this.rotate = false; break;
      case 70: /* F */ this.moveDown = false; this.rotate = false; break;

      case 81: /* Q */ this.rollLeft = false; this.rotate = false; break;
      case 69: /* E */ this.rollRight = false; this.rotate = false; break;
      default: break;
    }
  }

  setOrientation() {
    const { quaternion } = this.object;

    this.lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
    this.spherical.setFromVector3(this.lookDirection);
  }

  static contextmenu(event) {
    event.preventDefault();
  }

  // bind(fn, ...args) {
  //   return () => {
  //     fn.apply(this, ...args);
  //   };
  // }

  lookAt(x, y, z) {
    if (x.isVector3) {
      this.target.copy(x);
    } else {
      this.target.set(x, y, z);
    }

    this.object.lookAt(this.target);

    this.setOrientation();

    return this;
  }

  update(delta) {
    if (this.enabled === false) {
      return;
    }

    if (this.heightSpeed) {
      const y = THREE.MathUtils.clamp(this.object.position.y, this.heightMin, this.heightMax);
      const heightDelta = y - this.heightMin;

      this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
    } else {
      this.autoSpeedFactor = 0.0;
    }
    const actualMoveSpeed = delta * this.movementSpeed;
    const brakeFactor = 0.99 ** (delta + 1.0);
    if (!this.acceleration) {
      this.accF = 0;
      this.accL = 0;
      this.accU = 0;
    }
    if (this.moveForward || (this.autoForward && !this.moveBackward)) {
      this.accF = this.acceleration
        ? this.accF - actualMoveSpeed * 0.05
        : -actualMoveSpeed + this.autoSpeedFactor;
    }
    if (this.moveBackward) {
      this.accF = this.acceleration ? this.accF + actualMoveSpeed * 0.05 : actualMoveSpeed;
    }

    if (this.moveLeft) {
      this.accL = this.acceleration ? this.accL - actualMoveSpeed * 0.05 : -actualMoveSpeed;
    }
    if (this.moveRight) {
      this.accL = this.acceleration ? this.accL + actualMoveSpeed * 0.05 : actualMoveSpeed;
    }

    if (this.moveUp) {
      this.accU = this.acceleration ? this.accU + actualMoveSpeed * 0.05 : actualMoveSpeed;
    }
    if (this.moveDown) {
      this.accU = this.acceleration ? this.accU - actualMoveSpeed * 0.05 : -actualMoveSpeed;
    }

    if (this.rollLeft) {
      this.accRoll = this.acceleration ? this.accRoll + 0.0005 : actualMoveSpeed;
    }
    if (this.rollRight) {
      this.accRoll = this.acceleration ? this.accRoll - 0.0005 : -actualMoveSpeed;
    }

    this.object.translateZ(this.accF * this.speedFactorStar * this.speedFactorPlanet);
    this.object.translateX(this.accL * this.speedFactorStar * this.speedFactorPlanet);
    this.object.translateY(this.accU * this.speedFactorStar * this.speedFactorPlanet);
    this.object.rotateZ(this.accRoll);
    this.accF *= brakeFactor;
    this.accL *= brakeFactor;
    this.accU *= brakeFactor;
    this.accRoll *= brakeFactor;

    if (this.rotate) {
      this.actualLookSpeed = delta * this.lookSpeed;
    } else {
      this.actualLookSpeed *= brakeFactor;
    }
    if (!this.activeLook) {
      this.actualLookSpeed = 0;
    }

    let verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
    }
    if (this.lookVertical) {
      this.object.rotateX(-this.mouseY * this.actualLookSpeed * verticalLookRatio * 0.02);
    }
    this.object.rotateY(-this.mouseX * this.actualLookSpeed * 0.02);
  }

  dispose() {
    document.removeEventListener('contextmenu', FirstPersonControls.contextmenu, false);
    TD.canvas.removeEventListener('mousemove', this._onMouseMove, false);
    TD.canvas.removeEventListener('mousedown', this._onMouseDown, false);
    TD.canvas.removeEventListener('mouseup', this._onMouseUp, false);
    TD.canvas.removeEventListener('touchstart', this._onMouseDown, false);
    TD.canvas.removeEventListener('touchend', this._onMouseUp, false);
    TD.canvas.removeEventListener('touchmove', this._onMouseMove, false);

    window.removeEventListener('keydown', this._onKeyDown, false);
    window.removeEventListener('keyup', this._onKeyUp, false);
  }
}

export default function initControls() {
  TD.clock = new THREE.Clock();
  EVENT.controls = new FirstPersonControls(TD.camera.object);
  EVENT.controls.acceleration = true;
  EVENT.controls.movementSpeed = 10 * TD.scale;
  EVENT.controls.lookSpeed = 0.1;
}

export function to3DCoordinate(x, y) {
  const width = 2.5 * TD.camera.near * x * TD.scale;
  const height = 1.4 * TD.camera.near * y * TD.scale;
  return new THREE.Vector3(width, height, -2.0 * TD.camera.near * TD.scale);
}

export function getMouse(event) {
  const { x, y } = getClick(event);
  EVENT.mouse2d.x = x;
  EVENT.mouse2d.y = y;
  EVENT.mouse.x = (x / window.innerWidth) * 2 - 1;
  EVENT.mouse.y = -(y / window.innerHeight) * 2 + 1;
}

export function getKeys(e) {
  switch (e.which) {
    case 49: // 1
      labelHide();
      EVENT.controls.speedFactorStar = 1.0;
      EVENT.controls.speedFactorPlanet = 1.0;
      EVENT.controls.accF = 0;
      EVENT.controls.accL = 0;
      EVENT.controls.accU = 0;
      TD.galaxy.remove();
      TD.galaxy = new Galaxy();
      if (TD.system) {
        TD.system.remove();
      }
      TD.system = undefined;
      TD.star = undefined;
      TD.planet = undefined;
      TD.moon = undefined;
      TD.label = undefined;
      resetCamera();
      break;
    default: break;
  }
}
