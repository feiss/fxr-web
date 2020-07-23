
AFRAME.registerComponent('image', {
  schema: {
    src: {type: 'string'},
    size: {type: 'vec2', default: {x: 20, y: 20}}
  },


  init: function () {
    this.el.setAttribute('geometry', {
      primitive: 'plane',
      width:  this.data.size.x * WORLD_DPI_RATIO,
      height: this.data.size.y * WORLD_DPI_RATIO
    })

    console.log(this.data.src);
    this.el.setAttribute('material', {
      shader: 'flat',
      transparent: true,
      fog: false,
      src: this.data.src
    })
  },
})
