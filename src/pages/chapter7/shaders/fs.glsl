precision highp float;// 片元着色器需要设置精度

varying highp vec2 vTextureCoord;
varying highp vec3 vVertexNormal;

uniform mat4 uNormalMatrix;
uniform sampler2D uSampler;  // 取样器用于从纹理图像中获取纹素

void main(void) {
    highp vec3 ambientLight = vec3(0.1, 0.1, 0.1); // 环境入射光颜色

    highp vec3 diffuseLightColor = vec3(1, 1, 1); // 平行入射光颜色
    highp vec3 diffuseVector = normalize(vec3(0, 0, 1));  //平行入射光方向向量归一化
    highp vec3 normal = normalize(vec3 (uNormalMatrix * vec4 (vVertexNormal, 1.0))); // 法线向量归一化

    // 法线向量与光线方向向量的点积
    highp float directional = max(dot(normal, diffuseVector), 0.0); 

    highp vec3 diffuseLight = diffuseLightColor * directional; 

    vec4 color = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(color.rgb * (diffuseLight + ambientLight), color.a);
}