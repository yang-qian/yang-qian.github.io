/*jshint forin:false, jquery:true, browser:true, indent:2, trailing:true, unused:false */
/*global Drupal */

(function ($) {
  var defaults = {
    container: '.scroller-container',
    sections: '.scroller-item',
    easing: 'cubic-bezier(0.745, 0.000, 0.505, 0.555)',
    speed: 500,
    selected_class: 'selected',
    position: 0,
    animating_class: 'animating',
    last_scroll_event: 0,
    last_scroll: 0,
    smooth_timeout: 120, // Prevents apples smooth wheel events from calling another change.
    lock_timeout: 500,
    force_next_scroll: 2000,
    lock_timeout: 1000
  };

  var methods = {
    initialize: function (options) {
      return this.each(function () {
        var
          self = this,
          settings = $.extend({}, defaults, options);

        settings.$container = $(settings.container, this);
        settings.$sections = $(settings.sections, settings.$container);

        // settings.$sections.eq(settings.position).addClass(settings.selected_class);

        // settings.$container
          // .css({
            // '-webkit-transition': 'all ' + settings.speed + 'ms ' + settings.easing,
            // '-moz-transition': 'all ' + settings.speed + 'ms ' + settings.easing,
            // '-ms-transition': 'all ' + settings.speed + 'ms ' + settings.easing,
            // 'transition': 'all ' + settings.speed + 'ms ' + settings.easing
          // })
          // .bind('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (evt) {
            // if (evt.target === this) {
              // settings.$container.removeClass(settings.animating_class);
            // }
          // });

        $(this).data('settings', settings);

        // Setup the informationbar
        settings.information = {};
        settings.information.$position = $('<span class="position"></span>');
        settings.information.$total = $('<span class="total">' + (settings.$sections.length) + '</span>');
        settings.information.$link = $('<div class="title"></div>');
        settings.information.$down_arrow = $('<a href="#" class="down-arrow animate"></a>')
          .bind('click', function (evt) {
            evt.preventDefault();
            $(self).scroller('scroll', -1);
          })
          .bind('mouseover', function (evt) {
            $(this).removeClass('animate');
          })
          .bind('mouseout', function (evt) {
            $(this).addClass('animate');
          });

        settings.$sections.each(function (delta, section) {
          var
            $data = $('.scroller-data', section),
            title = $data.attr('data-title'),
            link = $data.attr('data-link'),
            html = '';

          if (title) {
            html = title;

            if (link) {
              if ($data.attr('data-link-target')) {
                html = '<a href="' + link + '" target="' + $data.attr('data-link-target') + '">' + html + '</a>';
              } else {
                html = '<a href="' + link + '">' + html + '</a>';
              }
            }
          }
          html = '<div class="item">' + html + '<span class="position">' + (delta + 1) + '&nbsp;</span></div>';
          settings.information.$link.append(html);
        });

        $('<div class="scroller-information" />')
          .append(settings.information.$down_arrow)
          .append($('<div class="pager" />')
            // .append(settings.information.$position)
            .append(settings.information.$total)
          )
          .append(settings.information.$link)
          .appendTo(this);

        settings.position -= 1;
        $(this).scroller('scroll_to', settings.position + 1);

        var locked = false;
        $(document)
          .bind('mousewheel DOMMouseScroll', function(evt) {
            if ($('body').hasClass('menu-open')) {
              return;
            }
            evt.preventDefault();

            if (locked) {
              settings.last_scroll_event = new Date().getTime();
              return;
            }
            locked = true;

            // $(self).scroller('scroll', evt.originalEvent.wheelDelta || -evt.originalEvent.detail);

            setTimeout(function () {
              locked = false;
            }, settings.lock_timeout);

            var current_time = new Date().getTime();
            if (current_time - settings.force_next_scroll > settings.last_scroll
                || current_time - settings.last_scroll_event > settings.smooth_timeout) {
              $(self).scroller('scroll', evt.originalEvent.wheelDelta || -evt.originalEvent.detail);
              settings.last_scroll = current_time;
            } else {
              // console.log(current_time - settings.last_scroll_event, evt.originalEvent.wheelDelta || -evt.originalEvent.detail);
            }
            settings.last_scroll_event = current_time;

          })
          .bind('keydown', function (evt) {
            switch (evt.keyCode) {
              case 35: // end
                $(self).scroller('scroll_to', -1);
                break;
              case 36: // home
                $(self).scroller('scroll_to', 0);
                break;
              case 38: // up arrow
                $(self).scroller('scroll', 1);
                break;
              case 40: // down arrow
                $(self).scroller('scroll', -1);
                break;

              default:
                return;
            }
            evt.preventDefault();
          });

        var start_y = 0;
        function touchstart(evt) {
          var touches = evt.originalEvent.touches;
          if (touches && touches.length) {
            start_y = touches[0].pageY;
            $(self)
              .bind('touchmove', touchmove)
              .bind('touchend', touchend);
          }
        }
        function touchmove(evt) {
          evt.preventDefault();
          var touches = evt.originalEvent.touches;
          if (touches && touches.length) {
            var delta_y = touches[0].pageY - start_y;


            // settings.$container
              // .css({
                // '-webkit-transition': 'none',
                // '-moz-transition': 'none',
                // '-ms-transition': 'none',
                // 'transition': 'none'
              // })
              // .css({
                // '-webkit-transform': 'translate3d(0, ' + delta_y + 'px, 0)',
                // '-moz-transform': 'translate3d(0, ' + delta_y + 'px, 0)',
                // '-ms-transform': 'translate3d(0, ' + delta_y + 'px, 0)',
                // 'transform': 'translate3d(0, ' + delta_y + 'px, 0)'
              // })

            if (delta_y > 50) {
              $(self).scroller('scroll', 1);
            } else if (delta_y < -50) {
              $(self).scroller('scroll', -1);
            }

            if (Math.abs(delta_y) > 50) {
              $(self)
                .unbind('touchmove', touchmove)
                .unbind('touchend', touchend);
            }


          }
        }
        function touchend(evt) {
          $(self)
            .unbind('touchmove', touchmove)
            .unbind('touchend', touchend);
        }

        $(this).bind('touchstart', touchstart);
      });
    },

    scroll: function (delta) {
      return this.each(function () {
        var
          settings = $(this).data('settings'),
          position = $(this).data('settings').position;

        position += (delta < 0) ? 1 : -1;
        if (position < 0) {
          position = 0;
        }
        if (position >= settings.$sections.length) {
          position = 0; // settings.$sections.length - 1;
        }

        $(this).scroller('scroll_to', position);
      });
    },

    scroll_to_element: function ($element) {
      return this.each(function () {
        var settings = $(this).data('settings');
        if (settings.$sections.filter($element).length > 0) {
          $(this).scroller('scroll_to', settings.$sections.filter($element).index());
        }
      });
    },

    scroll_to: function (position) {
      return this.each(function () {
        var settings = $(this).data('settings');

        // // Do we want this condition?
        // if (settings.$container.hasClass(settings.animating_class)) {
          // return;
        // }
        if (position === settings.position || $('body').hasClass('menu-open')) {
          return;
        }

        // negative means take it from the end.
        if (position < 0) {
          position = settings.$sections.length - position;
        }

        // Make sure the position is inside the range.
        position = Math.max(0, position);
        position = Math.min(settings.$sections.length - 1, position);



        var
          container_y = -position * 100,
          title_y = -position * 3,
          $next_section = settings.$sections.eq(position);
          
          // container_y = (container_y / 100) * settings.$container.height();
          
        // settings.$container
          // .css({
            // '-webkit-transform': 'translate3d(0, ' + container_y + '%, 0)',
            // '-moz-transform': 'translate3d(0, ' + container_y + '%, 0)',
            // '-ms-transform': 'translate3d(0, ' + container_y + '%, 0)',
            // 'transform': 'translate3d(0, ' + container_y + '%, 0)'
          // })
          // .css({
            // '-webkit-transform': 'translate3d(0, ' + container_y + 'px, 0)',
            // '-moz-transform': 'translate3d(0, ' + container_y + 'px, 0)',
            // '-ms-transform': 'translate3d(0, ' + container_y + 'px, 0)',
            // 'transform': 'translate3d(0, ' + container_y + 'px, 0)'
          // })
          // .css('position', 'relative')
          // .css('margin-top', ((container_y/100) * settings.$container.height()))
          // .addClass(settings.animating_class);
          
        settings.$sections
          .css({
            '-webkit-transform': 'translate3d(0, ' + container_y + '%, 0)',
            '-moz-transform': 'translate3d(0, ' + container_y + '%, 0)',
            // '-ms-transform': 'translate3d(0, ' + container_y + '%, 0)',
            'msTransform': 'translate(0, ' + container_y + '%)',
            'transform': 'translate3d(0, ' + container_y + '%, 0)'
          })

        settings.information.$link
          .css({
            '-webkit-transform': 'translate3d(0, ' + title_y + 'em, 0)',
            '-moz-transform': 'translate3d(0, ' + title_y + 'em, 0)',
            // '-ms-transform': 'translate3d(0, ' + title_y + 'em, 0)',
            'msTransform': 'translate(0, ' + title_y + 'em)',
            'transform': 'translate3d(0, ' + title_y + 'em, 0)'
          });
          // .css('margin-top', title_y + 'em');

        settings.$sections.filter('.' + settings.selected_class).removeClass(settings.selected_class);
        $next_section.addClass(settings.selected_class);

        settings.information.$position.text(position + 1);

        settings.position = position;
        
        // console.log(position, settings.$sections.length);
        if (position == settings.$sections.length - 1) {
          settings.information.$down_arrow.addClass('upsidedown');
        } else {
          settings.information.$down_arrow.removeClass('upsidedown');
        }
        
        $(this).trigger('scrolled');
      });
    },

    get_items: function () {
      return settings.$sections;
    }
  };

  $.fn.scroller = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    if (typeof method === 'object' || !method) {
      return methods.initialize.apply(this, arguments);
    }
    $.error('Method ' + method + ' does not exist on jQuery.scroller');
  };

}(jQuery));

(function ($) {
  // Drupal.behaviors.scroller = {
    // attach: function(context, settings) {
      // $('.scroller', context).scroller();
    // }
  // };

  $(function() {
    $('.scroller').scroller();

    if (location.search !== '') {
      var query = location.search.substr(1).split('&');
      for (var i in query) {
        var argument = query[i].split('=');

        if (argument[0] == 'id') {
          $('.scroller').scroller('scroll_to_element', $('.scroller-data[data-id="' + argument[1] + '"]').closest('.scroller-item'));
        }
      }
    }
  });
}(jQuery));