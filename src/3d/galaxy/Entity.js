import * as THREE from 'three';
import { Color } from 'three';
import Random from '../../misc/Random';

import vertShader from '../../shaders/stars.vert';
import fragShader from '../../shaders/stars.frag';
import { TD } from '../../variables';
import deleteThree from '../tools/delete';
import Nebula from './misc/Nebula';
import System from './system/System';

export default class Entity {
  constructor({ galaxy, type, buffered, texture }) {
    this.type = type;
    this.buffered = buffered;
    this.random = new Random(`entity_${this.type}`);
    this.order = this.type === 'nebula' ? -3 : -4;
    this.galaxy = galaxy;
    this.texture = texture;
    this.config = TD.entity[this.type];
    this.density = this.config.density;
    if (this.buffered) {
      const uniforms = {
        texture2: { type: 't', value: this.texture },
        fogColor: { type: 'c', value: TD.scene.fog && TD.scene.fog.color },
        fogNear: { type: 'f', value: TD.camera.near * TD.scale },
        fogFar: { type: 'f', value: TD.camera.far * TD.scale },
      };
      this.material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        vertexColors: true,
        fog: true,
      });
    }
    this.group = {};
  }

  update(off) {
    Object.keys(this.group).forEach((i) => {
      if (!this.group[i].object) {
        if (this.group[i].sizes && this.group[i].sizes.length) {
          if (this.buffered === 'sprite') {
            this.group[i].geometry = new THREE.BufferGeometry();
            this.group[i].geometry.setAttribute(
              'position',
              new THREE.Float32BufferAttribute(this.group[i].positions, 3)
            );
            this.group[i].geometry.setAttribute(
              'color',
              new THREE.Float32BufferAttribute(this.group[i].colors, 3)
            );
            this.group[i].geometry.setAttribute(
              'size',
              new THREE.Float32BufferAttribute(this.group[i].sizes, 1)
            );
            this.group[i].geometry.computeBoundingSphere();
            this.group[i].geometry.verticesNeedUpdate = false;
            this.group[i].object = new THREE.Points(
              this.group[i].geometry,
              this.material
            );
          } else if (this.buffered === 'mesh') {
            this.group[i].geometry = new THREE.BufferGeometry();
            this.group[i].geometry.setAttribute(
              'position',
              new THREE.Float32BufferAttribute(this.group[i].positions, 3)
            );
            this.group[i].geometry.setAttribute(
              'color',
              new THREE.Float32BufferAttribute(this.group[i].colors, 3)
            );
            this.group[i].geometry.computeBoundingSphere();
            this.group[i].geometry.verticesNeedUpdate = false;
            this.group[i].object = new THREE.Mesh(
              this.group[i].geometry,
              this.material
            );
          } else {
            this.group[i].object = new THREE.Object3D();
            this.group[i].geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
            for (let v = 0; v < this.group[i].sizes.length / 2; v += 1) {
              this.random.seed = `texture_${i}_${v}`;
              let color = 0xff00ff;
              if (typeof this.group[i].colors[v] !== 'undefined') {
                color = new Color(
                  this.group[i].colors[v],
                  this.group[i].colors[v * 3 + 1],
                  this.group[i].colors[v * 3 + 2]
                );
              }
              const map = Array.isArray(this.texture)
                ? this.texture[this.random.rndInt(this.random.length)]
                : this.texture;
              let opacity = 1.0;
              if (typeof this.group[i].opacity[v] !== 'undefined') {
                opacity = this.group[i].opacity[v];
              }
              const material = new THREE.MeshBasicMaterial({
                map,
                color,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                opacity,
                flatShading: true,
                depthTest: false,
                depthWrite: false,
              });
              const object = new THREE.Mesh(this.group[i].geometry, material);
              object.renderOrder = this.order;
              if (typeof this.group[i].sizes[v * 2 + 1] !== 'undefined') {
                object.scale.set(
                  this.group[i].sizes[v * 2],
                  this.group[i].sizes[v * 2 + 1],
                  1
                );
              }
              if (typeof this.group[i].rotations[v * 3 + 2] !== 'undefined') {
                object.rotation.set(
                  this.group[i].rotations[v * 3],
                  this.group[i].rotations[v * 3 + 1],
                  this.group[i].rotations[v * 3 + 2]
                );
              }
              if (typeof this.group[i].positions[v * 3 + 2] !== 'undefined') {
                object.position.set(
                  this.group[i].positions[v * 3],
                  this.group[i].positions[v * 3 + 1],
                  this.group[i].positions[v * 3 + 2]
                );
              }
              this.group[i].object.add(object);
            }
          }
          this.group[i].object.renderOrder = this.order;
          this.group[i].object.name = i;
          this.group[i].object.castShadow = false;
          this.group[i].object.receiveShadow = false;
          this.group[i].object.matrixAutoUpdate = true;
          TD.scene.add(this.group[i].object);
        }
      } else {
        this.group[i].object.translateX(off.x * this.config.size * TD.scale);
        this.group[i].object.translateY(off.y * this.config.size * TD.scale);
        this.group[i].object.translateZ(off.z * this.config.size * TD.scale);
      }
    });
  }

  removeOutsideRange({ coordx, coordy, coordz }) {
    Object.keys(this.group).forEach((s) => {
      const star = this.group[s];
      if (star) {
        const coord = s.split('_').map((c) => Number(c));
        if (
          coord[0] < coordx - this.config.radius ||
          coord[0] > coordx + this.config.radius ||
          coord[1] < coordy - this.config.radius ||
          coord[1] > coordy + this.config.radius ||
          coord[2] < coordz - this.config.radius ||
          coord[2] > coordz + this.config.radius
        ) {
          deleteThree(star.object);
          delete this.group[s];
        }
      }
    });
  }

  draw({ coordx, coordy, coordz }, callback) {
    // const count = (this.config.radius * 2 + 1) ** 3;
    const content = this.config.size * this.config.size * this.config.size;
    for (
      let z = coordz - this.config.radius;
      z <= coordz + this.config.radius;
      z += 1
    ) {
      for (
        let y = coordy - this.config.radius;
        y <= coordy + this.config.radius;
        y += 1
      ) {
        for (
          let x = coordx - this.config.radius;
          x <= coordx + this.config.radius;
          x += 1
        ) {
          // ((count2) => {
          //   setTimeout(() => {
          const coordString = `${x}_${y}_${z}`;
          if (!this.group[coordString]) {
            this.group[coordString] = {
              x,
              y,
              z,
              this: [],
              positions: [],
              rotations: [],
              colors: [],
              opacity: [],
              sizes: [],
            };
            this.random.seed = coordString;
            const quantity =
              this.config.density <= 1
                ? this.random.rndInt(
                    this.config.density * content,
                    this.config.density * content * 2
                  )
                : Number(this.random.rnd(this.config.density) < 1.0);
            if (this.type === 'system') {
              for (let index = 0; index < quantity; index += 1) {
                // eslint-disable-next-line no-unused-vars
                const _ = new System({
                  parent: this,
                  index,
                  x,
                  y,
                  z,
                });
              }
            } else if (this.type === 'nebula') {
              for (let index = 0; index < quantity; index += 1) {
                // eslint-disable-next-line no-unused-vars
                const _ = new Nebula({
                  parent: this,
                  index,
                  x,
                  y,
                  z,
                });
              }
            }
          }
          // if (count2 <= 1) {
          //   this.removeOutsideRange({ coordx, coordy, coordz });
          //   callback();
          // }
          //   });
          // })(count);
          // count -= 1;
        }
      }
    }
    this.removeOutsideRange({ coordx, coordy, coordz });
    callback();
  }

  remove() {
    Object.keys(this.group).forEach((i) => {
      deleteThree(this.group[i].object);
    });
  }
}
