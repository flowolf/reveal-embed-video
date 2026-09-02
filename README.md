# Embed Local Video in a reveal.js Presentation

A simple [reveal.js](https://github.com/hakimel/reveal.js) plugin that lets you embed video from a local source, such as a webcam, in a presentation.

It is useful for online talks because it can place the speaker's camera on top of the slides in any position, including full screen.

- [Documentation](https://thomas.weinert.info/reveal-embed-video/docs/)
- [Live Demo](https://thomas.weinert.info/reveal-embed-video/example/index.html)


## Usage

```html
<div class="reveal" data-video="small top-right">
  <div class="slides">
    <section>
      ... regular slide
    </section>
    <section data-video="big top-right">
      ... slide with large video
    </section>
  </div>
</div>
```

The `data-video` attribute contains CSS class names. If a slide does not have the attribute, the plugin looks at its ancestors, so it can be set on the `.reveal` element as a presentation-wide default.

The default classes are:

- `big` = video width 90% of the browser window
- `small` = video width 15% of the browser window
- `top-left` = position in the top-left corner
- `top-right` = position in the top-right corner
- `bottom-left` = position in the bottom-left corner
- `bottom-right` = position in the bottom-right corner

If you set only a position the video width will be 25% of the browser
window.

You can define and use your own CSS classes to position or format the video element.
The video element always has the class `live-video` to avoid conflict with other
videos in your presentation.

```css
video.live-video.your-class {
  /* your css definitions */
}
```

You can set the `data-video` attribute to `false` to disable the video.

### Keyboard shortcut

Press <kbd>C</kbd> to enable or disable the video. It is disabled at startup by default; use the `enabled` option to change that.

### Switching video input

If you have multiple video inputs (for example, front and rear cameras), click the video to cycle through them.

## Installation

Copy `reveal-embed-video.js` and `reveal-embed-video.css` into your presentation project. Keep both files in the same directory so the plugin can discover and load its stylesheet automatically.

Load the plugin after reveal.js and the other reveal.js plugins, but before calling `Reveal.initialize()`:

```html
<script src="reveal.js/dist/reveal.js"></script>
<script src="reveal.js/plugin/markdown/markdown.js"></script>
<script src="reveal.js/plugin/reveal-embed-video/reveal-embed-video.js"></script>

<script>
  Reveal.initialize({
    plugins: [RevealMarkdown, RevealEmbedVideo],
    'embed-video': {
      enabled: false,
      persistent: false
    }
  });
</script>
```

The important part for current reveal.js versions is adding `RevealEmbedVideo` to the `plugins` array. The legacy `dependencies` configuration is no longer used.

## Configuration

### Options

Pass options under the `embed-video` key in `Reveal.initialize()`:

```js
Reveal.initialize({
  plugins: [RevealEmbedVideo],
  'embed-video': {
    enabled: false,       // optional; defaults to false
    persistent: false,    // optional; defaults to false
    path: 'js'            // optional; directory containing the CSS file
  }
});
```

#### enabled

Enable the video stream at startup. Pressing <kbd>C</kbd> still toggles it.

#### persistent

Keep the stream open (and the camera active) after opening it once. The plugin keeps the camera on even while the video is hidden, avoiding repeated permission requests and camera startup delays.

#### path

The directory containing `reveal-embed-video.css`. By default, the plugin derives this directory from the URL of `reveal-embed-video.js`, so this option is only needed when the JavaScript and CSS files are in different directories.

## Limitations

Most modern browsers will not allow local media devices to be opened
from `file://` pages. To use this locally, you need to serve your
presentation using a local web server (such as `npm start`).

Camera access also requires browser support for `navigator.mediaDevices.getUserMedia()`.

## Authors

- Thomas Weinert, thomas@weinert.info (current maintainer)
- Dave Thomas, @pragdave, dave@pragdave.me (original author)

## License

MIT
