microBox - the very tiny lightbox
======================

##Features

- Tiny
- Fast
- API compatible with [lightbox.js](http://lokeshdhakar.com/projects/lightbox2/)

##Usage

###1. Include the script somewhere on your page (preferably right before `</body>`):

```html
<script src="js/microbox.min.js"></script>
```

###2. Include the stylesheet somewhere in the `<head>` of your page (preferably right before `</head>`):

```html
<link rel="stylesheet" href="css/microbox.css" />
```

###3. Add a `rel="lightbox"` attribute to any images you want to lightbox:

```html
<a href="images/fullSizedImage.png" rel="lightbox"><img src="images/thumbSizedImage.png" /></a>
```

##Custom builds

Microbox is built with several micro-dependencies:

`dom.js` - Dollar DOM selector, API-compatible with [jQuery](http://jquery.com/)

`util.js` - Generic utilities, API-compatible with [underscore](http://underscorejs.org/):

- isFunction
- isNull
- isString
- isUndefined
- toArray

`polyfill.js` - polyfills for:

- Element.classList ([browser support](http://caniuse.com/classlist))
- Element.addEventListener
- Array.forEach (IE9 and up, [browser support](http://kangax.github.io/es5-compat-table/#Array.prototype.forEach))
- Array.filter (IE9 and up, [browser support](http://kangax.github.io/es5-compat-table/#Array.prototype.filter))
- Array.indexOf (IE9 and up, [browser support](http://kangax.github.io/es5-compat-table/#Array.prototype.indexOf))

`template.js` - Swappable and API-compatible with your preferred templating utility

`dom` can be removed from the build if you're already using jQuery, and same for `util` if you're using underscore or lodash. `polyfill` can be removed if you're only targeting the latest browsers - be sure to check browser support before removing anything! You can also remove specific polyfills by editing `polyfill.js`, eg. if you're not supporting IE8 and below you can safely remove the `Array.*` polyfills.

**To create a custom build:**

1. Run an `npm install` in cmd/Terminal in the root directory
2. Pop open `Gruntfile.js` and remove any unnecessary dependencies
3. Run `grunt` in cmd/Terminal

## Tested on

- Chrome
- Firefox 24
- Safari 7