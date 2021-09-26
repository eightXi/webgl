import IndexCss from '#/index.css';
import vs from '#/shaders/vs.glsl';
import fs from '#/shaders/fs.glsl';

var cvs = document.querySelector("#glcanvas");
var gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');

var program = createProgram(gl, vs, fs); // 创建程序对象

var a_Position = gl.getAttribLocation(program, 'a_Position') //获取attribute变量的存储位置
gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0); //向attribute变量赋值


gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);

function createProgram(gl, vs, fs) {
    var program = gl.createProgram(); //创建程序对象
    var vShader = createShader(gl, vs, gl.VERTEX_SHADER); 
    var fShader = createShader(gl, fs, gl.FRAGMENT_SHADER);
    gl.linkProgram(program); //链接程序对象
    gl.useProgram(program); //使用程序对象

    return program;

    /**创建着色器 */
    function createShader(webgl, source, type) {
        const shader = webgl.createShader(type); // 创建着色器对象
        webgl.shaderSource(shader, source); //填充着色器
        webgl.compileShader(shader); // 编译着色器
        webgl.attachShader(program, shader); //为程序对象分配着色器
        return shader;
    }
} 