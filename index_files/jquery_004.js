(function($) {
  $.fn.b14ImageViewer = function(options, args) {
    // If there's no viewers, don't do anything.
    if (!this || this.length === 0) {
      return this;
    }
    
    // If the option is a string, it calls a command.
    if (typeof(options) === 'string') {
      switch (options) {
        case 'multiplier':
          setMultiplier(this, args);
          break;

        case 'next':
          next(this);
          break;
        case 'previous':
          previous(this);
          break;
        case 'close':
        case 'deselect':
          deselect(this);
          break;          
      }
      
      // Don't reinit the image viewer if we're just calling a command.
      return this;
    }
    
    var quality_matrix = {
      'caseimage-supertiny': 25,
      'caseimage-tiny': 100,
      'caseimage-small': 500,
      'caseimage-large': 900,
      'caseimage-hires': 1200
    };
    
    // Default settings.
    var settings = {
      'margin_top': 10,
      'image_height': 100,
      'image_margin': 10,
      'image_multiplier': 200,
      'auto_multiplier': 100,
      'animation_speed': 500,
      '$measure': '#measure',
      'container': '.container',
      'quality_list': ['caseimage-supertiny', 'caseimage-small', 'caseimage-large', 'caseimage-hires'],
      //'quality_list': ['caseimage-supertiny', 'caseimage-tiny', 'caseimage-small', 'caseimage-large', 'caseimage-hires'],
      'scroll_handler': null
    };

    // Merge the options into our settings.
    $.extend(settings, options);

    // Set the $measure to an actual jQuery element.
    if (typeof(settings.$measure) === 'string') {
      settings.$measure = $(settings.$measure);
    }

    // Run through the list of image viewers.
    return this.each(function (index, element) {
      var $image_viewer = $(element);

      // Copy the settings to the image_viewer data.
      $image_viewer.data(settings);

      // The widest_image is used to make sure the image never exceeds the
      // actual client viewport.
      $image_viewer.data('widest_image', 0);
      
      // We set it to the parent, because the image_viewer will get a negative margin
      $image_viewer.data('left', $image_viewer.parent().offset().left);

      // Setup the controls.
      $image_viewer.find('.controls a').click(function (e) {
        $link = $(this);
        e.preventDefault();
        
        $image_viewer.b14ImageViewer($link.attr('href').substr(1));
      });
      
      // Initialize the images.
      var $previousImage = null;
      //$image_viewer.find('img.caseimage').each(function (index, element) {
      $image_viewer.find('.holder').each(function (index, element) {
        var $image = $(element);

        if ($previousImage !== null) {
          $previousImage.data('_next', $image);
        }
        
        $image
          // Set some default data.
          .data({
            'number' : index,
            '_width' : $image.width(),
            '_left' : $image.position().left,
            '_previous' : $previousImage,
            '_next' : null
          })
          // Add the standard quality class.
          .addClass($image_viewer.data('quality_list')[0])
          // Handle the click function.
          .click(function (e) {
            // On an image click, we need to move the entire image viewer, to
            // the left most corner of the screen, to simulate fullscreen, and
            // set it to full width.
            $image_viewer
              .stop().animate({
                //'margin-left': -$image_viewer.position().left,
                'margin-left': -$image_viewer.data('left'),
                'width': $image_viewer.data('$measure').width()
              }, $image_viewer.data('animation_speed'))
              .addClass('zoomed')
              // Move the container inside the image-viewer, so the selected
              // image gets centered.
              .find($image_viewer.data('container'))
                .stop().animate({
                  // (center image) - (image left) + (the combined image margin to this image)
                  'margin-left': ( ($image_viewer.data('$measure').width() - $image.data('width')) / 2) - ($image.data('left')) + (($image_viewer.data('image_multiplier') - 1) * $image_viewer.data('image_margin') * $image.data('number'))
                }, $image_viewer.data('animation_speed'))
                // Set all the "other" images..
                .find('.holder').not($image).removeClass('selected').children('img.caseimage')
                  .stop().animate({
                    'height': $image_viewer.data('image_height') * $image_viewer.data('image_multiplier'),
                    'opacity': 0.3
                  }, $image_viewer.data('animation_speed'));
            
            // Handle the selected image
            $image.addClass('selected').children('img.caseimage').stop().animate({
              'height': $image_viewer.data('image_height') * $image_viewer.data('image_multiplier'),
              'opacity': 1
            }, $image_viewer.data('animation_speed'));
                  
            // Set the controls position.
            $image_viewer.find('.controls')
              .show()
              .stop().animate({
                'margin-left': $image_viewer.data('left') + 70,
                'opacity': 1
              }, $image_viewer.data('animation_speed'));
            
            // Set controls state
            $image_viewer.find('.controls a').removeClass('disabled');
            if ($image.data('_previous') === null) {
              $image_viewer.find('.controls a.previous').addClass('disabled');
            } else if ($image.data('_next') === null) {
              $image_viewer.find('.controls a.next').addClass('disabled');
            }
            
            // Scroll to image top
            $image_viewer.addClass('zooming');
            $('html,body').stop().animate({
              scrollTop: ($image_viewer.offset().top - $image_viewer.data('margin_top')) // + $('html,body').scrollTop()
            }, $image_viewer.data('animation_speed'), function () {
              $image_viewer.removeClass('zooming');
            });

            // Start loading a better quality for the image.
            loadBetterQuality($image_viewer, $image); //, 'caseimage-large');
            
            // Setup the scroll_handler function if it exists.
            if ($image_viewer.data('scroll_handler') !== null) {
              var scroll_handler = function (e) {
                if (!$image_viewer.data('scroll_handler').apply(null, [$image_viewer])) {
                  // remove listener if the handler told us to.
                  $(window).unbind('scroll', scroll_handler);
                  
                  // And deselect the curren timage.
                  deselect($image_viewer);
                }
              };
              
              $(window).bind('scroll', scroll_handler);
            }
            
            // We also remove the footer (specially for this site).
            $('#footer').fadeOut();
          });
        
        // Set the previous image
        $previousImage = $image;

        // Set the widest image.
        $image_viewer.data('widest_image', Math.max($image_viewer.data('widest_image'), $image.width()));
      });
      
      //$image_viewer.attr('id', 'test-image');
      
      // Set the multiplier
      setMultiplier($image_viewer, $image_viewer.data('image_multiplier'));
    });
    
    //
    function deselect($image_viewer) {
      $image_viewer
        // Move the image viewer back in it's place
        .stop().animate({
          'margin-left': 0,
          'width': $image_viewer.parent().width()
        }, $image_viewer.data('animation_speed'), function () {
          $image_viewer.removeClass('zoomed')
        })
        // And move the container to it's origo.
        .find($image_viewer.data('container'))
          .stop().animate({
            'margin-left': 0
          }, $image_viewer.data('animation_speed'))
          .find('.holder')
            .removeClass('selected')
            // Reset the images as well.
            .find('img.caseimage')
              .stop().animate({
                'height': $image_viewer.data('image_height'),
                'opacity': 1
              }, $image_viewer.data('animation_speed'));
      
      // Reset controls
      $image_viewer.find('.controls')
      .stop().animate({
        'margin-left': 0,
        'opacity': 0
      },$image_viewer.data('animation_speed'), function (e) {
        $(this).hide();
      });
      
      // show the footer again
      $('#footer').fadeIn();
    }
    
    function next($image_viewer) {
      var $selected = $image_viewer.find('.holder.selected');
      if ($selected.length > 0 && $selected.data('_next') !== null) {
        $selected.data('_next').click();
      }
    }
    function previous($image_viewer) {
      var $selected = $image_viewer.find('.holder.selected');
      if ($selected.length > 0 && $selected.data('_previous') !== null) {
        $selected.data('_previous').click();
      }
    }

    //
    function loadBetterQuality($image_viewer, $image, highest_quality) {
      var quality_array = $image_viewer.data('quality_list');
      var highest_image = $image_viewer.data('image_height') * $image_viewer.data('image_multiplier');
      
      if ($image.hasClass('selected') && !$image.hasClass(highest_quality)) {
        for (var i = 1; i < quality_array.length; i++) {
          if ($image.hasClass(quality_array[i -1]) && highest_image > quality_matrix[quality_array[i -1]]) {
            $image
              .removeClass(quality_array[i -1])
              .addClass(quality_array[i])
              .children('img.caseimage')
                .load(function (e) {
                  loadBetterQuality($image_viewer, $image, highest_quality);
                })
                .attr('src', $image.children('img.caseimage').attr('src').replace(quality_array[i -1], quality_array[i]));

            break;
          }
        }
      }
    }

    //
    function setMultiplier($image_viewer, val) {
      $image_viewer.data('left', $image_viewer.parent().offset().left);
      
      if ($image_viewer.data('auto_multiplier') > 0) {
        $image_viewer.data('image_multiplier', val / $image_viewer.data('auto_multiplier'));
      } else {
        $image_viewer.data('image_multiplier', val);
      }
      
      if ($image_viewer.data('image_multiplier') * $image_viewer.data('widest_image') > $image_viewer.data('$measure').width()) {
        $image_viewer.data('image_multiplier', $image_viewer.data('$measure').width() / ($image_viewer.data('widest_image') + $image_viewer.data('image_margin')));
      }

      $image_viewer.find($image_viewer.data('container')).addClass('pos-relative');

      // Set each image data to match the new multiplier.
      $image_viewer.find('.holder').each(function (index, element) {
        var $image = $(element);
        $image.data({
          'width' : $image.data('_width') * $image_viewer.data('image_multiplier'),
          'left' : $image.data('_left') * $image_viewer.data('image_multiplier')
        });
      });

      $image_viewer.find($image_viewer.data('container')).removeClass('pos-relative');

      // If the user is already viewing an image, have them follow size.
      $image_viewer.find('.holder.selected').click();
    }
    
  };
})(jQuery);












