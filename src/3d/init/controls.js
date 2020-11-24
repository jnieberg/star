import * as THREE from 'three';
import { TD, EVENT, MISC } from '../../variables';
import { labelHide } from '../label/label';
import Galaxy from '../galaxy/Galaxy';

function isMobile() {
  return window.innerWidth <= 1024;
}

class Controls {
  constructor(object) {
    this.object = object;

    // API
    this.enabled = true;

    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;

    this.lookVertical = true;
    this.autoForward = false;

    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

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
    this.rotating = false;

    this.accF = 0;
    this.accL = 0;
    this.accU = 0;
    this.accRoll = 0;
    this.actualLookSpeed = 0;

    this.lookDirection = new THREE.Vector3();
    this.spherical = new THREE.Spherical();
    this.target = new THREE.Vector3();

    if (TD.canvas !== document) {
      TD.canvas.setAttribute('tabindex', -1);
    }

    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);

    document.addEventListener('contextmenu', Controls.contextmenu, false);
    document.addEventListener('mousemove', this._onMouseMove, false);
    document.addEventListener('mousedown', this._onMouseDown, false);
    document.addEventListener('mouseup', this._onMouseUp, false);
    document.addEventListener('touchstart', this._onMouseDown, false);
    document.addEventListener('touchend', this._onMouseUp, false);
    document.addEventListener('touchmove', this._onMouseMove, false);

    window.addEventListener('keydown', this._onKeyDown, false);
    window.addEventListener('keyup', this._onKeyUp, false);

