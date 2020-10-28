varying vec2 vUv;
uniform float thickness;
uniform bool inner;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
  vUv = uv;
  vec4 pos;
	vNormal = normalize( normalMatrix * normal );
	vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
  if(inner) {
    pos = modelViewMatrix * vec4( position, 1.0 );
  } else {
    pos = modelViewMatrix * vec4( position + normal * thickness, 1.0 );
  }
	gl_Position = projectionMatrix * pos;
}