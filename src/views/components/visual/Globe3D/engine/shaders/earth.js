// three.js 着色器代码，来自 3d-earth-main 项目
// 顶点着色器
export const earthVertex = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vp;
varying vec3 vPositionNormal;
void main(void){
  vUv = uv;
  vNormal = normalize( normalMatrix * normal );
  vp = position;
  vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

// 片元着色器
export const earthFragment = `
uniform vec3 glowColor;
uniform float bias;
uniform float power;
uniform float time;
varying vec3 vp;
varying vec3 vNormal;
varying vec3 vPositionNormal;
uniform float scale;
uniform sampler2D map;
varying vec2 vUv;

void main(void){
  float a = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
  vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
  if(vp.y > time && vp.y < time + 20.0) {
    float t =  smoothstep(0.0, 0.8,  (1.0 - abs(0.5 - (vp.y - time) / 20.0)) / 3.0  );
    color = mix(color, vec4(glowColor, 1.0), t * t );
  }
  color = mix(color, vec4( glowColor, 1.0 ), a);
  gl_FragColor = color + texture2D( map, vUv );
}
`


