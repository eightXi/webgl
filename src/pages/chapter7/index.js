import vs from './shaders/vs.glsl';
import fs from './shaders/fs.glsl';
import {mat4} from '../../../lib/glmatrix';
import {
    vertices,
    textureCoordinates,
    indexes
} from './shaderArray';

const image = require('./image.png');

var cvs = document.querySelector("#glcanvas");
var gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');

var program = createProgram(gl, vs, fs); // 创建程序对象

const programInfo = {
    program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(program, 'aTextureCoord')
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(program, 'uSampler'),
    }
};

const buffers = initBuffers(gl); 
const texture = loadTexture(gl, image);

var squareRotation = 0.0; 
var then = 0;

function render(now) {
    now *= 0.001;  // 转换为秒
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime, texture);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                    new Float32Array(vertices),
                    gl.STATIC_DRAW); // static_draw指定数据存储区的使用方法 
                                    // 缓冲区的内容可能经常使用，而不会经常更改。

    const textureBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW
    );

    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indexes),
        gl.STATIC_DRAW
    );

    return {
        position: positionBuffer,
        textureCoord: textureBuffer,
        index: indexBuffer
    };
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // 图片加载完成之前放置单个像素， 下载好后更新图片
    const level = 0;  // 详细级别，0是基本图像等级
    const internalFormat = gl.RGBA;  //指定纹理颜色组件
    const width = 1;
    const height = 1;
    const border = 0;  // 必须为0
    const srcFormat = gl.RGBA;  //指定数据格式 webgl1中必须与internalFormat相同
    const srcType = gl.UNSIGNED_BYTE; // 即rgba 每个通道8位
    const pixel = new Uint8Array([0, 0, 255, 255]);  // 不透明蓝色  纹理的像素源
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);

        // 图像尺寸是否是2的幂有不同的处理
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // 是 2 的幂，一般用贴图
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // 不是 2 的幂，关闭贴图并设置切割模式（不需要重复）为到边缘
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // 线性过滤
        }
    };
    image.src = url;
  
    return texture;
}
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function drawScene(gl, programInfo, buffers, deltaTime, texture) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 清除背景色为黑色
    gl.clearDepth(1.0);                 // 深度清除
    gl.enable(gl.DEPTH_TEST);           // 激活深度比较，并且更新深度缓冲区
    gl.depthFunc(gl.LEQUAL);            // 近点覆盖远点  z缓存越小越近  z缓存与z坐标相关但不相同
  
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
                   [0.0, 0.0, -6.0]);  // 距离相机单位

    mat4.rotate(modelViewMatrix,  
              modelViewMatrix,  
              squareRotation,   
              [1, 1, 0]);       // 旋转所绕的轴
  
    // 从位置缓冲区中提取位置到vertexPosition属性中。
    {
      const numComponents = 3;  // 每次迭代提取3个值
      const type = gl.FLOAT;    // 32位浮点数
      const normalize = false;  // 不需要归一化数据
      const stride = 0;         // 每次迭代运行运动多少内存到下一个数据开始点
                                // 0 = use type and numComponents above
      const offset = 0;         // 从缓冲起始位置开始读取
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(  // 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(  // 打开属性数组列表中指定索引处的通用顶点属性数组
          programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 2;  // 每次迭代提取4个值
        const type = gl.FLOAT;    // 32位浮点数
        const normalize = false;  // 不需要归一化数据
        const stride = 0;         // 每次迭代运行运动多少内存到下一个数据开始点
                                  // 0 = use type and numComponents above
        const offset = 0;         // 从缓冲起始位置开始读取
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(  // 打开属性数组列表中指定索引处的通用顶点属性数组
            programInfo.attribLocations.textureCoord);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index) // 绑定索引缓存区

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

    // 激活并绑定纹理单元

    // 默认绑定到 0 号单元，如果只有一张纹理，无需进行 activeTexture
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 为取样器指定纹理单元(gl.TEXTUREn)编号
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
  
    {
      const offset = 0;  // 开始
      const vertexCount = 36;  // 需要使用到多少个点
      const type = gl.UNSIGNED_SHORT; // 类型
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);  // 三角带，需要控制点位置顺序
    }

    squareRotation += deltaTime;  // 更新旋转角度
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