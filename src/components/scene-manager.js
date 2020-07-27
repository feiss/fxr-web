AFRAME.registerComponent('scenemanager', {
  schema: {
    privateMode: {default: false},
    dimEnvironment: {default: false}
  },

  init: function () {
    this.envColor = '#FFF';
  },

  update: function (oldData) {
    if (this.data.privateMode !== oldData.privateMode) {
      let screen = this.oldScreen;
      this.data.dimEnvironment = this.data.privateMode;
      if (this.data.privateMode) {
        this.oldScreen = this.el.querySelector('#screen').getAttribute('image').src;
        screen = '#screen-private';
      }
      this.el.querySelector('#screen').setAttribute('image', { src: screen });
    }

    AFRAME.ANIME({
      targets: this,
      easing: 'linear',
      duration: 1000,
      envColor: this.data.dimEnvironment ? '#888': '#FFF',
      change: () => {
        this.el.querySelector('#environment').setAttribute('cubemap', {color: this.envColor});
      }
    });

    this.el.systems['icon'].setPrivateMode(this.data.privateMode);
  }
})
