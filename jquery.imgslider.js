/**
 * jQuery Image Slider
 * Author: Benjamin Leffler <btleffler@gmail.com>
 * Date: 11/07/11
 */
 
( function ( $ ) {
	"use strict";
	
	var	name = "imgSlider",	// Name we'll be using
		defaults,			// Defaults container
		priv,				// Private method object
		effects,			// Effect method object
		methods;			// Public method object
		
	// Set up defaults
	defaults = {
		width: 500,
		height: 250,
		startAt: 0,
		delay: 8000,
		duration: 2500,
		cols: 1,
		rows: 1,
		nextEffect: "",
		prevEffect: "",
		easing: "",
		caption: {
			font: "sans-serif",
			color: "white",
			bgColor: "black",
			opacity: 0.65
		},
		backgroundColor: "transparent",
		buttons: {
			next: "&raquo;",
			prev: "&laquo;"
		},
		resizeImages: false,
		imgCropX: 50,
		imgCropY: 50,
		showCaption: true,
		showButtons: true
	};
	
	priv = {
		doInit: function () {
			var info = $.data(this[0], name),
				containers,		// Elements to add to this
				newDimensions,	// Where we'll calculate image dimensions
				startingImg = new Image(),
				otherEvents = {},
				settings, i, img, heightByWidth, widthByHeight,
				currentImg, $meta, $caption, $buttons, $prev, $next;
				
			// To keep scope
			var $slider = this;
			
			currentImg = info.images[info.current];
			
			// Lazy
			settings = info.settings;
			
			// Clear out our element
			this.empty();
			this.clearQueue(name + ".interval");
			
			// Add the elements we'll always use
			containers =	"<div class=\"slides\">" +
							"<div class=\"third slide\" />" +
							"<div class=\"second slide\" />" +
							"<div class=\"first slide\" />" +
							"</div>";
			
			// Add the containers according to the settings
			if (settings.showCaption) {
				containers +=	"<div class=\"meta\">" +
								"<span class=\"caption\" />" + 
								"</div>";
			}
			
			if (settings.showButtons) {
				containers +=	"<div class=\"sliderButton Prev\" />" +
								"<div class=\"sliderButton Next\" />";
			}
			
			// Add them to the element
			this.append(containers);
			
			// Directly style elements so we don't worry
			// about Anyone walking on our toes
			this.css({
				width: settings.width,
				height: settings.height,
				overflow: "hidden",
				display: "block",
				padding: 0,
				position: "relative",
				"background-color": settings.backgroundColor
			});
			
			// Set up each slide
			this.find("div.slide").css({
				width: settings.width,
				height: settings.height,
				padding: 0,
				display: "block",
				overflow: "hidden",
				position: "absolute",
				top: 0,
				left: 0
			});
			
			// Calculate sizes if we need to
			if (settings.resizeImages) {
				for (i = 0; i < info.images.length; i++) {
					img = info.images[i];
					
					heightByWidth = Math.round(
						img.height * (settings.width / img.width)
					);
					
					widthByHeight = Math.round(
						img.width * (settings.height / img.height)
					);
					
					// Keep the larger of the two
					if (	settings.width * heightByWidth >
							widthByHeight * settings.height	) {
						img.width = settings.width;
						img.height = heightByWidth;
						img.left = 0;
						img.top = Math.round(img.height - settings.height) / -2;
					} else {
						img.width = widthByHeight;
						img.height = settings.height;
						img.left = Math.round(img.width - settings.width) / -2;
						img.top = 0;
					}
				}
			}
			
			// Now we can style the current Image
			$(currentImg).css({
				position: "absolute",
				top: currentImg.top,
				left: currentImg.left,
				margin: 0,
				padding: 0,
				border: 0
			});
			
			// And add it to the first slide
			this.find("div.first.slide").append(currentImg);
			
			// Set up captions if needed
			if (settings.showCaption) {
				$meta = this.find("div.meta");
				$caption = this.find("span.caption");
				
				// Style the elements
				$meta.css({
					width: settings.width,
					padding: 0,
					opacity: 0,
					display: "block",
					"background-color": settings.caption.bgColor,
					position: "absolute",
					top: settings.height
				});
				
				$caption.css({
					color: settings.caption.color,
					"font-family": settings.caption.font,
					"text-align": "justify",
					"text-indent": "1em",
					"font-size": "1.5em",
					"font-weight": "bold",
					display: "block",
					margin: 5
				});
				
				if(currentImg.caption) {
					$caption.append(currentImg.caption);
				}
				
				// Set up the indicator on the bottom
				priv.newIndicator.apply(
					this,
					[(settings.width / info.images.length) * info.current]
				);
			}
			
			// Set up the buttons if needed
			if (settings.showButtons) {
				$buttons = this.find("div.sliderButton");
				$prev = $buttons.filter("div.Prev");
				$next = $buttons.filter("div.Next");
				
				// Basic styles for both buttons
				$buttons.css({
					padding: "0 0 5px 0",
					"background-color": settings.caption.bgColor,
					color: settings.caption.color,
					"font-family": settings.caption.font,
					"font-size": "3.5em",
					"font-weight": "bold",
					margin: 0,
					border: 0,
					opacity: 0,
					cursor: "pointer",
					position: "absolute"
				});
				
				// Previous button
				$prev.append(settings.buttons.prev).css({
					top: (settings.height / 2) - ($prev.outerHeight() / 2),
					left: $prev.outerWidth() * -1,
					"-webkit-border-top-right-radius": 3,
					"-webkit-border-bottom-right-radius": 3,
					"-moz-border-radius-topright": 3,
					"-moz-border-radius-bottomright": 3,
					"border-top-right-radius": 3,
					"border-bottom-right-radius": 3
				}).bind("click." + name, function () {
					// Move back one slide
					methods.moveSlide.apply($slider, ["prev"]);
				});
				
				// Next button
				$next.append(settings.buttons.next).css({
					top: (settings.height / 2) - ($next.outerHeight() / 2),
					right: $next.outerWidth() * -1,
					"-webkit-border-top-left-radius": 3,
					"-webkit-border-bottom-left-radius": 3,
					"-moz-border-radius-topleft": 3,
					"-moz-border-radius-bottomleft": 3,
					"border-top-left-radius": 3,
					"border-bottom-left-radius": 3
				}).bind("click." + name, function () {
					// Move forward one slide
					methods.moveSlide.apply($slider, ["next"]);
				});
			}
			
			// Should there be any other event listeners?
			if (settings.showCaption || settings.showButtons) {
				otherEvents["mouseenter." + name] = function () {
					// Show the meta info
					methods.showMeta.call($slider);
					
					// Stop the interval
					$slider.clearQueue(name + ".interval");
				};
				
				otherEvents["mouseleave." + name] = function () {
					// Hide the meta info
					methods.hideMeta.call($slider);
					
					// Start the interval again
					priv.saveInterval.apply(
						$slider,
						[ settings.delay, settings.duration ]
					);
				};
				
				// Bind them to the element
				this.bind(otherEvents);
			}
			
			// Lets start the show
			priv.saveInterval.apply(
				this,
				[ settings.delay, settings.duration ]
			);
		},
		
		newIndicator: function ( left ) {
			var info = $.data(this[0], name),
				$meta = this.find("div.meta");
			
			// Create the element
			$meta.prepend("<div class=\"indicator\" />");
			
			// Style it
			$meta.children("div.indicator:eq(0)").css({
				border: 0,
				padding: 0,
				margin: 0,
				height: 2,
				width: info.settings.width / info.images.length,
				"background-color": info.settings.caption.color,
				position: "absolute",
				bottom: 0,
				left: left
			});
		},
		
		updateMeta: function (nextSlide, direction) {
			var info = $.data(this[0], name),
				$meta = this.find("div.meta"),
				$caption = $meta.children("span.caption"),
				$slider = this,
				indicatorWidth, indicatorLeft, newCap, indicatorDir, s;
			
			s = info.settings;
			
			indicatorWidth = s.width / info.images.length;
			indicatorLeft = indicatorWidth * nextSlide;
			newCap = info.images[nextSlide].caption || "";
			indicatorDir = (direction === "prev") ? "-=" : "+=";
			
			// Are we sliding off the edge?
			if (	indicatorDir === "-=" &&
					indicatorLeft === (s.width - indicatorWidth)	) {
				priv.newIndicator.apply(this, [s.width]);
			} else if (indicatorDir === "+=" && indicatorLeft === 0) {
				priv.newIndicator.apply(this, [indicatorWidth * -1]);
			}
			
			// Set up the animations
			this.queue(name + ".meta", function () {
				$caption.animate(
					{ opacity: 0 },
					Math.round(s.duration * (2/3)),
					function () {
						$caption.html(newCap);
						$caption.animate({ opacity: 1 }, s.duration * (1/3));
					}
				);
				
				$meta.children("div.indicator").animate(
					{ "left": indicatorDir + indicatorWidth },
					s.duration,
					s.easing
				);
				
				$slider.dequeue(name + ".meta");
			}).delay(
				Math.round(s.duration * (2/3)),
				name + ".meta"
			).queue(name + ".meta", function () {
				if ($meta.children("div.indicator").length > 1) {
					$meta.children("div.indicator:gt(0)").remove();
				}
				
				$slider.dequeue(name + ".meta");
			});
			
			// Do the animation
			this.dequeue(name + ".meta");
		},
		
		randomEffect: function () {
			var result, prop, count = 0;
			
			for (prop in effects) {
				if (Math.random() < 1 / ++count) {
					result = prop;
				}
			}
			
			return result;
		},
		
		prepareImage: function (image, columns, rows, position) {
			var info = $.data(this[0], name),
				html = [],
				i = 0,
				settings, cWidth, cHeight, wDiff, hDiff, xDiff,
				yDiff, y, x, xPos, yPos, xBackOffset, yBackOffset;
			
			image = info.images[image] || info.images[info.current];
			
			// Lazy
			settings = info.settings;
			
			if (typeof position === "undefined") {
				position = [0, 0];
			}
			
			columns = !isNaN(columns) ? parseInt(columns, 10) : settings.cols;
			rows = !isNaN(rows) ? parseInt(rows, 10) : settings.rows;
			
			// Get dimensions of each cell rounding up to be sure we
			// have whole pixels and will fill the entire container
			cWidth = Math.round(settings.width / columns + 0.5);
			cHeight = Math.round(settings.height / rows + 0.5);
			wDiff = cWidth - Math.round(settings.width / columns);
			hDiff = cHeight - Math.round(settings.height / rows);
			
			// Figure out the background position offset
			xDiff = Math.round(Math.abs(image.width - settings.width));
			yDiff = Math.round(Math.abs(image.height - settings.height));
			
			// Go through each row
			for (y = 0; y < rows; y++) {
				// Now each column in that row
				for (x = 0; x < columns; x++) {
					xPos = Math.round(x * cWidth + position[0]);
					yPos = Math.round(y * cHeight + position[1]);
					xBackOffset = ((xPos - position[0]) + xDiff) * -1;
					yBackOffset = ((yPos - position[1]) + yDiff) * -1;
					
					// Add cell to the array
					html[i++] = "<div class=\"cell col_";
					html[i++] = x;
					html[i++] = " row_";
					html[i++] = y;
					html[i++] = "\" style=\"border: 0; padding: 0; margin: 0; ";
					html[i++] = "overflow: hidden; position: absolute; ";
					html[i++] = "display: block; top: ";
					html[i++] = yPos;
					html[i++] = "px; left: ";
					html[i++] = xPos;
					html[i++] = "px; width: ";
					html[i++] = cWidth;
					html[i++] = "px; height: ";
					html[i++] = cHeight;
					html[i++] = "px;\"><img src=\"";
					html[i++] = image.src;
					html[i++] = "\" width=\"";
					html[i++] = image.width;
					html[i++] = "\" height=\"";
					html[i++] = image.height;
					html[i++] = "\" style=\"border: 0; padding: 0; margin: 0; ";
					html[i++] = "position: absolute; left: ";
					html[i++] = xBackOffset - image.left;
					html[i++] = "px; top: ";
					html[i++] = yBackOffset - image.top;
					html[i++] = "px;\" /></div>";
				}
			}
			
			// Put it all together in the container
			this.find("div.first").append(html.join(''));
		},
		
		saveInterval: function (delay, duration) {
			var $slider = this;
			
			// function to set up the queue, and keep adding to it
			function doAnimation() {
				$slider.delay(delay + duration, name + ".interval").
					queue(name + ".interval", function () {
						// transition slides
						methods.moveSlide.apply($slider, ["next"]);
						
						$slider.dequeue(name + ".interval");
					}).queue(name + ".interval", function () {
						// Keep adding to the queue
						doAnimation();
						
						$slider.dequeue(name + ".interval");
					}).dequeue(name + ".interval");
			}
			
			// Only if we have a delay, should we start the "interval"
			if (delay > 0) {
				doAnimation();
			}
		}
	};
	
	effects = {
		dropCellsIn: function (next) {
			var info = $.data(this[0], name),
				$current = this.find("div.first"),
				$slider = this,
				rand = Math.random,
				round = Math.round,
				s, hOff, hDiff, $cells, cDur;		
			
			s = info.settings;
			hOff = round((s.height / s.rows) + 0.5) * s.rows * -1;
			hDiff = hOff * -1 - s.height;
			
			// Split up the next image into cells and put it above the view
			priv.prepareImage.apply(this, [ next, s.cols, s.rows, [ 0, hOff ] ]);
			
			$cells = $current.find("div.cell");
			
			cDur = round((s.duration / $cells.length) - 0.5);

			next = info.images[next];
			
			// Go through each cell
			$cells.each(function (index) {
				// Determine the delay for that cell
				var delay = index * (cDur / $cells.length) / $cells.length,
					$c = $(this),
					distance = s.height + hDiff;
				
				// Add the delay to the main queue
				$slider.queue(name + ".transition", function () {
					// Animate that cell
					$c.delay(delay).
						animate({ top: "+=" + distance }, cDur, s.easing);
					
					// Call the next "frame"
					$slider.dequeue(name + ".transition");
				}).delay(delay + cDur, name + ".transition");
			});
			
			// Cleanup
			$slider.queue(name + ".transition", function () {
				$(next).css({
					position: "absolute",
					top: next.top,
					left: next.left,
					border: 0,
					padding: 0,
					margin: 0
				});
				
				$current.html(next);
				
				$slider.dequeue(name + ".transition");
			}).dequeue(name + ".transition");
		},

        fadeRandomCells: function (next) {
            var info = $.data(this[0], name),
                $slider = this,
                $slide = this.find("div.first"),
                $currentImage = $slide.children("img:eq(0)"),
                nextImg = info.images[next],
                $cells, s, cDur;

            s = info.settings;
            cDur = Math.round(s.duration / (s.cols * s.rows) - 0.5);

            // Prepare the current image
            priv.prepareImage.apply(
                this,
                [ info.current, s.cols, s.rows, [ 0, 0 ] ]
            );

            $cells = this.find("div.cell");

            // Set up the next image
            $(nextImg).css({
                position: "absolute",
                top: nextImg.top,
                left: nextImg.left,
                border: 0,
                margin: 0,
                padding: 0
            });

            $currentImage.remove();
            $slide.prepend(nextImg);

            // Set up the animation
            $cells.each(function (index) {
                var $cell = $(this),
                    delay = Math.random() * (s.duration - 100);

                $slider.queue(name + ".transition", function () {
                    // Animate the cell
                    $cell.delay(delay).
                        animate({ opacity: 0 }, s.duration - delay);

                    $slider.dequeue(name + ".transition");
                });
            });

            // Finish the queue and start it
            this.delay(s.duration, name + ".transition").
                queue(name + ".transition", function () {
                    // Cleanup
                    $cells.remove();

                    $slider.dequeue(name + ".transition");
                }).dequeue(name + ".transition");
        },
		
		wipeColsAlt: function (next) {
			var info = $.data(this[0], name),
				$slider = this,
				$current = this.find("div.first"),
				nextImg = info.images[next],
				$cells, cDur, delay, s = info.settings;
			
			cDur = s.duration / s.cols;
			
			// create the columns
			priv.prepareImage.apply(this, [ info.current, s.cols, 1, [ 0, 0 ] ]);
			
			// Replace the old image with the new one (under the new cells)
			$(nextImg).css({
				position: "absolute",
				top: nextImg.top,
				left: nextImg.left,
				border: 0,
				margin: 0,
				padding: 0
			});
			
			$current.children("img:eq(0)").remove();
			$current.prepend(nextImg);
			
			// Set up the animation
			$cells = $current.find("div.cell");
			
			delay = s.duration - (cDur / 4) * $cells.length;
			
			$cells.each(function (index) {
				var animation = {},
					$cell = $(this);
				
				animation["height"] = "-=" + (s.height + 1);
				
				if (index % 2 !== 0) {
					animation["top"] = "+=" + (s.height + 1);
				}
				
				$slider.queue(name + ".transition", function () {
					$cell.animate(animation, cDur, s.easing);
					$slider.dequeue(name + ".transition");
				}).delay(cDur / 4, name + ".transition");
			});
			
			// Finish the queue and start it
			$slider.delay(delay, name + ".transition").
				queue(name + ".transition", function () {
					$cells.remove();
					$slider.dequeue(name + ".transition");
				}).dequeue(name + ".transition");
		},
		
		fade: function (next) {
			var info = $.data(this[0], name),
				s = info.settings,
				$slider = this,
				$current = this.find("div.first"),
				$currImg = $current.children("img:eq(0)"),
				$cell;
				
			next = info.images[next];
			
			// Prepare the current image on top of itself
			priv.prepareImage.apply(this, [ info.current, 1, 1, [ 0, 0 ] ]);
			
			$cell = $current.find("div.cell");
			
			// Replace the image under it
			$(next).css({
				position: "absolute",
				top: next.top,
				left: next.left,
				border: 0,
				padding: 0,
				margin: 0
			});
			
			$currImg.remove();
			$current.prepend(next);
			
			// Set up the animation and start it
			$slider.queue(name + ".transition", function () {
				$cell.animate({ opacity: 0 }, s.duration, s.easing, function () {
					// Cleanup
					$cell.remove();
				});
				
				$slider.dequeue(name + ".transition");
			}).dequeue(name + ".transition");
		},
		
		slideUp: function (second, third) {
			var info		= $.data(this[0], name),
				$slides		= this.find("div.slides > div.slide"),
				$slider		= this,
				s			= info.settings
				
			// Set up the next two images
			second = $(info.images[second]).css({
				position: "absolute",
				top: info.images[second].top,
				left: info.images[second].left,
				border: 0,
				padding: 0,
				margin: 0
			});
			
			third = $(info.images[third]).css({
				position: "absolute",
				top: info.images[third].top,
				left: info.images[third].left,
				border: 0,
				padding: 0,
				margin: 0
			});
			
			$slides.filter("div.second").html(second).css({
				position: "absolute",
				top: s.height,
				left: 0
			});
			
			$slides.filter("div.third").html(third).css({
				position: "absolute",
				top: s.height * 2,
				left: 0
			});
			
			// Set up the animation
			$slider.queue(name + ".transition", function () {
				// Animate the images
				$slides.animate(
					{ top: "-=" + s.height },
					s.duration,
					s.easing,
					function () {
						// cleanup
						$slides.filter("div.first").append(second).css({
							position: "absolute",
							top: 0,
							left: 0
						});
						
						$slides.filter("div.second").empty();
						$slides.filter("div.third").empty();
					}
				);
				
				$slider.dequeue(name + ".transition");
			}).dequeue(name + ".transition");
		}/*,
		
		slideDown: function (second, third) {
		
		},
		
		slideLeft: function (second, third) {
		
		},
		
		slideRight: function (second, third) {
		
		}*/
	};
	
	methods = {
		moveSlide: function (dir) {
			return this.each(function () {
				var info = $.data(this, name),
					$this = $(this),
					tQueue = $this.queue(name + ".transition").length || 0,
					mQueue = $this.queue(name + ".meta").length || 0,
					done = tQueue + mQueue === 0,
					frames = [],
					curr, imgs, nFrames, transition;

				if (done) {
					if (!info) {
						methods.init.call($this);
						info = $.data(this, name);
					}
					
					curr = parseInt(info.current, 10);
					imgs = info.images;
					nFrames = imgs.length;
					
					// Add the next two frames
					if (dir === "prev") {
						frames.push(--curr > -1 ? curr : nFrames + curr);
						frames.push(--curr > -1 ? curr : nFrames + curr);
						
						transition = info.settings.prevEffect;
					} else {
						frames.push(++curr < nFrames ? curr : curr - nFrames);
						frames.push(++curr < nFrames ? curr : curr - nFrames);
						
						transition = info.settings.nextEffect;
					}
					
					if (!effects.hasOwnProperty(transition)) {
						transition = priv.randomEffect();
					}
					
					// Call the animation
					effects[transition].apply($this, frames);
					
					// If there's meta info, update it
					if (info.settings.showCaption) {
						priv.updateMeta.apply($this, [frames[0], dir]);
					}
					
					info.current = frames[0];
					
					// Save the state
					$.data(this, name, info);
				}
			});
		},
		
		showMeta: function () {
			return this.each(function () {
				var info = $.data(this, name),
					$this = $(this),
					$meta = $this.find("div.meta"),
					$next = $this.find("div.sliderButton.Next"),
					$prev = $this.find("div.sliderButton.Prev"),
					s;
					
				if (!info) {
					methods.init.call($this);
					info = $.data(this, name);
				}
				
				s = info.settings;
				
				// Set up the animation and start it
				$this.queue(name + ".meta", function () {
					$meta.stop(true, false).animate({
						top: s.height - $meta.outerHeight(),
						opacity: s.caption.opacity
					}, 500);
					
					$next.stop(true, false).animate({
						right: 0,
						opacity: s.caption.opacity
					}, 500);
					
					$prev.stop(true, false).animate({
						left: 0,
						opacity: s.caption.opacity
					}, 500);
					
					$this.dequeue(name + ".meta");
				}).dequeue(name + ".meta");
			});
		},
		
		hideMeta: function () {
			return this.each(function () {
				var info = $.data(this, name),
					$this = $(this),
					$meta = $this.find("div.meta"),
					$next = $this.find("div.sliderButton.Next"),
					$prev = $this.find("div.sliderButton.Prev"),
					s;
					
				if (!info) {
					methods.init.call($this);
					info = $.data(this, name);
				}
				
				s = info.settings;
				
				$this.queue(name + ".meta", function () {
					$meta.stop(true, false).animate({
						top: s.height,
						opacity: 0
					}, 250);
					
					$next.stop(true, false).animate({
						right: $next.outerWidth() * -1,
						opacity: 0
					}, 250);
					
					$prev.stop(true, false).animate({
						left: $prev.outerWidth() * -1,
						opacity: 0
					}, 250);
					
					$this.dequeue(name + ".meta");
				}).dequeue(name + ".meta");
			});
		},
		
		init: function (options) {
			return this.each(function () {
				var $this = $(this),
					$images = $this.find("img"),
					s, key, numOrig, numParam,
					imgLoader, info;
				
				$this.hide();
				
				info = {
					settings: {},
					images: [],
					current: 0
				};
				
				$.extend(true, info.settings, defaults, options);
				
				s = info.settings;
				
				$this.css({
					width: info.settings.width,
					height: info.settings.height
				});
				
				// Validate the settings
				for (key in s) {
					if (defaults.hasOwnProperty[key]) {
						numOrig = !isNaN(parseFloat(defaults[key]));
						numParam = !isNaN(parseFloat(s[key]));
						
						if (numParam && numOrig) {
							s[key] = parseFloat(s[key]);
						} else if (!numParam && numOrig) {
							s[key] = defaults[key];
						}
					}
				}
				
				s.duration = Math.max(250, s.duration);
				
				s.rows = s.rows < 1 ? 1 : s.rows;
				s.cols = s.cols < 1 ? 1 : s.cols;
				
				$images.each(function () {
					var img = new Image(),
						$thisImg = $(this),
						r = Math.round;
					
					// Set up the onload to save information to the image obj
					$(img).load(function () {
						var i = this;
						var loader = setInterval(function () {
							var l, t;
							
							if (i.complete) {
								clearInterval(loader);
								
								l = r((i.width - s.width) * (s.imgCropX / 100)) * -1;
								t = r((i.height - s.height) * (s.imgCropY / 100)) * -1;
								
								i.left = l;
								i.top = t;
								i.caption = $thisImg.attr("alt");
								
								// Remove the original element
								$thisImg.remove();
							}
						}, 100);
					});
					
					// Get the onload going
					img.src = $thisImg.attr("src");
					
					// Save it
					info.images.push(img);
				});
				
				// Now we wait for every image to be removed
				imgLoader = setInterval(function () {
					var max = Math.max,
						min = Math.min,
						start = info.settings.startAt,
						len;
						
					if ($this.find("img").length === 0) {
						clearInterval(imgLoader);
						
						len = info.images.length;
						
						info.current = max(0, min(start, len));
						
						// Save the state now that we're all loaded up
						$.data($this[0], name, info);
						
						// Do the rest of the initialization stuff
						priv.doInit.call($this);
						
						// Show off
						$this.fadeTo(1000, 1);
					}
				}, 100);
			});
		}
	};
	
	$.fn.imgSlider = function ( method ) {
		if (typeof method === "object" || !method) {
			return methods.init.apply(this, arguments);
		} else if (methods[method]) {
			return methods[method].apply(
				this,
				Array.prototype.slice.call(arguments, 1)
			);
		} else {
			$.error("Method " + method + " does not exist on jQuery.imgSlider");
		}
	};
} )( jQuery );
