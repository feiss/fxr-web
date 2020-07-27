AFRAME.registerComponent('scenemanager', {
  schema: {
    privateMode: {default: false},
    dimEnvironment: {default: false}
  },

  init: function () {
    this.envColor = '#FFF';
    this.el.addEventListener('togglelibrary', this.togglelibrary.bind(this));

  },

  setScreen: function (screen) {
    this.oldScreen = this.el.querySelector('#screen').getAttribute('image').src;
    this.el.querySelector('#screen').setAttribute('image', { src: screen });
  },

  restoreScreen: function () {
    this.el.querySelector('#screen').setAttribute('image', { src: this.oldScreen });
  },

  update: function (oldData) {
    if (this.data.privateMode !== oldData.privateMode) {
      this.data.dimEnvironment = this.data.privateMode;
      if (this.data.privateMode) {
        this.setScreen('#screen-private');
      } else {
        this.restoreScreen();
      }
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
  },

  togglelibrary: function () {
    const showLibrary = !this.el.querySelector('#library-button').getAttribute('icon').toggled;
    if (showLibrary) {
      this.setScreen('#screen-bookmarks');
    } else {
      this.restoreScreen();
    }
   }

})
