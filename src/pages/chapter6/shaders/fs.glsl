precision highp float;// 片元着色器需要设置精度

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;  // 取样器用于从纹理图像中获取纹素

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}