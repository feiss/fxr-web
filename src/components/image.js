
AFRAME.registerComponent('image', {
  schema: {
    src: {type: 'string'},
    size: {type: 'vec2', default: {x: 20, y: 20}},
    sizeInMeters: {default: false}
  },


  init: function () {
    const RATIO = this.data.sizeInMeters ? 1 : WORLD_DPI_RATIO;
    this.el.setAttribute('geometry', {
      primitive: 'plane',
      width:  this.data.size.x * RATIO,
      height: this.data.size.y * RATIO
    })

    this.el.setAttribute('material', {
      shader: 'flat',
      transparent: true,
      fog: false,
      src: this.data.src
    })
  },
})
