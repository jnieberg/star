/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

import {
	MathUtils,
	Spherical,
	Vector3
} from 'three';

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
	this.speedFactor = 1.0;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	this.accF = 0;
	this.accL = 0;
	this.accU = 0;

	// private variables

	let lat = 0;
	let lon = 0;

	const lookDirection = new Vector3();
	const spherical = new Spherical();
	const target = new Vector3();

	//

	if (this.domElement !== document) {
		this.domElement.setAttribute('tabindex', -1);
	}

	//

	this.handleResize = function() {
		if (this.domElement === document) {
			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;
		} else {
			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
		}
	};

	this.onMouseDown = function(event) {
		if (this.domElement !== document) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		if (this.activeLook) {
			switch (event.button) {
			case 0: this.moveForward = true; break;
			case 2: this.moveBackward = true; break;
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
			case 0: this.moveForward = false; break;
			case 2: this.moveBackward = false; break;
			default: break;
			}
		}

		this.mouseDragOn = false;
	};

	this.onMouseMove = function(event) {
		if (this.domElement === document) {
			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;
		} else {
			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
		}
	};

	this.onKeyDown = function(event) {
		// event.preventDefault();

		switch (event.keyCode) {
		case 38: /* up*/
		case 87: /* W*/ this.moveForward = true; break;

		case 37: /* left*/
		case 65: /* A*/ this.moveLeft = true; break;

		case 40: /* down*/
		case 83: /* S*/ this.moveBackward = true; break;

		case 39: /* right*/
		case 68: /* D*/ this.moveRight = true; break;

		case 82: /* R*/ this.moveUp = true; break;
		case 70: /* F*/ this.moveDown = true; break;
		default: break;
		}
	};

	this.onKeyUp = function(event) {
		switch (event.keyCode) {
		case 38: /* up*/
		case 87: /* W*/ this.moveForward = false; break;

		case 37: /* left*/
		case 65: /* A*/ this.moveLeft = false; break;

		case 40: /* down*/
		case 83: /* S*/ this.moveBackward = false; break;

		case 39: /* right*/
		case 68: /* D*/ this.moveRight = false; break;

		case 82: /* R*/ this.moveUp = false; break;
		case 70: /* F*/ this.moveDown = false; break;
		default: break;
		}
	};

	function setOrientation(ctrl) {
		const quaternion = ctrl.object.quaternion;

		lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
		spherical.setFromVector3(lookDirection);

		lat = 90 - MathUtils.radToDeg(spherical.phi);
		lon = MathUtils.radToDeg(spherical.theta);
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
		const targetPosition = new Vector3();

		return function update(delta) {
			if (this.enabled === false) {
				return;
			}

			if (this.heightSpeed) {
				const y = MathUtils.clamp(this.object.position.y, this.heightMin, this.heightMax);
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
			this.object.translateZ(this.accF * this.speedFactor);
			this.object.translateX(this.accL * this.speedFactor);
			this.object.translateY(this.accU * this.speedFactor);
			this.accF = this.accF * 0.99;
			this.accL = this.accL * 0.99;
			this.accU = this.accU * 0.99;

			let actualLookSpeed = delta * this.lookSpeed;

			if (!this.activeLook) {
				actualLookSpeed = 0;
			}

			let verticalLookRatio = 1;

			if (this.constrainVertical) {
				verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
			}

			lon = lon - this.mouseX * actualLookSpeed;
			if (this.lookVertical) {
				lat = lat - this.mouseY * actualLookSpeed * verticalLookRatio;
			}

			lat = Math.max(-85, Math.min(85, lat));

			let phi = MathUtils.degToRad(90 - lat);
			const theta = MathUtils.degToRad(lon);

			if (this.constrainVertical) {
				phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);
			}

			const position = this.object.position;

			targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

			this.object.lookAt(targetPosition);
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

	this.handleResize();

	setOrientation(this);
};

export { FirstPersonControls };
