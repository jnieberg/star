uniform vec3 glowColor;
uniform float b;
uniform float p;
uniform float s;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() 
{
	float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
	gl_FragColor = vec4( glowColor, a );
}