// Swipe is not implemented yet!!!
// snatched from: http://mscerts.programming4.us/programming/coding%20javascript%20for%20mobile%20browsers%20%28part%2012%29%20-%20swipe%20gesture.aspx
//var swipe = new MobiSwipe('test-image');
//swipe.direction = swipe.HORIZONTAL;
//swipe.onswipeleft = function () { alert('left'); };

/**
Creates a swipe gesture event handler
*/
function MobiSwipe(id) {
   // Constants
   this.HORIZONTAL     = 1;
   this.VERTICAL       = 2;
   this.AXIS_THRESHOLD = 30;  // The user will not define a perfect line
   this.GESTURE_DELTA  = 60;  // The min delta in the axis to fire the gesture

   // Public members
   this.direction    = this.HORIZONTAL;
   this.element      = document.getElementById(id);
   this.onswiperight = null;
   this.onswipeleft  = null;
   this.onswipeup    = null;
   this.onswipedown  = null;
   this.inGesture    = false;

   // Private members
   this._originalX = 0
   this._originalY = 0
   var _this = this;
   // Makes the element clickable on iPhone
   this.element.onclick = function() {void(0)};

   var mousedown = function(event) {
        // Finger press
        event.preventDefault();
        _this.inGesture  = true;
        _this._originalX = (event.touches) ? event.touches[0].pageX : event.pageX;
        _this._originalY = (event.touches) ? event.touches[0].pageY : event.pageY;
        // Only for iPhone
        if (event.touches && event.touches.length!=1) {
            _this.inGesture = false; // Cancel gesture on multiple touch
        }
   };

   var mousemove = function(event) {
        // Finger moving
        event.preventDefault();
        var delta = 0;
        // Get coordinates using iPhone or standard technique
        var currentX = (event.touches) ? event.touches[0].pageX : event.pageX;
        var currentY = (event.touches) ? event.touches[0].pageY : event.pageY;

        // Check if the user is still in line with the axis
        if (_this.inGesture) {
            if ((_this.direction==_this.HORIZONTAL)) {
                delta = Math.abs(currentY-_this._originalY);
            } else {
                delta = Math.abs(currentX-_this._originalX);
            }
            if (delta >_this.AXIS_THRESHOLD) {
                // Cancel the gesture, the user is moving in the other axis
                _this.inGesture = false;
            }
        }

        // Check if we can consider it a swipe
        if (_this.inGesture) {
            if (_this.direction==_this.HORIZONTAL) {
                delta = Math.abs(currentX-_this._originalX);
                if (currentX>_this._originalX) {
                   direction = 0;
                } else {
                   direction = 1;
                }
            } else {
                delta = Math.abs(currentY-_this._originalY);
                if (currentY>_this._originalY) {
                   direction = 2;
                } else {
                   direction = 3;
                }
            }

            if (delta >= _this.GESTURE_DELTA) {
                // Gesture detected!
                var handler = null;
                switch(direction) {
                     case 0: handler = _this.onswiperight; break;
                     case 1: handler = _this.onswipeleft; break;
                     case 2: handler = _this.onswipedown; break;
                     case 3: handler = _this.onswipeup; break;
                }
                if (handler!=null) {
                    // Call to the callback with the optional delta
                    handler(delta);
                }
                _this.inGesture = false;
            }

        }
   };


   // iPhone and Android's events
   this.element.addEventListener('touchstart', mousedown, false);
   this.element.addEventListener('touchmove', mousemove, false);
   this.element.addEventListener('touchcancel', function() {
       _this.inGesture = false;
   }, false);

   // We should also assign our mousedown and mousemove functions to
   // standard events on compatible devices
}