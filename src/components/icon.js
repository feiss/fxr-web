
const WORLD_DPI_RATIO = 2.0 / 720.0;
const WORLD_DPI_RATIO_INV = 1 / (2.0 / 720.0);
const SAMPLING = 1; // sampling quality (higher, better)

AFRAME.registerComponent('icon', {
  schema: {
    state: {type: 'string', oneOf: ['normal', 'hover', 'clicked'], default: 'normal'},
    src: {type: 'selector'},
    size: {type: 'vec2', default: {x: 100, y: 100} },
    shape: {type: 'string', oneOf: ['none', 'circle', 'square', 'box', 'rounded'], default: 'circle'},
    radius: {default: [20, 20, 20, 20]},
    normalBgColor: {type: 'color', default: '#3d3d3d'},
    hoverBgColor: {type: 'color', default: '#e2e6eb'},
    normalColor: {type: 'color', default: '#e2e6eb'},
    hoverColor: {type: 'color', default: '#3d3d3d'},
    minScale: {default: 0.6},
    maxScale: {default: 0.7},
  },

  init: function () {
    this.width = Math.floor(this.data.size.x * SAMPLING);
    this.height = Math.floor(this.data.size.y * SAMPLING);
    this.textures = { normal: null, hover: null };

    this.animation = 0;

    this.initIcon(this.data.src);

    this.bg = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(
        this.data.size.x * WORLD_DPI_RATIO,
        this.data.size.y * WORLD_DPI_RATIO
      ),
      new THREE.MeshBasicMaterial({transparent: true, color: this.data.normalBgColor})
    );
    this.fg = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(
        this.data.size.x * WORLD_DPI_RATIO,
        this.data.size.y * WORLD_DPI_RATIO
      ),
      new THREE.MeshLambertMaterial({transparent: true, emissive: this.data.normalColor})
    );

    this.fg.scale.set(this.data.minScale, this.data.minScale, 1)
    this.fg.position.z += 0.01;

    if (!this.data.src) { this.fg.visible = false; }

    this.el.setObject3D('mesh', this.bg);
    this.el.object3D.add(this.fg);
  },

  createCanvasCtx: function (w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    return ctx;
  },

  roundedRect: function (ctx, w, h, r1, r2, r3, r4) {
    if (r2 === undefined) {
      r2 = r3 = r4 = r1;
    }
    ctx.beginPath();
    ctx.moveTo(0, r1);
    ctx.lineTo(0, h - r4);
    ctx.quadraticCurveTo(0, h, r4, h);
    ctx.lineTo(w - r3, h);
    ctx.quadraticCurveTo(w, h, w, h - r3);
    ctx.lineTo(w, r2);
    ctx.quadraticCurveTo(w, 0, w - r2, 0);
    ctx.lineTo(r1, 0);
    ctx.quadraticCurveTo(0, 0, 0, r1);
    ctx.fill();
  },

  initIcon: function (sel) {
    if (!sel) return;
    const W = this.width;
    const H = this.height

    var img = new Image();
    img.width = W;
    img.height = H;

    img.onload = (ev) => {
      let ctx = this.createCanvasCtx(W, H);
      if (this.data.shape == 'circle'){
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else if (this.data.shape == 'box' || this.data.shape == 'square') {
        ctx.fillRect(0, 0, W, H);
      } else if (this.data.shape == 'rounded') {
        this.roundedRect(ctx, W, H,
          this.data.radius[0] * SAMPLING,
          this.data.radius[1] * SAMPLING,
          this.data.radius[2] * SAMPLING,
          this.data.radius[3] * SAMPLING);
      }
      this.bg.material.map = new THREE.CanvasTexture(ctx.canvas);
      this.bg.material.needsUpdate = true;

      ctx = this.createCanvasCtx(W, H);
      ctx.drawImage(img, 0, 0, W, H);
      this.fg.material.map = new THREE.CanvasTexture(ctx.canvas);
      this.fg.material.needsUpdate = true;
    };

    var svg = sel.data;
    // manually set the width+height of the svg. If these attributes are not
    // present, drawImage doesn't work
    if (svg.indexOf('width') == -1){
      svg = svg.replace('<svg', `<svg width="${W}" height="${H}"`);
    }
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    img.src = url;
  },

  update: function (oldData) {
    if (!oldData || oldData && oldData.state !== this.data.state) {
      let obj;
      this.bg.material.color.setStyle(this.data[this.data.state + 'BgColor']);
      this.fg.material.emissive.setStyle(this.data[this.data.state + 'Color']);
      const scale = this.data.state == 'hover' ? this.data.maxScale : this.data.minScale;
      AFRAME.ANIME({
        targets: this.fg.scale,
        x: scale,
        y: scale,
        duration: 200,
        easing: 'linear'
      });
    }
  }

});
