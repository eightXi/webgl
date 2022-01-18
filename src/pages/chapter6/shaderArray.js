const vertices = [
  // 正
  1.0, 1.0,  1.0,
  -1.0, 1.0,  1.0,
  1.0,  -1.0,  1.0,
  -1.0,  -1.0,  1.0,

  // 背
  1.0, 1.0,  -1.0,
  -1.0, 1.0,  -1.0,
  1.0,  -1.0,  -1.0,
  -1.0,  -1.0,  -1.0,

  // 上
  1.0,  1.0, -1.0,
  -1.0,  1.0,  -1.0,
  1.0,  1.0,  1.0,
  -1.0,  1.0, 1.0,

  // 下
  1.0, -1.0, -1.0,
  -1.0, -1.0, -1.0,
  1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // 右
  1.0, 1.0, -1.0,
  1.0,  1.0, 1.0,
  1.0,  -1.0,  -1.0,
  1.0, -1.0,  1.0,

  // 左
  -1.0, 1.0, -1.0,
  -1.0, 1.0,  1.0,
  -1.0,  -1.0,  -1.0,
  -1.0,  -1.0, 1.0
];

const textureCoordinates = [
  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,

  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,

  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,

  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,

  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,

  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,
];

// const textureCoordinates = [
//   0   , 0  ,
//   0   , 0.5,
//   0.25, 0  ,
//   0.25, 0.5,

//   0.25, 0  ,
//   0.5 , 0  ,
//   0.25, 0.5,
//   0.5 , 0.5,

//   0.5 , 0  ,
//   0.5 , 0.5,
//   0.75, 0  ,
//   0.75, 0.5,

//   0   , 0.5,
//   0.25, 0.5,
//   0   , 1  ,
//   0.25, 1  ,

//   0.25, 0.5,
//   0.25, 1  ,
//   0.5 , 1  ,
//   0.5 , 0.5,

//   0.5 , 0.5,
//   0.75, 0.5,
//   0.5 , 1  ,
//   0.75, 1  ,
// ]


const indexes = [
  0,  1,  2,      1,  2,  3,
  4,  5,  6,      5,  6,  7, 
  8,  9,  10,     9,  10, 11,
  12, 13, 14,     13, 14, 15,
  16, 17, 18,     17, 18, 19, 
  20, 21, 22,     21, 22, 23, 
];

export {
  vertices,
  textureCoordinates,
  indexes
}