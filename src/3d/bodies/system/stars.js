import * as THREE from 'three';
import vertShader from '../../../shaders/stars.vert';
import { TD, MISC, SHADER } from '../../../variables';
import { getCoordinateOffset, setCameraPosition, updateCoordinatesByOffset } from '../../init/camera';
import starList from './star-list';

export function getRealCoordinate(x, y, z) {
  return {
    x: (x - TD.camera.coordinate.x) * TD.stargrid.size * TD.scale,
    y: (y - TD.camera.coordinate.y) * TD.stargrid.size * TD.scale,
    z: (z - TD.camera.coordinate.z) * TD.stargrid.size * TD.scale,
  };
}

function updateStars(off) {
  if (TD.stars) {
    Object.keys(TD.stars).forEach((i) => {
    // for (const i of Object.keys(TD.stars)) {
      if (!TD.stars[i].object) {
        // Star cluster
        TD.stars[i].geometry = new THREE.BufferGeometry();
        TD.stars[i].geometry.setAttribute('position', new THREE.Float32BufferAttribute(TD.stars[i].positions, 3));
        TD.stars[i].geometry.setAttribute('color', new THREE.Float32BufferAttribute(TD.stars[i].colors, 3));
        TD.stars[i].geometry.setAttribute('size', new THREE.Float32BufferAttribute(TD.stars[i].sizes, 1));
        TD.stars[i].geometry.verticesNeedUpdate = false;
        TD.stars[i].geometry.computeBoundingSphere();
        TD.stars[i].object = new THREE.Points(TD.stars[i].geometry, TD.material.stars);
        TD.stars[i].object.name = i;
        TD.stars[i].object.castShadow = false;
        TD.stars[i].object.receiveShadow = false;
        TD.stars[i].object.matrixAutoUpdate = true;

        // Star grid
        const coor = getRealCoordinate(TD.stars[i].x, TD.stars[i].y, TD.stars[i].z);
        const points = [
          new THREE.Vector3(coor.x, coor.y, coor.z),
          new THREE.Vector3(coor.x, coor.y + TD.stargrid.size * TD.scale, coor.z),
          new THREE.Vector3(
            coor.x + TD.stargrid.size * TD.scale,
            coor.y + TD.stargrid.size * TD.scale,
            coor.z,
          ),
          new THREE.Vector3(
            coor.x + TD.stargrid.size * TD.scale,
            coor.y + TD.stargrid.size * TD.scale,
            coor.z + TD.stargrid.size * TD.scale,
          ),
        ];
        TD.stars[i].grid = {};
        TD.stars[i].grid.geometry = new THREE.BufferGeometry().setFromPoints(points);
        TD.stars[i].grid.geometry.verticesNeedUpdate = false;
        TD.stars[i].grid.object = new THREE.Line(TD.stars[i].grid.geometry, TD.material.grid);
        TD.stars[i].grid.object.castShadow = false;
        TD.stars[i].grid.object.receiveShadow = false;
        TD.stars[i].grid.object.matrixAutoUpdate = false;
        TD.stars[i].grid.object.renderOrder = -1;
        TD.stars[i].object.add(TD.stars[i].grid.object);
        TD.scene.add(TD.stars[i].object);
      } else {
        TD.stars[i].object.translateX(off.x * TD.stargrid.size * TD.scale);
        TD.stars[i].object.translateY(off.y * TD.stargrid.size * TD.scale);
        TD.stars[i].object.translateZ(off.z * TD.stargrid.size * TD.scale);
      }
    });
  }
}

export function initStars() {
  const uniforms = {
    texture2: { type: 't', value: TD.texture.star.small },
    fogColor: { type: 'c', value: TD.scene.fog.color },
    fogNear: { type: 'f', value: TD.camera.fade * TD.scale },
    fogFar: { type: 'f', value: TD.camera.far * TD.scale },
  };
  TD.material.stars = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertShader,
    fragmentShader: SHADER.stars.fragment,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    vertexColors: true,
    fog: true,
  });
  TD.material.grid = new THREE.LineBasicMaterial({
    color: 0x0044ff,
    blending: THREE.AdditiveBlending,
    opacity: 0.25,
    depthTest: false,
  });
}

function newStarsCanBeRendered(force = false) {
  const offset = getCoordinateOffset();
  return force || typeof TD.camera.coordinate.x === 'undefined' || offset.x !== 0 || offset.y !== 0 || offset.z !== 0;
}

export default function drawStars() {
  if ((MISC.reload || newStarsCanBeRendered())) {
    MISC.reload = false;
    updateCoordinatesByOffset();
    const coord = TD.camera.coordinate;
    starList({ coordx: coord.x, coordy: coord.y, coordz: coord.z }, () => {
      const off = setCameraPosition();
      updateStars(off);
    });
  }
}

export function eventStars() {
  if (TD.system) {
    TD.system.update();
  }
}