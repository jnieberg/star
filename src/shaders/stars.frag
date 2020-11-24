varying vec3 vColor;
uniform sampler2D texture2;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float brightness;
uniform float opacity;
void main() {
  gl_FragColor = (vec4( vColor, 1.0 ) + 0.5) * 2.0;
  gl_FragColor = gl_FragColor * texture2D( texture2, gl_PointCoord ) * 1.0;
  #ifdef USE_FOG
    #ifdef USE_LOGDEPTHBUF_EXT
      float depth = 800.0 * gl_FragDepthEXT / gl_FragCoord.w;
    #else
      float depth = 800.0 * gl_FragCoord.z / gl_FragCoord.w;
    #endif
    float fogFactor = smoothstep( fogFar, 0.0, depth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
    gl_FragColor = vec4( gl_FragColor.rgb, opacity);
  #endif
}