
const WORLD_DPI_RATIO = 2.0 / 720.0;
const SAMPLING = 4; // sampling quality (higher, better)

AFRAME.registerComponent('icon', {
  schema: {
    state: {type: 'string', oneOf: ['normal', 'hover', 'clicked'], default: 'normal'},
    normal: {type: 'selector'},
    hover: {type: 'selector'},
    size: {type: 'vec2', default: {x: 44, y: 44} },
    shape: {type: 'string', oneOf: ['none', 'circle', 'square', 'box'], default: 'none'},
    normalColor: {type: 'color', default: '#3d3d3d'},
    hoverColor: {type: 'color', default: '#e2e6eb'}
  },

  init: function () {
    this.width = Math.floor(this.data.size.x * SAMPLING);
    this.height = Math.floor(this.data.size.y * SAMPLING);
    this.textures = { normal: null, hover: null };

    this.initIcon('normal', this.data.normal);
    this.initIcon('hover', this.data.hover || this.data.normal);

    this.el.setObject3D('mesh',
      new THREE.Mesh(
        new THREE.PlaneBufferGeometry(
          this.data.size.x * WORLD_DPI_RATIO,
          this.data.size.y * WORLD_DPI_RATIO
        ),
        new THREE.MeshBasicMaterial({transparent: true})
      )
    );
    this.update(null);
  },

  initIcon: function (state, sel) {
    if (!sel) return;

    var img = new Image();
    img.width = this.width;
    img.height = this.height;

    img.onload = (ev) => {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = this.data[state + 'Color'];

      if (this.data.shape == 'circle'){
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else if (this.data.shape == 'box' || this.data.shape == 'square') {
        ctx.fillRect(0, 0, this.width, this.height);
      }
      ctx.drawImage(img, 0, 0, this.width, this.height);
      this.textures[state] = new THREE.CanvasTexture(canvas);

      this.update(null);
    };

    var svg = sel.data;
    // manually set the width+height of the svg. If these attributes are not
    // present, drawImage doesn't work
    if (svg.indexOf('width') == -1){
      svg = svg.replace('<svg', `<svg width="${this.width}" height="${this.height}"`);
    }
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    img.src = url;
  },

  update: function (oldData) {
    if (!oldData || oldData && oldData.state !== this.data.state) {
      const obj = this.el.getObject3D('mesh');
      obj.material.map = this.textures[this.data.state];
      obj.material.needsUpdate = true;
    }
  },

  tick: function (time) {
    if (this.el.id !== 'tray') return;
    this.el.object3D.position.z = Math.sin(time/2000) * 2 - 2;
  }
});