    this.setOrientation();
  }

  static getMouseActions(event) {
    let action = {
      forward: event.button === 0,
      backward: event.button === 2,
      left: false,
      right: false,
      rollLeft: false,
      rollRight: false,
      rotate: {
        x: event.clientX - window.innerWidth / 2,
        y: event.clientY - window.innerHeight / 2,
      },
    };
    if (isMobile()) {
      const { target } = event;
      if (target) {
        const bound = target.getBoundingClientRect();
        action = {
          forward: target.id === 'control-forward',
          backward: target.id === 'control-backward',
          left: target.id === 'control-left',
          right: target.id === 'control-right',
          rollLeft: target.id === 'control-roll-left',
          rollRight: target.id === 'control-roll-right',
          rotate: target.id === 'control-rotate' && {
            x:
              ((event.pageX - bound.left) / bound.width) * window.innerWidth -
              window.innerWidth / 2,
            y:
              ((event.pageY - bound.top) / bound.height) * window.innerWidth -
              window.innerWidth / 2,
          },
        };
      }
    }
    return action;
  }

  setRotateKnob(event) {
    if (!event || event.target.id === 'control-rotate') {
      if (this.mouseX / window.innerWidth < -0.5)
        this.mouseX = -window.innerWidth / 2;
      if (this.mouseY / window.innerHeight < -0.5)
        this.mouseY = -window.innerHeight / 2;
      if (this.mouseX / window.innerWidth > 0.5)
        this.mouseX = window.innerWidth / 2;
      if (this.mouseY / window.innerHeight > 0.5)
        this.mouseY = window.innerHeight / 2;
      const knob = document.querySelector('#control-rotate > span');
      knob.style.transform = `translate(${
        (this.mouseX / window.innerWidth) * 14 + 7
      }vmax, ${(this.mouseY / window.innerHeight) * 14 + 7}vmax)`;
    }
  }

  onMouseDown(event) {
    if (TD.canvas !== document) {
      TD.canvas.focus();
    }
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    const events = (event.touches && [...event.touches]) || [event];
    for (let e = 0; e < events.length; e += 1) {
      const action = Controls.getMouseActions(events[e]);
      if (action.forward) {
        this.moveForward = true;
        this.rotate = true;
      } else if (action.backward) {
        this.moveBackward = true;
        this.rotate = true;
      } else if (action.left) {
        this.moveLeft = true;
        this.rotate = true;
      } else if (action.right) {
        this.moveRight = true;
        this.rotate = true;
      } else if (action.rollLeft) {
        this.rollLeft = true;
        this.rotate = true;
      } else if (action.rollRight) {
        this.rollRight = true;
        this.rotate = true;
      }
    }
    this.onMouseMove(event);
  }

  onMouseUp(event) {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.rollLeft = false;
    this.rollRight = false;
    this.rotate = false;
    this.rotating = false;
  }

  onMouseMove(event) {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    const events = (event.touches && [...event.touches]) || [event];
    for (let e = 0; e < events.length; e += 1) {
      const action = Controls.getMouseActions(events[e]);
      if (action.rotate) {
        this.mouseX = action.rotate.x;
        this.mouseY = action.rotate.y;
        this.rotating = true;
        this.setRotateKnob(event);
      }
    }
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 38: /* up */
      case 87:
        /* W */ this.moveForward = true;
        this.rotate = true;
        break;

      case 37: /* left */
      case 65:
        /* A */ this.moveLeft = true;
        this.rotate = true;
        break;

      case 40: /* down */
      case 83:
        /* S */ this.moveBackward = true;
        this.rotate = true;
        break;

      case 39: /* right */
      case 68:
        /* D */ this.moveRight = true;
        this.rotate = true;
        break;

      case 82:
        /* R */ this.moveUp = true;
        this.rotate = true;
        break;
      case 70:
        /* F */ this.moveDown = true;
        this.rotate = true;
        break;

      case 81:
        /* Q */ this.rollLeft = true;
        this.rotate = true;
        break;
      case 69:
        /* E */ this.rollRight = true;
        this.rotate = true;
        break;

      default:
        break;
    }
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 38: /* up */
      case 87:
        /* W */ this.moveForward = false;
        this.rotate = false;
        break;

      case 37: /* left */
      case 65:
        /* A */ this.moveLeft = false;
        this.rotate = false;
        break;

      case 40: /* down */
      case 83:
        /* S */ this.moveBackward = false;
        this.rotate = false;
        break;

      case 39: /* right */
      case 68:
        /* D */ this.moveRight = false;
        this.rotate = false;
        break;

      case 82:
        /* R */ this.moveUp = false;
        this.rotate = false;
        break;
      case 70:
        /* F */ this.moveDown = false;
        this.rotate = false;
        break;

      case 81:
        /* Q */ this.rollLeft = false;
        this.rotate = false;
        break;
      case 69:
        /* E */ this.rollRight = false;
        this.rotate = false;
        break;
      default:
        break;
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

    this.autoSpeedFactor = 0.0;
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
      this.accF = this.acceleration
        ? this.accF + actualMoveSpeed * 0.05
        : actualMoveSpeed;
    }

    if (this.moveLeft) {
      this.accL = this.acceleration
        ? this.accL - actualMoveSpeed * 0.05
        : -actualMoveSpeed;
    }
    if (this.moveRight) {
      this.accL = this.acceleration
        ? this.accL + actualMoveSpeed * 0.05
        : actualMoveSpeed;
    }

    if (this.moveUp) {
      this.accU = this.acceleration
        ? this.accU + actualMoveSpeed * 0.05
        : actualMoveSpeed;
    }
    if (this.moveDown) {
      this.accU = this.acceleration
        ? this.accU - actualMoveSpeed * 0.05
        : -actualMoveSpeed;
    }

    if (this.rollLeft) {
      this.accRoll = this.acceleration
        ? this.accRoll + 0.0005
        : actualMoveSpeed;
    }
    if (this.rollRight) {
      this.accRoll = this.acceleration
        ? this.accRoll - 0.0005
        : -actualMoveSpeed;
    }

    this.object.translateZ(
      this.accF * this.speedFactorStar * this.speedFactorPlanet
    );
    this.object.translateX(
      this.accL * this.speedFactorStar * this.speedFactorPlanet
    );
    this.object.translateY(
      this.accU * this.speedFactorStar * this.speedFactorPlanet
    );
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

    let verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
    }
    if (this.lookVertical) {
      this.object.rotateX(
        -this.mouseY * this.actualLookSpeed * verticalLookRatio * 0.02
      );
    }
    this.object.rotateY(-this.mouseX * this.actualLookSpeed * 0.02);

    if (isMobile() && !this.rotating) {
      this.mouseX *= 0.95;
      this.mouseY *= 0.95;
      this.setRotateKnob();
    }
  }
}

export default function initControls() {
  TD.clock = new THREE.Clock();
  EVENT.controls = new Controls(TD.camera.object);
  EVENT.controls.acceleration = true;
  EVENT.controls.movementSpeed = 10 * TD.scale;
  EVENT.controls.lookSpeed = 0.1;
}

export function to3DCoordinate(x, y) {
  const width = 2.5 * MISC.camera.near * x * TD.scale;
  const height = 1.4 * MISC.camera.near * y * TD.scale;
  return new THREE.Vector3(width, height, -2.0 * MISC.camera.near * TD.scale);
}

export function getMouse(event) {
  EVENT.mouse2d.x = event.clientX;
  EVENT.mouse2d.y = event.clientY;
  EVENT.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  EVENT.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

export function getKeys(e) {
  switch (e.which) {
    case 49: // 1. Reset camera
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
      TD.globe = undefined;
      TD.label = undefined;
      TD.camera.reset();
      MISC.reload = true;
      break;
    default:
      break;
  }
}
