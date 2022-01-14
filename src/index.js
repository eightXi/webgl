import vs from './shaders/vs.glsl';
import fs from './shaders/fs.glsl';
import {mat4} from '../lib/glmatrix';

var cvs = document.querySelector("#glcanvas");
var gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');

var program = createProgram(gl, vs, fs); // 创建程序对象

const programInfo = {
    program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    }
};

const buffers = initBuffers(gl);  
drawScene(gl, programInfo, buffers);

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var vertices = [
        1.0,  1.0,  0.0,
        -1.0, 1.0,  0.0,
        1.0,  -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER,
                    new Float32Array(vertices),
                    gl.STATIC_DRAW); // static_draw指定数据存储区的使用方法 
                                    // 缓冲区的内容可能经常使用，而不会经常更改。

    return {
        position: positionBuffer
    };
}

// 创建着色器
function createShader(webgl, source, type) { // 渲染上下文，数据源，着色器类型
    const shader = webgl.createShader(type); // 创建着色器对象
    webgl.shaderSource(shader, source); //填充着色器
    webgl.compileShader(shader); // 编译着色器
    return shader;
}
// 创建着色程序
function createProgram(gl, vs, fs) {
    var program = gl.createProgram(); //创建程序对象
    var vShader = createShader(gl, vs, gl.VERTEX_SHADER); 
    var fShader = createShader(gl, fs, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vShader); //为程序对象分配着色器
    gl.attachShader(program, fShader);
    gl.linkProgram(program); //链接程序对象

    return program;
} 

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 清除背景色为黑色
    gl.clearDepth(1.0);                 // 深度清除
    gl.enable(gl.DEPTH_TEST);           // 激活深度比较，并且更新深度缓冲区
    gl.depthFunc(gl.LEQUAL);            // 近点覆盖远点  z越小越近
  
    // 清除canvas画布
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // 创建一个透视矩阵，一个特殊的矩阵，即用于模拟相机中的透视失真。
    // 我们的视野是 45 度，有一个宽度/高度与画布显示大小匹配的比例
    // 我们只想看到 距离相机 100 个单位和0.1 个单位之间的对象
  
    const fieldOfView = 45 * Math.PI / 180;   // 弧度制
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // 把绘制的位置设置为场景的中心
    const modelViewMatrix = mat4.create();
  
    // 将绘制位置移动到我们想要开始绘制正方形的位置。
  
    mat4.translate(modelViewMatrix,     // 用给定的向量平移
                   modelViewMatrix,     
                   [-0.0, 0.0, -4.0]);  // 距离相机6个单位
  
    // 从位置缓冲区中提取位置到vertexPosition属性中。
    {
      const numComponents = 3;  // 每次迭代提取3个值
      const type = gl.FLOAT;    // 32位浮点数
      const normalize = false;  // 不需要归一化数据
      const stride = 0;         // 每次迭代运行运动多少内存到下一个数据开始点
                                // 0 = use type and numComponents above
      const offset = 0;         // 从缓冲起始位置开始读取
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(  // 打开属性数组列表中指定索引处的通用顶点属性数组
          programInfo.attribLocations.vertexPosition);
    }

    gl.useProgram(programInfo.program);
  
    // 设置uniform
  
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,   //  是否转置矩阵，必须为false
        modelViewMatrix);
  
    {
      const offset = 0;  // 开始
      const vertexCount = 4;  // 需要使用到多少个点
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);  // 三角带，需要控制点位置顺序
    }
  }
  