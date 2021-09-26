precision mediump float;
// attribute vec4 a_Position;
// varying vec2 v_TexCoord;
// void main(){
//     gl_Position=a_Position;
//     v_TexCoord=vec2((a_Position.x+1.0)/2.0, 1.0-(a_Position.y+1.0)/2.0);
// }

void main(){
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 5.0;
}
