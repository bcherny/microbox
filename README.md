microbox - the very tiny lightbox
=================================

![screenie](http://i.imgur.com/9TSwdIG.jpg)

## Demo

http://eighttrackmind.github.io/microbox/demo

## Features

- Tiny
- Fast
- API compatible with [lightbox.js](http://lokeshdhakar.com/projects/lightbox2/)

## Dependencies

- umodel (https://github.com/eighttrackmind/umodel)
- u (https://github.com/eighttrackmind/u)

## Usage (non-AMD)

Include the script and dependencies somewhere on your page (preferably right before `</body>`):

```html
...
<script src="u.js"></script>
<script src="umodel.js"></script>
<script src="microbox.min.js"></script>
</body>
</html>
```

Include the stylesheet somewhere in the `<head>` of your page (preferably right before `</head>`):

```html
...
<link rel="stylesheet" href="microbox.css" />
</head>
...
```

Add a `rel="lightbox"` attribute to any images you want to lightbox:

```html
<a href="images/fullSizedImage.png" rel="lightbox">
	<img src="images/thumbSizedImage.png" />
</a>
```

## Features

**Image sets**

```html
<a href="images/fullSizedImage1.png" rel="lightbox[Arbitrary Set ID]">
	<img src="images/thumbSizedImage1.png" />
</a>
<a href="images/fullSizedImage2.png" rel="lightbox[Arbitrary Set ID]">
	<img src="images/thumbSizedImage2.png" />
</a>
<a href="images/fullSizedImage3.png" rel="lightbox[Arbitrary Set ID]">
	<img src="images/thumbSizedImage3.png" />
</a>
```

**Captions**

```html
<a href="images/fullSizedImage.png" rel="lightbox" title="An optional caption goes here and can contain anything, even <strong>HTML</strong>">
	<img src="images/thumbSizedImage.png" />
</a>
```

**Re-initialization**

Useful for when you add elements you'd like to lightbox after microbox is already initialized.

```js
microbox.init()
```

*Note:* This will skip over any elements that are already initialized. If you changed a trigger's `href` or `rel` attribute dynamically after microbox is already initialized, you'll need to generate a brand new element so microbox doesn't skip over it.

## Tested on

- Chrome
- Firefox 24
- Safari 7
- Opera 17
- Internet Explorer 9+
- iPad (iOS7)
- iPhone (iOS7)

## Todo

- Unit & layout tests
- Improve performance on old iOS/Droid
- Add swipe support when device supports touch