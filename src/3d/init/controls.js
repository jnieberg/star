import { TD, EVENT } from '../../variables';
import * as THREE from 'three';

const FirstPersonControls = function(object, domElementA) {
	let domElement = domElementA;
	if (domElement === undefined) {
		console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.');
		domElement = document;
	}

	this.object = object;
	this.domElement = domElement;

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

	this.acceleration = false;

	// internals
	this.speedFactorStar = 1.0;
	this.speedFactorPlanet = 1.0;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.rotate = false;

	this.accF = 0;
	this.accL = 0;
	this.accU = 0;
	this.actualLookSpeed = 0;

	const lookDirection = new THREE.Vector3();
	const spherical = new THREE.Spherical();
	const target = new THREE.Vector3();

	//

	if (this.domElement !== document) {
		this.domElement.setAttribute('tabindex', -1);
	}

	//

	this.onMouseDown = function(event) {
		if (this.domElement !== document) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		if (this.activeLook) {
			switch (event.button) {
			case 0: this.moveForward = true; this.rotate = true; break;
			case 2: this.moveBackward = true; this.rotate = true; break;
			default: break;
			}
		}

		this.mouseDragOn = true;
	};

	this.onMouseUp = function(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.activeLook) {
			switch (event.button) {
			case 0: this.moveForward = false; this.rotate = false; break;
			case 2: this.moveBackward = false; this.rotate = false; break;
			default: break;
			}
		}

		this.mouseDragOn = false;
	};

	this.onMouseMove = function(event) {
		// if (this.domElement === document) {
		this.mouseX = event.pageX - window.innerWidth / 2;
		this.mouseY = event.pageY - window.innerHeight / 2;
		// } else {
		// 	this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
		// 	this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
		// }
	};

	this.onKeyDown = function(event) {
		// event.preventDefault();

		switch (event.keyCode) {
		case 38: /* up*/
		case 87: /* W*/ this.moveForward = true; this.rotate = true; break;

		case 37: /* left*/
		case 65: /* A*/ this.moveLeft = true; this.rotate = true; break;

		case 40: /* down*/
		case 83: /* S*/ this.moveBackward = true; this.rotate = true; break;

		case 39: /* right*/
		case 68: /* D*/ this.moveRight = true; this.rotate = true; break;

		case 82: /* R*/ this.moveUp = true; this.rotate = true; break;
		case 70: /* F*/ this.moveDown = true; this.rotate = true; break;
		default: break;
		}
	};

	this.onKeyUp = function(event) {
		switch (event.keyCode) {
		case 38: /* up*/
		case 87: /* W*/ this.moveForward = false; this.rotate = false; break;

		case 37: /* left*/
		case 65: /* A*/ this.moveLeft = false; this.rotate = false; break;

		case 40: /* down*/
		case 83: /* S*/ this.moveBackward = false; this.rotate = false; break;

		case 39: /* right*/
		case 68: /* D*/ this.moveRight = false; this.rotate = false; break;

		case 82: /* R*/ this.moveUp = false; this.rotate = false; break;
		case 70: /* F*/ this.moveDown = false; this.rotate = false; break;
		default: break;
		}
	};

	function setOrientation(ctrl) {
		const quaternion = ctrl.object.quaternion;

		lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
		spherical.setFromVector3(lookDirection);
	}

	function contextmenu(event) {
		event.preventDefault();
	}

	function bind(scope, fn) {
		return function() {
			fn.apply(scope, arguments);
		};
	}

	this.lookAt = function(x, y, z) {
		if (x.isVector3) {
			target.copy(x);
		} else {
			target.set(x, y, z);
		}

		this.object.lookAt(target);

		setOrientation(this);

		return this;
	};

	this.update = (function() {
		return function update(delta) {
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
			if (!this.acceleration) {
				this.accF = 0;
				this.accL = 0;
				this.accU = 0;
			}
			if (this.moveForward || (this.autoForward && !this.moveBackward)) {
				this.accF = this.acceleration ? this.accF - actualMoveSpeed * 0.05 : -actualMoveSpeed + this.autoSpeedFactor;
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
			this.object.translateZ(this.accF * this.speedFactorStar * this.speedFactorPlanet);
			this.object.translateX(this.accL * this.speedFactorStar * this.speedFactorPlanet);
			this.object.translateY(this.accU * this.speedFactorStar * this.speedFactorPlanet);
			this.accF = this.accF * 0.99;
			this.accL = this.accL * 0.99;
			this.accU = this.accU * 0.99;

			if (this.rotate) {
				this.actualLookSpeed = delta * this.lookSpeed;
			} else {
				this.actualLookSpeed = this.actualLookSpeed * 0.99;
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
		};
	}());

	const _onMouseMove = bind(this, this.onMouseMove);
	const _onMouseDown = bind(this, this.onMouseDown);
	const _onMouseUp = bind(this, this.onMouseUp);
	const _onKeyDown = bind(this, this.onKeyDown);
	const _onKeyUp = bind(this, this.onKeyUp);

	this.dispose = function() {
		this.domElement.removeEventListener('contextmenu', contextmenu, false);
		this.domElement.removeEventListener('mousedown', _onMouseDown, false);
		this.domElement.removeEventListener('mousemove', _onMouseMove, false);
		this.domElement.removeEventListener('mouseup', _onMouseUp, false);

		window.removeEventListener('keydown', _onKeyDown, false);
		window.removeEventListener('keyup', _onKeyUp, false);
	};

	this.domElement.addEventListener('contextmenu', contextmenu, false);
	this.domElement.addEventListener('mousemove', _onMouseMove, false);
	this.domElement.addEventListener('mousedown', _onMouseDown, false);
	this.domElement.addEventListener('mouseup', _onMouseUp, false);

	window.addEventListener('keydown', _onKeyDown, false);
	window.addEventListener('keyup', _onKeyUp, false);

	setOrientation(this);
};

export default function initControls() {
	TD.clock = new THREE.Clock();
	EVENT.controls = new FirstPersonControls(TD.camera.object, TD.renderer.domElement);
	EVENT.controls.acceleration = true;
	EVENT.controls.movementSpeed = 10 * TD.scale;
	EVENT.controls.lookSpeed = 0.1;
}

export function to3DCoordinate(x, y) {
	const width = 2.5 * TD.camera.near * x * TD.scale;
	const height = 1.4 * TD.camera.near * y * TD.scale;
	return new THREE.Vector3(width, height, -2.0 * TD.camera.near * TD.scale);
}

export function getMouse(e) {
	e.preventDefault();
	EVENT.mouse2d.x = e.clientX;
	EVENT.mouse2d.y = e.clientY;
	EVENT.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	EVENT.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

export function getKeys(e) {
	switch (e.which) {
	case 49:
		TD.camera.coordinate = { x: undefined, y: undefined, z: undefined };
		TD.camera.object.position.set(0, 0, 0);
		TD.camera.object.rotation.set(0, 0, 0);
		EVENT.controls.speedFactorPlanet = 1.0;
		EVENT.controls.accF = 0;
		EVENT.controls.accL = 0;
		EVENT.controls.accU = 0;
		break;
	default: break;
	}
}
