import * as THREE from 'three';
import { MISC } from '../variables';

export default class Thing {
	constructor(id) {
		this.id = id;
		// MISC.things.add({
		// 	id,
		// 	thing: this,
		// 	overwrite: true
		// });
	}

	_setParameters(objA, params) {
		const obj = objA;
		for (const p in params) {
			if (params.hasOwnProperty(p)) {
				try {
					eval(`obj.${p} = params[p]`);
				} catch (error) {
					console.error(`Evaluation error in class Thing, function _setParameters(). Not possible to assign variable "obj.${p} = params[p]"`);
				}
			}
		}
		return obj;
	}

	geometry(GeometryClass) {
		this.geometry = GeometryClass;
		return this;
	}

	material(materialClass, params) {
		this.material = materialClass;
		this.material = this._setParameters(this.material, params);
		return this;
	}

	mesh(params) {
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh = this._setParameters(this.mesh, params);
		return this;
	}

	add(parent) {
		parent.add(this.mesh);
		return this;
	}

	remove() {
		MISC.things.remove(this.id);
		return this;
	}
}
