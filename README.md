# jQuery.imgSlider

Another jQuery slideshow plugin. Has multiple effects, and configuration options.

## Compatibility

  * Tested in IE 8
  * Chrome
  * Safari for Windows
  * Opera
  * Firefox

## Requirements

  * jQuery (obviously)
  * Some container with images that you want to make a slideshow out of
  * If you want special easing options, you need to have jQuery-UI as well.
  
## Usage

    $("...Container with images inside...").imgSlider();

A simple example would be:

    $("div#slideShow").imgSlider({
		width: 700,
		height: 350,
		resizeImages: true,		// Resize images for best fit
		easing: "easeOutBack"	// Part of jQuery-UI
		delay: 0,				// Doesn't automatically switch slides
		duration: 5000			// Transitions take 5 seconds
	});