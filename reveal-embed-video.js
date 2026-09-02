var RevealEmbedVideo = (function () {
  'use strict';

  function getScriptPath() {
    var script = document.currentScript;

    if (!script) {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src.indexOf('reveal-embed-video') !== -1) {
          script = scripts[i];
          break;
        }
      }
    }

    if (script && script.src) {
      return script.src.slice(0, script.src.lastIndexOf('/'));
    }

    return 'plugin/reveal-embed-video';
  }

  function LiveStream(video, persistent) {
    this.video = video;
    this.persistent = persistent;
    this.stream = null;
    this.devices = [];
    this.currentDeviceId = null;
    this.active = false;
    this.wanted = false;
  }

  LiveStream.prototype.start = function () {
    this.wanted = true;

    if (this.active) {
      return;
    }

    if (this.stream) {
      this.enable();
    } else {
      this.create();
    }
  };

  LiveStream.prototype.stop = function () {
    this.wanted = false;
    this.active = false;
    this.video.pause();
    this.video.srcObject = null;
    this.video.removeAttribute('data-enabled');

    if (!this.persistent) {
      this.destroy();
    }
  };

  LiveStream.prototype.enable = function () {
    if (!this.stream || !this.wanted) {
      return;
    }

    this.video.srcObject = this.stream;
    this.video.setAttribute('data-enabled', 'true');
    this.active = true;

    var playResult = this.video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function (error) {
        console.warn('Unable to play camera video:', error);
      });
    }
  };

  LiveStream.prototype.create = function () {
    var self = this;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera access requires navigator.mediaDevices.getUserMedia().');
      return;
    }

    var constraints = {
      audio: false,
      video: this.currentDeviceId
        ? { deviceId: { exact: this.currentDeviceId } }
        : true
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      if (!self.wanted) {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
        return;
      }

      self.stream = stream;
      var track = stream.getVideoTracks()[0];
      if (track && track.getSettings) {
        self.currentDeviceId = track.getSettings().deviceId || null;
      }

      self.refreshDevices();
      self.enable();
    }).catch(function (error) {
      console.error('getUserMedia error:', error);
    });
  };

  LiveStream.prototype.refreshDevices = function () {
    var self = this;

    if (!navigator.mediaDevices.enumerateDevices) {
      return;
    }

    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      self.devices = devices.filter(function (device) {
        return device.kind === 'videoinput';
      }).map(function (device) {
        return device.deviceId;
      }).filter(Boolean);
    });
  };

  LiveStream.prototype.next = function () {
    if (this.devices.length < 2) {
      return;
    }

    var index = this.devices.indexOf(this.currentDeviceId);
    this.currentDeviceId = this.devices[(index + 1) % this.devices.length];
    var restart = this.wanted;
    this.destroy();

    if (restart) {
      this.wanted = true;
      this.create();
    }
  };

  LiveStream.prototype.destroy = function () {
    if (this.stream) {
      this.stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    this.stream = null;
    this.active = false;
  };

  function EmbedVideo(deck, options, scriptPath) {
    var self = this;
    this.deck = deck;
    this.enabled = Boolean(options.enabled);
    this.identifierClass = 'live-video';

    this.video = document.createElement('video');
    this.video.className = this.identifierClass;
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.playsInline = true;
    deck.getRevealElement().appendChild(this.video);

    this.stream = new LiveStream(this.video, Boolean(options.persistent));
    this.onVideoClick = function () {
      self.stream.next();
    };
    this.video.addEventListener('click', this.onVideoClick);

    this.style = document.createElement('link');
    this.style.rel = 'stylesheet';
    this.style.href = (options.path || scriptPath) + '/reveal-embed-video.css';
    document.head.appendChild(this.style);

    this.toggle = function () {
      self.enabled = !self.enabled;
      self.update();
      return self.enabled;
    };
    this.onReady = this.update.bind(this);
    this.onSlideChanged = this.update.bind(this);

    deck.addKeyBinding(
      { keyCode: 67, key: 'C', description: 'Toggle speaker camera' },
      this.toggle
    );
    deck.on('ready', this.onReady);
    deck.on('slidechanged', this.onSlideChanged);

    if (deck.isReady()) {
      this.update();
    }
  }

  EmbedVideo.prototype.getVideoClass = function (element) {
    var node = element;

    while (node && node.getAttribute) {
      var value = node.getAttribute('data-video');
      if (value) {
        return value === 'false' || value === 'blank' ? null : value;
      }
      node = node.parentNode;
    }

    return null;
  };

  EmbedVideo.prototype.update = function () {
    var videoClass = this.getVideoClass(this.deck.getCurrentSlide());

    if (this.enabled && videoClass) {
      this.video.className = this.identifierClass + ' ' + videoClass;
      this.stream.start();
    } else {
      this.video.className = this.identifierClass;
      this.stream.stop();
    }
  };

  EmbedVideo.prototype.destroy = function () {
    this.stream.persistent = false;
    this.stream.stop();
    this.video.removeEventListener('click', this.onVideoClick);
    this.deck.off('ready', this.onReady);
    this.deck.off('slidechanged', this.onSlideChanged);
    this.deck.removeKeyBinding(67);
    this.video.remove();
    this.style.remove();
  };

  var scriptPath = getScriptPath();
  var instance = null;

  return {
    id: 'embed-video',

    init: function (deck) {
      var options = deck.getConfig()['embed-video'] || {};
      instance = new EmbedVideo(deck, options, scriptPath);
    },

    destroy: function () {
      if (instance) {
        instance.destroy();
        instance = null;
      }
    }
  };
})();

if (typeof module === 'object' && module.exports) {
  module.exports = RevealEmbedVideo;
}
