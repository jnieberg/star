attribute float size;
varying vec3 vColor;
#ifdef USE_FOG
	varying float fogDepth;
#endif
void main() {
	vColor = color;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = size * ( 200.0 / -mvPosition.z );
	gl_Position = projectionMatrix * mvPosition;
}