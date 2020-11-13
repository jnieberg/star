import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { MISC, TD } from '../../variables';

import vertShader from '../../shaders/bloom.vert';
import fragShader from '../../shaders/bloom.frag';

function setBloom() {
  const params = {
    bloomStrength: 2.0,
    bloomThreshold: 0.2,
    bloomRadius: 1.0,
  };

  const renderPass = new RenderPass(TD.scene, TD.camera.object);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight)
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  TD.bloomComposer = new EffectComposer(TD.renderer);
  TD.bloomComposer.renderToScreen = false;
  TD.bloomComposer.addPass(renderPass);
  TD.bloomComposer.addPass(bloomPass);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: TD.bloomComposer.renderTarget2.texture },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      defines: {},
    }),
    'baseTexture'
  );
  finalPass.needsSwap = true;

  TD.finalComposer = new EffectComposer(TD.renderer);
  TD.finalComposer.renderToScreen = true;
  TD.finalComposer.addPass(renderPass);
  TD.finalComposer.addPass(finalPass);
}

export default function initScene() {
  // Scene
  TD.scene = new THREE.Scene();
  TD.scene.fog = new THREE.Fog(
    0x000000,
    MISC.camera.fade * TD.scale,
    MISC.camera.far * TD.scale
  );

  // WebGL Renderer
  TD.canvas = document.querySelector('#game');
  TD.renderer = new THREE.WebGLRenderer({
    canvas: TD.canvas,
    precision: 'highp',
    powerPreference: 'high-performance',
    // alpha: true,
    antialias: true,
    stencil: false,
    physicallyCorrectLights: true,
  });
  TD.renderer.autoClear = true;
  TD.renderer.shadowMap.enabled = false; // true;
  TD.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  TD.renderer.shadowMap.needsUpdate = true;
  // TD.renderer.gammaFactor = 2.2;
  TD.renderer.ouputEncoding = THREE.sRGBEncoding;
  TD.renderer.setPixelRatio(window.devicePixelRatio);
  TD.renderer.setSize(window.innerWidth, window.innerHeight);

  TD.labelRenderer = new CSS2DRenderer();
  TD.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  TD.labelRenderer.domElement.style.position = 'absolute';
  TD.labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(TD.labelRenderer.domElement);

  // TD.mapCanvas = document.querySelector('#map');
  // TD.mapRenderer = new THREE.WebGLRenderer({
  //   canvas: TD.mapCanvas,
  //   precision: 'highp',
  //   powerPreference: 'high-performance',
  //   antialias: false,
  //   autoClear: false,
  // });
  // TD.mapRenderer.setPixelRatio(window.devicePixelRatio);
  // TD.mapRenderer.setSize(window.innerWidth, window.innerHeight);

  setBloom();

  TD.raycaster = new THREE.Raycaster();

  TD.camera.add();
}
