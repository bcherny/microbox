microBox - the very tiny lightbox
======================

##Features:

- Tiny
- Fast
- API compatible with [lightbox.js](http://lokeshdhakar.com/projects/lightbox2/)

##Usage:

###1. Include the script somewhere on your page (preferably at the very end of your body):

```html
<script src="js/microbox.min.js"></script>
```

###2. Include the stylesheet somewhere in the `<head>` of your page (preferable at ther end of the `<head>`):

```html
<link rel="stylesheet" href="css/microbox.css" />
```

###3. Add a `rel="lightbox"` attribute to any images you want to lightbox:

```html
<a href="images/fullSizedImage.png" rel="lightbox"><img src="images/thumbSizedImage.png" /></a>
```

##Image set support:

If you want to let users page through image sets, just add the set name to the `rel` attribute:

```html
<a href="images/fullSizedImage.png" rel="lightbox[Set Title]"><img src="images/thumbSizedImage.png" /></a>
```