import * as THREE from 'three';

import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import init from 'three-dat.gui'; // Init three-dat.gui with Dat
import Atmosphere from './3d/galaxy/globe/Atmosphere';
import deleteThree from './3d/tools/delete';
// Import initialization method
init(dat);
// Import initialization method

// const stats = new Stats();
// document.body.appendChild(stats.dom);

const Test = {
  renderer: null,
  camera: null,
  scene: null,
  controls: null,
  sphere: null,

  init() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70.0,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    // Initialize Orbit control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.userPan = false;
    this.controls.userPanSpeed = 0.0;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 2000.0;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI * 0.495;

    this.data = {
      size: 3,
      thickness: 0.1,
      opacity: 1.0,
      power: 2.0,
      inner: true,
    };
    this.generateGeometry();

    const gui = new dat.GUI();
    gui.add(this.data, 'size', 0.1, 10).onChange(() => this.generateGeometry());
    gui
      .add(this.data, 'thickness', 0, 1)
      .onChange(() => this.generateGeometry());
    gui.add(this.data, 'opacity', 0, 1).onChange(() => this.generateGeometry());
    gui
      .add(this.data, 'power', 0.1, 10)
      .onChange(() => this.generateGeometry());
    gui.add(this.data, 'inner', true).onChange(() => this.generateGeometry());
  },

  generateGeometry() {
    deleteThree(this.sphere);
    const geometry = new THREE.SphereGeometry(this.data.size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x404040,
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.position.set(0, 0, 0);
    this.scene.add(this.sphere);

    this.atmosphere = new Atmosphere({
      size: this.data.size * 1.0001,
      thickness: this.data.thickness,
      color: 0x0000ff,
      color2: 0x00ffff,
      blending: THREE.AdditiveBlending,
      opacity: this.data.opacity,
      opacityInner: 0.0,
      power: this.data.power,
      inner: this.data.inner,
    });
    this.atmosphere.add(this.sphere);
  },

  update() {
    this.renderer.render(this.scene, this.camera);
  },

  resize(inWidth, inHeight) {
    this.camera.aspect = inWidth / inHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(inWidth, inHeight);
    this.update();
  },
};

Test.init();

window.addEventListener('resize', () => {
  Test.resize(window.innerWidth, window.innerHeight);
});

Test.resize(window.innerWidth, window.innerHeight);

const render = () => {
  requestAnimationFrame(render);
  Test.update();
};

render();
