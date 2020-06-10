export default function initShaders(win) {
	const node = document.createElement('div');
	node.innerHTML = `<script type="x-shader/x-vertex" id="vertexShaderStars">
	attribute float size;
	varying vec3 vColor;
	void main() {
		vColor = color;
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_PointSize = size * ( 300.0 / -mvPosition.z );
		gl_Position = projectionMatrix * mvPosition;
	}
</script>
<script type="x-shader/x-fragment" id="fragmentShaderStars">
	varying vec3 vColor;
	varying vec2 vUv;
	uniform sampler2D texture;
	uniform vec3 fogColor;
	uniform float fogNear;
	uniform float fogFar;
	void main() {
		gl_FragColor = vec4( vColor, 1.0 );

		#ifdef USE_FOG
			#ifdef USE_LOGDEPTHBUF_EXT
				float depth = 500.0 * gl_FragDepthEXT / gl_FragCoord.w;
			#else
				float depth = 500.0 * gl_FragCoord.z / gl_FragCoord.w;
			#endif
			float fogFactor = smoothstep( fogFar, 0.0, depth );
			gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
		#endif

		gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
	}
</script>
<script type="x-shader/x-vertex" id="vertexShaderPng">
	#include <packing>
	uniform sampler2D texture;
	varying vec2 vUV;
	void main() {
		vec4 pixel = texture2D( texture, vUV );
		if ( pixel.a < 0.5 ) discard;
		gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );
	}
</script>
<script type="x-shader/x-fragment" id="fragmentShaderPng">
varying vec2 vUV;
void main() {
	vUV = uv;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1 );
	gl_Position = projectionMatrix * mvPosition;

}
</script>`;
	win.appendChild(node);
}
