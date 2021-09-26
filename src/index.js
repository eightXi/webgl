import IndexCss from '#/index.css';
import vs from '#/shaders/vs.glsl';
import fs from '#/shaders/fs.glsl';

var cvs = document.querySelector("#glcanvas");
var gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');

function loadShader(gl, type, source) {
    // 创建着色器对象
    const shader = gl.createShader(type);
    // 向着色器对象中填充着色器
    gl.shaderSource(shader, source);
    // 编译着色器
    gl.compileShader(shader);

    return shader;
}

function initShaders(gl, vs, fs){
    var program = gl.createProgram(); // 创建程序对象

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs); // 创建顶点着色器对象
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);

    gl.attachShader(program, vertexShader); // 为程序对象分配着色器
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program); //链接程序对象
    gl.useProgram(program); // 使用程序对象
}

initShaders(gl, vs, fs)

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
