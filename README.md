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