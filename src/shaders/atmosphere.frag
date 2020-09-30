uniform vec3 color;
uniform float size;
uniform float thickness;
uniform float opacity;
uniform float reverse;
uniform float power;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() 
{
  float s = 1.0 + (0.125 * (size / thickness));
	float a = s * (dot(vNormal, vPositionNormal));
  if(reverse == 1.0) {
    a = 1.0 - a;
  }
  if(a > 1.0) { a = 1.0; }
  if(a < 0.0) { a = 0.0; }
  a = opacity * pow(a, power);
	gl_FragColor = vec4( color, a );
}