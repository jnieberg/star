uniform vec3 color;
uniform vec3 color2;
uniform float size;
uniform float thickness;
uniform float opacity;
uniform float direction;
uniform float power;
uniform vec2 u_resolution;
varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
  float pos = dot(vNormal, vPositionNormal);
  float s = direction * (1.0 + (0.125 * (size / thickness)));
  float a = s * pos;
  if(a > 1.0) { a = 1.0; }
  if(a < 0.0) { a = 0.0; }
  if(direction < 0.0) {
    a = 1.0 - a;
  }
  a = opacity * pow(a, power);
  float r_in;
  float r_out;
  if(direction >= 0.0) {
    r_in = (size / (size + thickness)) - (power * 0.2);
    r_out = 1.0;
  } else {
    r_in = 1.0 / power;
    r_out = 2.0;
  }
  float radius = length( pos-1.0 );
  float mask = ( radius-r_in ) / ( r_out-r_in );
  mask = max(mask, 0.0);
  mask = min(mask, 1.0);
  vec3 color3 = mix(color, color2, mask);
  gl_FragColor = vec4( color3, a);
}