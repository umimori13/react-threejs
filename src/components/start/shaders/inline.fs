#define PI 3.1415926
uniform float time;
varying vec2 vUv;
uniform vec3 color;
void main() {
    float alpha;
    // if (vUv.x > PI * 0.5 ){
    //     alpha = 0.0;
    // } else {
        // alpha = sin(3.0 *(vUv.x  + time - PI * 0.5));
        float res = PI * 0.5;
        alpha = sin( mod((vUv.x- time)  * 3.0,  res));
    // }
    gl_FragColor = vec4(vec3(color.x,color.y,color.z), alpha);
    // if(gl_FragColor.a < 0.3){
    //     discard;
    // }
}