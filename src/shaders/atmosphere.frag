uniform vec3 topColor;
uniform vec3 bottomColor;
uniform vec3 color;
uniform vec3 color2;
uniform float size;
uniform float thickness;
uniform float opacity;
uniform float power;
uniform bool inner;
uniform vec2 u_resolution;
varying vec3 vNormal;
varying vec3 vPositionNormal;
uniform sampler2D backbuffer;

void main() {
  float pos = dot(vNormal, vPositionNormal);
  float s = (1.0 + (0.15 * (size / thickness)));
  if (inner) {
    s = -1.0;
  }
  float a = s * pos;
  if(a > 1.0) {
    a = 1.0;
  }
  if(a < 0.0) {
    a = 0.0;
  }
  if (inner) {
    a = 1.0 - a;
  }
  a = opacity * pow(a, power);
  vec3 color3 = mix(color, color2, a);
  gl_FragColor = vec4( color3, a);
}