import * as THREE from 'three';

export default function addShaderChunk(shaderString, chunk) {
  const shaderResult = shaderString.replace(
    /(void main\([\w\W]*?\)[\w\W]*?{)/,
    `${THREE.ShaderChunk[chunk] ? THREE.ShaderChunk[chunk] : ''}
    $1`
  );
  console.log(THREE.ShaderChunk[chunk]);
  return shaderResult;
}
