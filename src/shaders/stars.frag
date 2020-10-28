varying vec3 vColor;
uniform sampler2D texture2;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float brightness;
void main() {
  gl_FragColor = vec4( vColor, 1.0 );
  gl_FragColor = (gl_FragColor + brightness * 0.5) * texture2D( texture2, gl_PointCoord ) * (brightness + 1.0);
  #ifdef USE_FOG
    #ifdef USE_LOGDEPTHBUF_EXT
      float depth = 800.0 * gl_FragDepthEXT / gl_FragCoord.w;
    #else
      float depth = 800.0 * gl_FragCoord.z / gl_FragCoord.w;
    #endif
    float fogFactor = smoothstep( fogFar, 0.0, depth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
}