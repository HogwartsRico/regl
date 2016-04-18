var regl = require('../regl')()
var mouse = require('mouse-change')(function () {})

var pixels = regl.texture()

var drawFeedback = regl({
  frag: `
  precision mediump float;
  uniform sampler2D texture;
  uniform vec2 mouse;
  uniform float t;
  varying vec2 uv;
  void main () {
    float dist = length(gl_FragCoord.xy - mouse);
    gl_FragColor = vec4(0.98 * texture2D(texture,
      uv + cos(t) * vec2(0.5 - uv.y, uv.x - 0.5) - sin(2.0 * t) * (uv - 0.5)).rgb, 1) +
      exp(-0.01 * dist) * vec4(
        1.0 + cos(2.0 * t),
        1.0 + cos(2.0 * t + 1.5),
        1.0 + cos(2.0 * t + 3.0),
        0.0);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`,

  attributes: {
    position: regl.buffer([
      -2, 0,
      0, -2,
      2, 2])
  },

  uniforms: {
    texture: pixels,
    mouse: (args, batchId, {pixelRatio, height}) => [
      mouse.x * pixelRatio,
      height - mouse.y * pixelRatio
    ],
    t: (args, batchId, {count}) => 0.01 * count
  },

  count: 3
})

regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  })

  drawFeedback()

  pixels({
    width: regl.stats.width,
    height: regl.stats.height,
    copy: true
  })
})