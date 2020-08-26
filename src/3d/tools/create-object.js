import * as THREE from 'three';
import { TD } from '../../variables';

export default function createSphere({
  color = 0x000000,
  emissive = 0x000000,
  surface = null,
  normal = true,
  size, detail,
  parent = TD.scene,
  distance,
  rotate,
}) {
  const geometry = new THREE.SphereBufferGeometry(size, detail, detail);
  const texture = TD.texture.planet.surface[surface];
  const matParams = {
    map: texture || null,
    bumpMap: (normal && texture) || null,
    bumpScale: (normal && 0.0000001 * TD.scale) || null,
    color,
    emissive,
    emissiveIntensity: 0.25,
    side: THREE.FrontSide,
    transparent: true,
    alphaTest: 0,
  };
  const material = new THREE.MeshStandardMaterial(matParams);
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
  //   depthPacking: THREE.RGBADepthPacking,
  //   map: texture || null,
  //   alphaTest: 0.5
  // });
  mesh.rotation.y = rotate || 0;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.translateX(distance || 0);
  parent.add(mesh);
  return mesh;
}
