precision highp float;// 片元着色器需要设置精度

varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;  // 取样器用于从纹理图像中获取纹素

void main(void) {
    vec4 color = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(color.rgb * vLighting, color.a);
}