
AFRAME.registerComponent('tweaker', {
  init: function () {
    this.els = this.el.querySelectorAll('[icon]');
    document.body.addEventListener('keydown', this.keydown.bind(this));
    document.body.addEventListener('keyup', this.keyup.bind(this));
    document.body.addEventListener('click', this.click.bind(this));
    this.selection = null;
    this.activated = false;
    this.key = 0;
    this.shift = false;

    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.style.top = '0';
    this.div.style.left = 'calc(50% - 50px)';
    this.div.style.width = '100px';
    this.div.style.height = '10px';
    this.div.style.padding = '10px';
    this.div.style.textAlign = 'center';
    this.div.style.zIndex = 9999;
    this.div.style.background= '#ccc';
    this.div.innerHTML = 'TWEAKER';
    this.div.style.font = "14px sans-serif"
    this.div.addEventListener('click', (ev) => getSelection().selectAllChildren(ev.target));
    this.el.appendChild(this.div);
  },

  click: function (ev) {
    this.findSelectedEntity();
    this.refreshDiv();
  },

  keydown: function (ev) {
    this.activated = this.selection !== null;
    this.key = ev.keyCode;
    this.shift = ev.shiftKey;
  },

  keyup: function (ev) {
    this.activated = false;
  },

  findSelectedEntity: function () {
    this.selection = null;
    for (var i = 0; i < this.els.length; i++) {
      const icon = this.els[i].components['icon'];
      if (icon.data.state == 'hover'){
        this.selection = this.els[i];
        break;
      }
    }
  },

  tick: function (time, delta) {
    if (!this.activated || !this.selection) { return; }
    const inc = delta * 0.0001 * (this.shift ? 1 : 20);
    const pos = this.selection.object3D.position;
    switch(this.key) {
      case 74: pos.x -= inc; break;
      case 73: pos.y += inc; break;
      case 76: pos.x += inc; break;
      case 75: pos.y -= inc; break;
    }
    this.refreshDiv();
  },

  refreshDiv: function () {
    if (!this.selection) { return; }
    const pos = this.selection.object3D.position;
    this.div.innerHTML = `${pad(pos.x)} ${pad(pos.y)} ${pad(pos.z)}`;
  }
})

function pad(v){
  return Math.floor(v * 1000) / 1000;
}
