precision mediump float;// 片元着色器需要设置精度

varying lowp vec4 vColor;

void main(){
    gl_FragColor = vColor;
}