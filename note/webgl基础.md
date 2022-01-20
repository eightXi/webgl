# webgl基础概念
WebGL仅仅是一个光栅化引擎，它可以根据你的代码绘制出点，线和三角形。 想要利用WebGL完成更复杂任务，取决于你能否提供合适的代码，组合使用点，线和三角形代替实现。

webgl代码需要提供成对的方法。每对方法中一个叫顶点着色器， 另一个叫片元着色器，并且使用一种和C或C++类似的强类型的语言 GLSL。 每一对组合起来称作一个 program（着色程序）。

顶点着色器的作用是计算顶点的位置。根据计算出的一系列顶点位置，WebGL可以对点， 线和三角形在内的一些图元进行光栅化处理。当对这些图元进行光栅化处理时需要使用片元着色器方法。 片元着色器的作用是计算出当前绘制图元中每个像素的颜色值。

WebGL只关心两件事：裁剪空间中的坐标值和颜色值。使用WebGL只需要给它提供这两个东西。 你需要提供两个着色器来做这两件事，一个顶点着色器提供裁剪空间坐标值，一个片元着色器提供颜色值。


# webgl获取数据
对于想要绘制的每一个对象，都需要先设置一系列状态值，然后通过调用 gl.drawArrays 或 gl.drawElements 运行一个着色方法对，使得你的着色器对能够在GPU上运行。

这些方法对所需的任何数据都需要由以下方法发送到GPU
- attribute

  attribute只能用于顶点着色器，用来存储顶点着色器中每个顶点的输入，包括顶点位置坐标、纹理坐标和颜色等信息。

  通常情况下我们会使用缓冲，缓冲是程序发送给GPU的数据，attribute用来从缓冲中获取所需数据，并将它提供给顶点着色器。程序可以指定每次顶点着色器运行时读取缓冲的规则。

  ```
  const positionBuffer = gl.createBuffer(); //创建缓冲对象

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);  //绑定缓冲对象
  gl.bufferData(gl.ARRAY_BUFFER,   // 用缓冲数据填充缓冲对象
                  new Float32Array(vertices),
                  gl.STATIC_DRAW); // static_draw指定数据存储区的使用方法 
                                  // 缓冲区的内容可能经常使用，而不会经常更改。

  // 绑定attribute
  vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),

  // 设置缓冲读取规则和启用缓冲对象
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
  ```
- uniform（全局变量）

  uniform可以存在顶点着色器和片元着色器，在着色程序运行前赋值，在运行过程中全局有效。通常用来存储图元处理过程中保持不变的值，例如颜色。

  ```
  // 绑定uniform
  projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix')
  // 设置uniform
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  ```

  uniform有很多类型，不同的类型设置方法不同，表现为gl.uniform?f?或gl.uniform?i?（v代表接收单个或者数组）

- varyings（可变量）

  用于顶点着色器给片元着色器传值，依照渲染的图元是点， 线还是三角形，顶点着色器中设置的可变量会在片元着色器运行中获取不同的插值。

  通常是将缓冲区获取到的attribute转换为varyings传递给片元着色器，达到片元着色器接受可变数据的目的
- textures(纹理)

  纹理是一个数据序列，可以在着色程序运行中随意读取其中的数据。 大多数情况存放的是图像数据，但是纹理仅仅是数据序列， 你也可以随意存放除了颜色数据以外的其它数据。

# webgl着色器
一个顶点着色器的工作是生成裁剪空间坐标值

每个顶点调用一次（顶点）着色器，每次调用都需要设置一个特殊的全局变量gl_Position， 该变量的值就是裁减空间坐标值。裁剪空间范围永远为-1到1
```
attribute vec4 aVertexPosition;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    vColor = aVertexColor;
}
```

一个片元着色器的工作是为当前光栅化的像素提供颜色值

每个像素都将调用一次片断着色器，每次调用需要从设置的特殊全局变量gl_FragColor中获取颜色信息。
```
precision mediump float;// 片元着色器需要设置精度

varying lowp vec4 vColor; //可变量 由顶点着色器传

void main(){
    gl_FragColor = vColor;
}
```

