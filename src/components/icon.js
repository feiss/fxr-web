
const WORLD_DPI_RATIO = 2.0 / 720.0;
const WORLD_DPI_RATIO_INV = 1 / (2.0 / 720.0);
const SAMPLING = 1; // sampling quality (higher, better)

AFRAME.registerComponent('icon', {
  schema: {
    state: {type: 'string', oneOf: ['normal', 'hover', 'select', 'disabled', 'notify'], default: 'normal'},
    src: {type: 'selector'},
    size: {type: 'vec2', default: {x: 100, y: 100} },
    shape: {type: 'string', oneOf: ['none', 'circle', 'square', 'box', 'rounded'], default: 'circle'},
    radius: {default: [20, 20, 20, 20]},

    toggled: {default: false},

// normal colors

    normalColor: {type: 'color', default: COLOR_FOG},
    normalBgColor: {type: 'color', default: COLOR_ASPHALT},

    hoverColor: {type: 'color', default: COLOR_ASPHALT},
    hoverBgColor: {type: 'color', default: COLOR_FOG},

    selectColor: {type: 'color', default: COLOR_FOG},
    selectBgColor: {type: 'color', default: COLOR_VOID},

    activeColor: {type: 'color', default: COLOR_FOG},
    activeBgColor: {type: 'color', default: COLOR_VOID},

    disabledColor: {type: 'color', default: COLOR_VOID},
    disabledBgColor: {type: 'color', default: COLOR_ASPHALT},

    notifyColor: {type: 'color', default: COLOR_AZURE},
    notifyBgColor: {type: 'color', default: COLOR_ASPHALT},

// private colors

    normalColorPrivate: {type: 'color', default: COLOR_FOG},
    normalBgColorPrivate: {type: 'color', default: COLOR_EGGPLANT},

    hoverColorPrivate: {type: 'color', default: COLOR_EGGPLANT},
    hoverBgColorPrivate: {type: 'color', default: COLOR_FOG},

    selectColorPrivate: {type: 'color', default: COLOR_EGGPLANT},
    selectBgColorPrivate: {type: 'color', default: COLOR_FOG},

    disabledColorPrivate: {type: 'color', default: COLOR_VOID},
    disabledBgColorPrivate: {type: 'color', default: COLOR_EGGPLANT},

    minScale: {default: 0.5},
    maxScale: {default: 0.5 * 1.25},
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
    this.system.registerMe(this);

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

  setRaycastable: function (raycastable) {
    console.log('raycastable', raycastable);
    if (raycastable) {
      this.el.classList.add('raycastable');
    } else {
      this.el.classList.remove('raycastable');
    }
  },

  update: function (oldData) {
    this.setRaycastable(this.data.state !== 'disabled');
    let obj;
    const private = this.system.data.privateMode ? 'Private' : '';
    let drawState = this.data.state;
    if (this.data.toggled && this.data.state === 'normal') { drawState = 'select'; }
    this.bg.material.color.setStyle(this.data[drawState + 'BgColor' + private]);
    this.fg.material.emissive.setStyle(this.data[drawState + 'Color' + private]);
    const scale = this.data.state !== 'normal' && this.data.state !== 'disabled' ? this.data.maxScale : this.data.minScale;
    AFRAME.ANIME({
      targets: this.fg.scale,
      x: scale,
      y: scale,
      duration: 200,
      easing: 'linear'
    });
  }

});


AFRAME.registerSystem('icon', {
  schema: {
    privateMode : {default: false}
  },

  init: function () {
    this.entities = [];
  },

  setPrivateMode: function (private){
    this.data.privateMode = private;
    for (var i = 0; i < this.entities.length; i++) {
      this.entities[i].update(null);
    }
  },

  registerMe: function (el) {
    this.entities.push(el);
  }
});

