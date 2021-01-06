
uniform float amplitude;

attribute vec3 customColor;
attribute vec3 displacement;

varying vec3 vColor;

void main() {

#ifdef USERANDOM
    vec3 newPosition = position + amplitude * displacement ;
#elif defined USEBIG
    vec3 newPosition = vec3(position.xy + amplitude * position.xy,position.z);
#else
    vec3 newPosition = position * displacement;
#endif
    vColor = customColor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