# glsl
GLSL全称是 Graphics Library Shader Language （图形库着色器语言），是着色器使用的语言。 它有一些不同于JavaScript的特性，主要目的是为栅格化图形提供常用的计算功能。 

glsl内建的数据类型例如vec2, vec3和 vec4分别代表两个值，三个值和四个值， 类似的还有mat2, mat3 和 mat4 分别代表 2x2, 3x3 和 4x4 矩阵。

可用来做一些运算例如常量和矢量的乘法，其为矢量数据提供了多种分量选择器
```
vec4 v

v.x = v.s = v.r = v[0]
v.y = v.t = v.g = v[1]
v.z = v.p = v.b = v[2]
v.w = v.q = v.a = v[3]
```
可详见[glsl规范](https://www.khronos.org/files/opengles_shading_language.pdf)

# webgl工作原理
```
const offset = 0;  // 开始
const vertexCount = 4;  // 需要使用到多少个点
gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);  // 三角带，需要控制点位置顺序
```
<img src="https://saas-base.cdnjtzy.com/saas/intranet/20220118/54a20507899325591035587fbd9b0937.png" style="width: 600px; height: 200px"/>


WebGL在GPU上的工作基本上分为两部分，第一部分是将顶点转换到裁剪空间坐标， 第二部分是基于第一部分的结果绘制像素点。

顶点着色器（Vertex Shader）是写进GLSL 中的一个方法，每个顶点调用一次，在这个方法中做一些数学运算后设置了一个特殊的gl_Position变量， 这个变量就是该顶点转换到裁剪空间中的坐标值，GPU接收该值并将其保存起来。

以画三角形为例，顶点着色器每完成三次顶点处理，，WebGL就会用这三个顶点画一个三角形。 webgl计算出这三个顶点对应的像素后，就会光栅化这个三角形，所谓光栅化其实就是将图形用像素画出来。对于每一个像素，它会调用你的片断着色器询问你使用什么颜色。 你通过给片断着色器的一个特殊变量gl_FragColor设置一个颜色值，实现自定义像素颜色。
<img src="https://saas-base.cdnjtzy.com/saas/intranet/20220119/4a51af81f2991c4a929211a889347903.png" style="width: 600px; height: 400px">

# webgl3d模拟
在图形学中实现变换的主要数学工具是矩阵，我们利用特定的矩阵按照其矩阵的规则进行一系列的运算操作，就可以将所需要用到的加减乘除运算进行简化。

引入投影矩阵、视图矩阵、模型矩阵3个概念进行3d真实场景模拟，通过在Vertex Shader中使用透视矩阵 * 视图矩阵 * 模型矩阵 * 顶点得出最终的顶点位置。

- 投影矩阵

  投影矩阵的作用是将图像从3D空间投影到2D空间，主要有2种投影方式，透视（Perspective）和 正交（Orthogonal）。它们的区别主要在于顶点在z轴上的远近是否会影响其在xy平面上投影的位置。正交的应用场合一般来说是2D UI渲染，透视则应用于3D物体渲染，通过透视投影可以形成远小近大的真实世界视觉效果

  首先激活深度比较

  ```
  gl.clearDepth(1.0);                 // 深度清除
  gl.enable(gl.DEPTH_TEST);           // 激活深度比较，并且更新深度缓冲区
  gl.depthFunc(gl.LEQUAL);            // 近点覆盖远点  z缓存越小越近  z缓存与z坐标相关但不相同
  ```

  使用glMatrix创建一个投影矩阵 [透视投影矩阵展示](https://webglfundamentals.org/webgl/frustum-diagram.html)

  ```
  // 创建一个透视矩阵，一个特殊的矩阵，即用于模拟相机中的透视失真。
  // 视野是 45 度，有一个宽度/高度与画布显示大小匹配的比例
  // 观察范围为距离相机 100 个单位和0.1 个单位之间的对象

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
  ```
- 视图矩阵

  创建视图矩阵模拟摄像机

  在投影矩阵中我们设定视点在（0，0，0）点，所以我们需要在顶点交给投影矩阵处理之前，通过视图矩阵将顶点坐标转换到视点是（0，0，0）点的坐标系中。

  ```
  // 创建视图矩阵
  const viewMatrix = mat4.create();
  const eye = [0, 0, 6];   //虚拟摄像机位置
  const center = [0, 0, 0]; // 被观察目标所在的点 还可用来确定视线
  const up = [0, 1, 0]; // 摄像机朝上的位置

  mat4.lookAt(viewMatrix,
      eye,
      center,
      up)
  ```

- 模型矩阵

  模型矩阵，顾名思义，就是顶点本身的变换矩阵，包括平移，缩放，旋转等

  ```
  // 创建模型矩阵
  const modelMatrix = mat4.create();

  mat4.identity(modelMatrix); // 创建单位矩阵
  mat4.rotate(modelMatrix,    // 绕对应的轴进行旋转
  modelMatrix,  
  squareRotation,   
  [1, 0, 1]); 
  ```

在webgl的三维模拟中，一般来说每个模型都有独立的模型矩阵，控制其本身的变换，所有模型共享视图和投影矩阵，模拟出真实世界里物体和摄像机的运动形式。
<img src="https://saas-base.cdnjtzy.com/saas/intranet/20220119/c26c42350d78c06225e0e991a432502e.jpg" style="width: 700px; height=350px">

# webgl纹理
对一个几何图形进行贴图，所贴的图就叫纹理(texture)，或纹理图像(texture image)。贴图的过程叫做纹理映射。组成纹理图像的像素称为纹素(texels, texture elements)。光栅化时每个片元会涂上纹素

纹理和光照一样，都是作用于世界坐标系的，不受投影和视图矩阵的影响

纹理映射主要分为4步

1.初始化纹理信息

需要设置纹理坐标，通过buffer绑定对应属性

<img src="https://saas-base.cdnjtzy.com/saas/intranet/20220118/e57195c4baf1b1c5240bdcd86a2b7844.png" style="width: 315px; height: 217px"/>

```
textureCoord: gl.getAttribLocation(program, 'aTextureCoord') // 绑定属性

const textureCoordinates = [
  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,
  ......
];  // 设置纹理坐标

const textureBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
);  // 通过buffer绑定对应属性
```

2.加载纹理图像

使用js加载对应的纹理图像，加载的图像不能对canvas造成污染，即需要遵循跨域策略
```
const image = new Image();
image.src = url;
image.onload = function() {
  ...
}
```

3.配置并使用纹理

首先需要创建纹理对象，进行激活，随后将其绑定到gl.TEXTURE_2D上、

```
const texture = gl.createTexture();
// 默认绑定到 0 号单元，如果只有一张纹理，无需进行 activeTexture
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture); //创建并绑定纹理对象
```

使用gl.textImage2D方法指定二维图像
为了防止图片加载失败或者图片加载过慢，可以在图片加载完成之前放置单个色值，图片加载好后更新图片

```
//放置单个色值
const level = 0;  // 详细级别，0是基本图像等级
const internalFormat = gl.RGBA;  //指定纹理颜色组件
const width = 1;
const height = 1;
const border = 0;  // 必须为0
const srcFormat = gl.RGBA;  //指定数据格式 webgl1中必须与internalFormat相同
const srcType = gl.UNSIGNED_BYTE; // 即rgba 每个通道8位
const pixel = new Uint8Array([0, 0, 255, 255]);  // 不透明蓝色  纹理的像素源
gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,  // 指定2维纹理图像
              width, height, border, srcFormat, srcType,
              pixel);

// 放置图片纹理
gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
```

随后进行纹理环绕方式和纹理过滤的配置

前面说到纹理的坐标为0-1，如果设置的纹理坐标在0-1之外webgl会进行纹理的过滤，默认为重复纹理

需要注意的是，webgl对尺寸是否是2的幂的图像有着不同的支持，非2幂的图像支持程度较低，不能使用多级渐进纹理和纹理重复，需要做单独处理

```
if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // 是 2 的幂，多级渐进纹理
    gl.generateMipmap(gl.TEXTURE_2D);
} else {
    // 不是 2 的幂，设置纹理坐标会被约束在0到1之间，超出的部分会重复纹理坐标的边缘
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // 线性过滤
}
```

4.将纹理单元传递给着色器进行处理

```
uSampler: gl.getUniformLocation(program, 'uSampler'),

// 为取样器指定纹理单元(gl.TEXTUREn)编号
gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
```

5.着色器处理

```
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;  // 取样器用于从纹理图像中获取纹素

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}
```

# webgl光照
光源类型可以概括成如下三种：

环境光 是一种可以渗透到场景的每一个角落的光。它是非方向光并且会均匀地照射物体的每一个面，无论这个面是朝向哪个方向的。

方向光 是一束从一个固定的方向照射过来的光。这种光的特点可以理解为好像是从一个很遥远的地方照射过来的，然后光线中的每一个光子与其它光子都是平行运动的。举个例子来说，阳光就可以认为是方向光。

点光源光 是指光线是从一个点发射出来的，是向着四面八方发射的。这种光在我们的现实生活中是最常被用到的。举个例子来说，电灯泡就是向各个方向发射光线的。
<img src="https://saas-base.cdnjtzy.com/saas/intranet/20220119/587a8da8730abfc3a6565a401cb4ffac.png" style="width: 600px; height: 225px">

物体最终显示的颜色也就是光线反射造成的颜色，由两部分因素决定：入射光和物体表面的类型。入射光信息包括入射光的方向和颜色，而物体表面的信息包含基底色和反射特性。根据物体反射光线的方式有环境反射(enviroment/ambient reflection)和漫反射(diffuse reflection)两种类型的光：
- 环境反射
  环境反射是针对环境光而言的，在环境反射中，环境光照射物体是各方面均匀、强度相等的，反射的方向可以认为就是入射光的反方向。也就是最终物体的颜色只跟入射光颜色和基底色有关。那么可以这样定义环境反射光颜色：

  `
  环境反射光颜色 = 入射光颜色 * 表面基底色
  `

- 漫反射
  如果物体表面像镜子一样平滑，那么光线就会以特定的角度反射过去，从视觉效果来说就是刺眼的反光效果，称为镜面反射；如果物体表面是凹凸不平的，反射光就会以不固定的角度发射出去，称为漫反射。在现实中大多数的物体表面都是粗糙的，所以才能看清各种各样的物体。

  <img src="https://saas-base.cdnjtzy.com/saas/intranet/20220119/c6ab6d2baf4c3861a755fa82e5d88de5.jpg" style="width: 455px; height: 192px">

  漫反射中，反射光的颜色除了取决于入射光的颜色、表面的基底色，还有入射光与物体表面的法向量形成的入射角。令入射角为θ，漫反射光的颜色可以根据下式计算：

  `
  漫反射光颜色 = 入射光颜色 * 表面基底色 * cosθ
  `

  将光线方向和法线方向归一化，可得以下公式

  `
  漫反射光颜色 = 入射光颜色 * 表面基底色 * （光线方向 · 法线方向）
  `

  注意光线方向指的入射光的反方向，即从入射点指向光源方向
  <img src="https://saas-base.cdnjtzy.com/saas/intranet/20220119/d98f2193ba0ac8a7fce63e8754aafbdb.png" style="width: 420px; height: 280px">

综合可知 物体最终被观察到的颜色为

`
反射光颜色 = 环境反射光颜色 + 漫反射光颜色
`

以环境光加方向光为例。
首先需要在每个顶点信息中加入面的朝向法线。这个法线是一个垂直于这个顶点所在平面的向量。
然后规定环境光的颜色，方向光的颜色、方向。最后按照上面提到的公式计算出物体颜色

```
varying highp vec2 vTextureCoord;
varying highp vec3 vVertexNormal; //法向量坐标

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
```

可以看到上面引入了一个矩阵uNormalMatrix，原因是物体本身可能会进行平移、旋转等变化，变化抽象为模型矩阵，而进行旋转、放缩等变化的时候法向量的坐标会进行变化。所以引入了一种矩阵：逆转置矩阵，用法向量乘以逆转置矩阵，就可以得到变换后的法向量。

```
// 创建光线法向量变换矩阵
const normalMatrix = mat4.create();
mat4.invert(normalMatrix, modelMatrix); //创建模型矩阵逆矩阵 
mat4.transpose(modelMatrix, modelMatrix); // 转置
```



