/*jshint forin:false, jquery:true, browser:true, indent:2, trailing:true, unused:false */
/*global Drupal */

(function ($) {

  window.is_mobile = function () {
    return $('#footer').css('display') === 'none';
  }
  
  window.is_tablet = function () {
    return is_mobile() || $('.is-tablet').css('top') === '1px';
  }
  
  $(function () {
  
    if ($.browser.msie && $.browser.version < 11) {
      $('html').addClass('no-pointer-events');
    }
  
    $(window).resize(function () {
      if (window.innerWidth > 360) {
        $('img[data-full-image]').not('.previewed').each(function () {
          var $img = $(this);
          
          $img.imagesLoaded(function (evt) {
            if (!$img.hasClass('previewed')) {
              $img
                .attr('src', $img.attr('data-full-image'))
                .addClass('previewed');
            }
          });
        });
        
        $('.back-to-full[data-full-background]').not('.previewed').each(function () {
          var
            image = new Image(),
            $element = $(this);
          
          $element.addClass('previewed');
          $(image).bind('load', function (evt) {
            $element.css('background-image', 'url("' + this.src + '")');
          }).attr('src', $element.attr('data-full-background'));
        });
      }
    })
  });
  
  Drupal.behaviors.helper = {
    
        
    attach: function(context, settings) {
      var
        helper = JSON.parse(docCookies.getItem('helper')) || {},
        is_scroller = $('.scroller').length > 0,
        type = is_scroller ? 'scroller' : 'page',
        timeout_id = 0,
        first = true;
      
        
      if (!window.is_mobile() && (helper[type] === undefined || helper[type] < 2)) {
        
        if (helper[type] === undefined) {
          helper[type] = 0;
        }
        helper[type]++;
        
        docCookies.setItem('helper', JSON.stringify(helper), Infinity);
        
        setTimeout(function () {
          $('.scroll-reminder').addClass('open');
          $('.down-arrow').fadeOut();
          
          setTimeout(function () {
            $('.scroll-reminder').removeClass('open');
            $('.down-arrow').delay(250).fadeIn();
            
            if (timeout_id === 0) {
              timeout_id = setTimeout(function () {
                $('.scroll-reminder').addClass('open');
                $('.down-arrow').fadeOut();
                setTimeout(function () {
                  $('.scroll-reminder').removeClass('open');
                  $('.down-arrow').delay(250).fadeIn();
                  
                  timeout_id = setTimeout(function () {
                    $('.scroll-reminder').addClass('open');
                    $('.down-arrow').fadeOut();
                    setTimeout(function () {
                      $('.scroll-reminder').removeClass('open');
                      $('.down-arrow').delay(250).fadeIn();
                    }, 5000);
                  }, 5000)
                  
                }, 5000);
              }, 5000);
            }
          }, 5000);
          
          $('.scroller').bind('scrolled.helper', function () {
            close_helper();
          });
          
          $(window).bind('scroll.helper', function () {
            close_helper();
          });
          
          $('.main-menu .expanded a').bind('click.helper', function () {
            close_helper();
          });
        }, 500);
      }
      
      function close_helper() {
        clearTimeout(timeout_id);
        timeout_id = -1;
        $('.scroll-reminder').removeClass('open');
        $('.down-arrow').delay(250).fadeIn();
        
        $('.scroller').unbind('scrolled.helper');
        $(window).unbind('scroll.helper');
        $('.main-menu .expanded a').unbind('click.helper');
      }
    }
  };
  
  Drupal.behaviors.case_menu = {
    attach: function(context, settings) {
      var $body = $('body');
      
      var scrollTop = 0;
      $('.sub-menu a', context)
        .bind('touchstart', function (e) {
          scrollTop = $(this).closest('li').scrollTop();
        })
        .bind('touchend', function(e) {
          if (!window.is_mobile()) {
            return;
          }
          
          e.preventDefault();
          
          var el = $(this);
          var link = el.attr('href');
          var scrollDelta = Math.abs($(this).closest('li').scrollTop() - scrollTop);
          
          // alert(scrollDelta + "\n" + link);
          
          if (scrollDelta < 5) {
            window.location = link;
          }
          
        });

      $('.sub-menu > li').each(function (delta, li) {
        // $(li).css('right', - $(li).outerWidth());
      });
      $('.sub-menu', context).addClass('ready');

      $('.main-menu .expanded a', context).click(function(evt) {
        evt.preventDefault();
        
        var
          $a = $(this),

          $selected = $('.sub-menu > li.selected'),
          $next = $('.sub-menu > li.id-' + $a.attr('data-id'));
          
        $a.parent().parent().children().removeClass('active-link');
        $a.parent().addClass('active-link');

        if (!$next.hasClass('selected')) {
          $selected
            // .css('right', - $selected.outerWidth())
            .removeClass('selected');

          $next
            // .css('right', '0%')
            .addClass('selected');

          $body.addClass('menu-open');
          setTimeout(function () {
            $body.css('overflow', 'hidden');
          }, 50);
        } else {
          $selected
            // .css('right', - $selected.outerWidth())
            .removeClass('selected');

          $body.removeClass('menu-open');
          setTimeout(function () {
            $body.css('overflow', '');
          }, 50);
          
          $a.parent().parent().children().removeClass('active-link');
        }
      });
      
      $('a.open-menu', context).bind('click', function(evt) {
        evt.preventDefault();
        $('.main-menu .expanded a.menu-' + $(this).attr('href').substr(1)).triggerHandler('click');
      });

      
      $('.node-case.view-mode-menu', context)
        .bind('mouseover', function (evt) {
          var
            id = $(this).attr('data-id'),
            $preview = $('.view-cases.view-display-id-preview .node-case[data-id="' + id + '"]'),
            height = $('.view-cases.view-display-id-preview').height(),
            item_height = $preview.outerHeight(),
            offset = $preview.position().top;
          
          $('.view-cases.view-display-id-preview .node-case.selected').removeClass('selected');
          $preview.addClass('selected');
          
          // console.log(offset);
          
          offset = offset - ((height - item_height) / 2);
          
          offset = -offset;
          
          offset = Math.round(offset);
          
          $('.view-cases.view-display-id-preview .view-content')
            .css({
              '-webkit-transform': 'translate3d(0, ' + offset + 'px, 0)',
              '-moz-transform': 'translate3d(0, ' + offset + 'px, 0)',
              // '-ms-transform': 'translate3d(0, ' + offset + 'px, 0)',
              'msTransform': 'translate(0, ' + offset + 'px)',
              'transform': 'translate3d(0, ' + offset + 'px, 0)'
            });
            // .css('top', offset + 'px');
          
          // .css('transform', 'translateY(' + (-offset) + 'px)');
          
          $('.view-cases.view-display-id-preview').addClass('show');
        })
        .bind('mouseout', function() {
          $('.view-cases.view-display-id-preview').removeClass('show');
        })
      
      $('.view-cases.view-display-id-menu', context)
        .bind('mousemove', function (evt) {
          if ($(this).parent().css('overflow-y') != 'hidden') {
            return;
          }
          var
            offset = getOffset(evt),
            height = $(this).height(),
            container_height = $(this).parent().height(),
            percentage = offset.y / height
            new_margin = (height - container_height) * -percentage;
            
          new_margin = Math.min(0, new_margin);
          $(this).css('margin-top', new_margin);
        });
    }
  };
  
  function getOffset(evt) {
    var el = evt.currentTarget,
        x = y = 0;

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }

    x = evt.clientX - x;
    y = evt.clientY - y;

    return { x: x, y: y };
  }
  
  $(function () {
    $(window).bind('resize', function (evt) {
      var
        height = $('.view-cases.view-display-id-preview').height();
        
      $('.view-cases.view-display-id-preview .node-case').each(function (delta, preview) {
        var
          $preview = $(preview);
          
        $preview.css('margin-bottom', Math.round((height - $preview.outerHeight()) / 3));
      });
      
      $('.sub-menu > li').not('.selected').each(function (delta, li) {
        // $(li).css('right', - $(li).outerWidth())
      });
    }).triggerHandler('resize');
    setTimeout(function () { $(window).triggerHandler('resize'); }, 0);
  });

  // Handle color fading
  Drupal.behaviors.color_fading = {
    attach: function(context, settings) {
      $('.cover, .section-text-on-background', context).each(function (delta, element) {
        var
          $element = $(element),
          $color_container = $element.closest('[data-colors]');

        // Setup the color fading.
        if ($color_container.attr('data-colors')) {
          $element
            .bind('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (evt) {
              var
                colors = $color_container.attr('data-colors').split('|'),
                color_position = (($element.data('color-position') || 0) + 1) % colors.length,
                new_color = colors[color_position];

              $element.data('color-position', color_position);
              $(this).css('background-color', new_color);
            }).triggerHandler('transitionend');
        }
      });
    }
  };
  
  // Select menu
  Drupal.behaviors.tweet_this = {
    attach: function(context, settings) {
      $('#tweet-this').bind('click', function(evt) {
        evt.preventDefault();
        
        window.open($(this).attr('href'), 'tweet_this', 'height=440,width=640');
      });
      
      $('.entity-section', context).selectedMenu({
        onSelect: function (selectedText, rect) {
          selectedText = '"' + $.trim(selectedText) + '" @b14dk';
          if (selectedText.length < (140 - 22)) {
            var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(selectedText) + '&url=' + encodeURIComponent(location.href);
            
            $('#tweet-this')
              .attr('href', url)
              .css({
                top: ($(window).scrollTop() + rect.yStart + (rect.yEnd - rect.yStart) / 2)
              })
            setTimeout(function () { $('#tweet-this').addClass('shown') }, 0);
          } else {
            $('#tweet-this').removeClass('shown')
          }
        },
        onDeselect: function () {
          $('#tweet-this').removeClass('shown')
        }
      });
    }
  };
  
  // Launch site
  Drupal.behaviors.launch_site = {
    attach: function(context, settings) {
      $('.launch-site a').hover(
        function() {
          $( this ).children('.icon-gif').css('background-image', 'url("http://b14.dk/sites/all/themes/framework/images/b14_LaunchProject_01_02@2x.gif")' );
        }, function() {
          $( this ).children('.icon-gif').css('background-image', 'url("http://b14.dk/sites/all/themes/framework/images/LaunchProject_holder.png")' );
        }
      );    
    }
  };

  // Handle the top-covers.
  $(function () {

    // Should we put this in a behavior?
    var $top_cover = $('.top-cover');
    if ($top_cover.length > 0) {
      var inner_height;
      $(window)
        .bind('resize', function (evt) {
        
          if (window.is_tablet()) {
            $('.view-mode-full > .content').css({
              'margin-top': '', //(12*3)
            });
            
            var deviceHeight = (window.outerHeight < window.innerHeight)
              ? window.outerHeight : window.innerHeight;
            
            $top_cover
              .css('height', deviceHeight - 36 * 2)
              .show();
            return;
          }
        
          inner_height = $(window).height() - $('#header').outerHeight() - (12 * 3);
          $top_cover.css({
            'height': inner_height
          });
          
          // What do we want here? window.height or innerheight?
          $('.view-mode-full > .content').css({
            marginTop: (inner_height + ((12 * 3)) - 1) + 'px' // $(window).height()
          });
        })
        .bind('scroll', function (evt) {
          if (window.is_tablet()) {
            $top_cover.show();
            return;
          }
          
          if($(window).scrollTop() > $(window).height()){
            $top_cover.hide();
          } else {
            $top_cover.show();
          }
        })
        .triggerHandler('resize');
    }
  });


  // Add the effect class
  $(function () {
    var effect_class = 'opacity';


    // Check for css filters.
    // Technique stolen from:
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/filters.js
    var
      el = document.createElement('div'),
      browserPrefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    el.style.cssText = browserPrefixes.join('filter' + ':blur(2px); ');
    if (!!el.style.length && ((document.documentMode === undefined || document.documentMode > 9))) {
      effect_class = 'cssfilter';
    }

    $('html').addClass('effect-' + effect_class);
  });




  // Handle mid-page uncoverings.
  $(function () {
    if ($('.undercover').length === 0) { return; }

    var
      $container = $('.node.view-mode-full'),
      $content = $('.node.view-mode-full > .content'), //.addClass('covered'),
      $undercover = $('.undercover'),
      $after_undercover = $('.after-undercover'),
      ub = 0;;
    

    $(window)
      .bind('scroll', function (evt) {
        if (window.is_tablet()) {
          $content.css('margin-bottom', '');
          return;
        }
        
        var scroll_top = $(this).scrollTop();

        var
          bottom = Math.round($content.offset().top + $content.outerHeight() + ub),
          diff = scroll_top + $(window).height() - bottom;

        if (diff > 0) {
          if (diff < $undercover.outerHeight()) { // weird jumping
            if (!$container.hasClass('uncovering')) {
              $content.css('margin-bottom', $undercover.outerHeight(true) + $after_undercover.outerHeight());
              $after_undercover.css('margin-bottom', '');

              $container
                .removeClass('uncovered covered')
                .addClass('uncovering');
            }
          } else {
            if (!$container.hasClass('uncovered')) {
              $content.css('margin-bottom', '');
              $after_undercover.css('margin-bottom', '');

              $container
                .removeClass('uncovering covered')
                .addClass('uncovered');
            }
          }
          // }
        } else {
          if (!$container.hasClass('covered')) {
            $after_undercover.css('margin-bottom', $undercover.outerHeight());
            $content.css('margin-bottom', '');

            $container
              .removeClass('uncovering uncovered')
              .addClass('covered');
          }
        }

      })
      .bind('resize', function (evt) {
        if (window.is_mobile()) {
          $content.css('margin-bottom', '');
          return;
        }
        
        $undercover.css('bottom', $after_undercover.outerHeight(false));
        ub = $after_undercover.outerHeight(false);
      })
      .triggerHandler('scroll');
  });


}(jQuery));

(function(c,q){var m="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function n(){var b=c(j),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function p(b){k(b.target,"error"===b.type)}function k(b,a){b.src===m||-1!==c.inArray(b,l)||(l.push(b),a?h.push(b):j.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),r&&d.notifyWith(c(b),[a,e,c(j),c(h)]),e.length===l.length&&(setTimeout(n),e.unbind(".imagesLoaded",
p)))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():0,r=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),l=[],j=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",p).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)k(a,e.isBroken);else if(a.complete&&a.naturalWidth!==q)k(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=m,a.src=d}):
n();return d?d.promise(g):g}})(jQuery);
