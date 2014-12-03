var headerMinHeight = 116;
var headerMaxHeight = 182;
var scrollSizingArea = 66;
var resizeTimeId = 0;
var scrollToAdjustment = 112;
 scrollToAdjustment = 130;
  
(function ($) {

	Drupal.behaviors.b14Scroll = {
		attach: function(context, settings) {
	    // Hide the first section title.
	    $('.section-title').eq(0).hide();
	    
	    // Setup the section menu clicks.
	    $('#block-site-module-section-menu .item-list a').click(function (e) {
        e.preventDefault();
        
        // Match their HREF with the ID of the section
        var scroll_to_pos = $('#block-' + $(this).attr('href').substr(1)).position().top;
        if (scroll_to_pos > 0) {
          scroll_to_pos += scrollToAdjustment;
        }
        
        // The animation speed is proportional of the distance to travel
        var speed = Math.abs($('html').position().top + scroll_to_pos) * 0.7;
                
        // And scroll.
        $('html,body').stop().animate({
          'scrollTop': scroll_to_pos
        }, speed, 'easeInOutCubic');
      });
	    
	    if (window.location.hash != '') {
	      // The delay allows the browser to do a smoother slide. 
	      setTimeout(function () {
	        $('#block-site-module-section-menu .item-list a[href="'+ window.location.hash +'"]').click();
	      }, 700);
	    }
  	  
	    // Call the scroll function when the site is loaded.
	    // Some browsers save the current scroll position when reloading, and we
	    // need to properly resize the header again.
	    $(window).scroll();
	    
	    // We call the resize shortly after we're ready to let the page
	    // "fall into place", before we add any needed bottom margin.
	    setTimeout('jQuery(window).resize()', 100);
		}
	};
	
	Drupal.behaviors.footer = {
	  attach: function(context, settings) {
	    $('#block-site-module-site-footer .goto-top').click(function(e) {
	      e.preventDefault();
	      
        $('html,body').stop().animate({
          'scrollTop': 0
        }, Math.abs($('html').position().top) * 0.6, 'easeInOutCubic');	      
	    });
	  }
	};
	
	Drupal.behaviors.casesGotoImages = {
	  attach: function(context, settings) {
	    $('body.node-type-article-case .node-article-case .meta-links a.goto-images',context).click(function(e) {
	      e.preventDefault();
	      $('.image-viewer .item').eq(0).trigger('click');
	    });
	  }
	}
	
	Drupal.behaviors.b14ImageViewer = {
    attach: function(context, settings) {
	    // Because of webkit browsers, not handling the ready event properly
	    // we're using the $(window).lood() below to setup the b14ImageViewer.
	  
	    // This means that we can't dynamically load content, and then run setup
	    // the viewer.
	    // If we need to handle this sometime, figure out a clean way of calling
	    // the load function again without doing it double the first time around.
    }
  };
	$(window).load(function (loadEvent) {
	  if ($.browser.msie && parseInt($.browser.version) <= 7) {
	    $('.node-article-employee .video-list .image-dual-hover').remove();
	  }
	  // Setup the image viewers
	  var $imageViewers = $('body.node-type-article-case .image-viewer').b14ImageViewer({
      'margin_top': headerMinHeight +30,
      // The scroll_handler is called when the window is scrolled. 
      'scroll_handler': function ($image_viewer) {
	      if ($image_viewer.hasClass('zooming')) {
	        return true;
	      }
        var scrollTop = $(window).scrollTop() || $('html,body').scrollTop();
        
        // If the viewport is scrolled up, so you can't see the bottom of the
        // images anymore, we return false, telling the b14ImageViewer to
        // deselect the image, and jump out of the "big-view".
        if (scrollTop < ($image_viewer.offset().top - ($(window).height() -$image_viewer.height()))) {
          return false;
        }
        
        return true;
      }
    });
	  
	  // If there's any image viewers on the page, setup a window resize event, to
	  // change the image_multiplier of the b14ImageViewer, when the window resizes.
    if ($imageViewers.length > 0) {
      $(window).resize(function (e) {
        // Clear the current timeout, if there's one.
        if (resizeTimeId > 0) {
          clearTimeout(resizeTimeId);
        }
        
        // We need to set this on a short timeout, because the iPad will resize
        // the entire window, as we change the image size.
        resizeTimeId = setTimeout('jQuery("body.node-type-article-case .image-viewer").b14ImageViewer("multiplier", jQuery(window).height() - headerMinHeight - 120);', 100);
      });
      
      $(document).keyup(function (e) {
        if ($imageViewers.hasClass('zoomed')) {
          switch (e.keyCode) {
            case 37: // left arrow
              $imageViewers.b14ImageViewer('previous');
              break;
            case 32: // space
            case 39: // right arrow
              $imageViewers.b14ImageViewer('next');
              break;
          }
          
        }
      });
      
      // And we make sure the resize is called once, so we have the correct
      // image multiplier.
      $(window).resize();
    }
	});

  /*	
	Drupal.behaviors.sectionTitles = {
		attach: function(context, settings) {
		}
	};
	*/
	
	// Setup the video handler.
	Drupal.behaviors.videoHandler = {
    attach: function(context, settings) {
//  	  var tag = document.createElement('script');
//      tag.src = "http://www.youtube.com/player_api";
//      var firstScriptTag = document.getElementsByTagName('script')[0];
//      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
	    $('.node-article-employee .video-list .image-dual-hover', context).click(function (e) {
	      var $element = $(this);
	      var $videoElement = $element.parent().children().first();
	      if ($videoElement.hasClass('media-youtube-outer-wrapper')) {
	        $videoElement = $videoElement.find('iframe');
	      }
	      $element.fadeOut(500);
	      
	      callYoutubePlayer($videoElement.attr('id'), 'playVideo');
	    });
    }
  };
	
	/*
	 * Behavior: Views Custom Filter
	 * Set up handler for views custom filter
	 */
  Drupal.behaviors.viewsCustomFilter = {
    
    attach: function(context, settings) {
      
      $('.view .view-custom-filter a.filter-item-link').click(function(e) {
        
        e.preventDefault();
        
        var $view = $(this).parents('.view');
        
        var viewName = /view-id-(\w+)/.exec($view.attr('class'))[1];
        var viewDisplayId = /view-display-id-(\w+)/.exec($view.attr('class'))[1];
        var viewDomId = /view-dom-id-(\w+)/.exec($view.attr('class'))[1];
        
        var params = getURLParams($(this).attr('href'));
                
        $.ajax({
          'type': 'POST',
          'url': Drupal.settings.basePath + 'views/ajax',
          'dataType': 'json',
          'data': {
            'view_name': viewName,
            'view_display_id': viewDisplayId,
            //'view_path': 'node/21', // not sure if these has any relevance ??
            //'view_base_path': null,
            'view_dom_id': viewDomId,
            'view_args': params.tid,
            'pager_element': 0
          },
          'complete': onAjaxFilterComplete
          }
        );              
      });
    }
    
  };
  
  var onAjaxFilterComplete = function(data, textStatus, jqXHR) {
       
    var response = $.parseJSON(data.response);
    var resultData = response[1];
    var $target = $(resultData.selector);    
       
    $target.html(resultData.data); 
    Drupal.attachBehaviors($target);
    
    // Fake 'click' event on 'all cases' menu link - and scroll to 'all cases'
    // The id is hardcoded, 'cause its not likely to change
    $('#block-site-module-section-menu .item-list li a[href|="#views-cases-all-block"]').trigger('click');
  };
  
  var getURLParams = function(url) {
    
    var params = {};
    
    var queryStr = decodeURIComponent(url.substr(url.indexOf('?')+1));
    var queryList = queryStr.split('&');
    
    for (var i in queryList) {
      var pair = queryList[i].split('=');
      params[pair[0]] = pair[1];
    }
    return params;
  };

  Drupal.behaviors.thoughts = {
    attach: function(context, settings) {
      
      $('#block-views-thoughts-thoughts #view-thoughts-index').html('');
      
      $('#block-views-thoughts-thoughts .view-content').cycle({
        'fit': 1,
        'speed': 150,
        'timeout': 0,
        'pager': '#view-thoughts-index',
        'prev': '#thoughts-prev',
        'next': '#thoughts-next',        
        'pagerAnchorBuilder': function(idx, slide) {
          return '<span class="index-item"><a href="#">' + $('.title', slide).html() + '</a></span>';
        },
        'after': function(cElem, nElem, options, fFlag) {
          var i = options.elements.indexOf(nElem);
          
          var pi = (i-1 < 0 ? options.elements.length-1 : i-1);
          var ni = (i+1 > options.elements.length-1 ? 0 : i+1);
                    
          $('span.label',options.prev).html($('.title',options.elements[pi]).html());
          $('span.label',options.next).html($('.title',options.elements[ni]).html());
        }
      });
    }
  };

  Drupal.behaviors.insideLabels = {
    attach: function(context, settings) {
      $('input.form-text, input.entity-search', context)
        .focus(function (e) {$(this).siblings('label').hide()})
        .blur(function (e) {$(this).val() == '' && $(this).siblings('label').show()})
        .each(function (e) {$(this).val() != '' && $(this).siblings('label').hide()})
        .siblings('label').each(function () {
          $(this).css({
            'position':'absolute'
          });
        });
           
      // textarea form elements is nested in a div, so they need their own.
      $('textarea.form-textarea', context)
        .focus(function (e) {$(this).parent().siblings('label').hide()})
        .blur(function (e) {$(this).val() == '' && $(this).parent().siblings('label').show()})
        .each(function (e) {$(this).val() != '' && $(this).parent().siblings('label').hide()})
        .parent().siblings('label').each(function () {
          $(this).css({
            'position':'absolute'
          });
        });
    }
  }

})(jQuery);

/*
 * @author       Rob W (http://stackoverflow.com/questions/7443578/youtube-iframe-api-how-do-i-control-a-iframe-player-thats-already-in-the-html/7513356#7513356)
 * @description  Executes function on a framed YouTube video (see previous link)
 *               For a full list of possible functions, see:
 *               http://code.google.com/apis/youtube/js_api_reference.html
 * @param String frame_id The id of the div containing the frame
 * @param String func     Desired function to call, eg. "playVideo"
 * @param Array  args     (optional) List of arguments to pass to function func*/
function callYoutubePlayer(frame_id, func, args){
    if(!frame_id) return;
    if(frame_id.id) frame_id = frame_id.id;
    else if(typeof jQuery != "undefined" && frame_id instanceof jQuery && frame_id.length) frame_id = frame_id.get(0).id;
    if(!document.getElementById(frame_id)) return;
    args = args || [];

    //console.log('CALL: ' + frame_id + "("+ func +")")
    
    /*Searches the document for the IFRAME with id=frame_id*/
    var all_iframes = document.getElementsByTagName("iframe");
    for(var i=0, len=all_iframes.length; i<len; i++){
        if(all_iframes[i].id == frame_id || all_iframes[i].parentNode.id == frame_id){
           /*The index of the IFRAME element equals the index of the iframe in
             the frames object (<frame> . */
           window.frames[i].postMessage(JSON.stringify({
                "event": "command",
                "func": func,
                "args": args,
                "id": 1/*Can be omitted.*/
            }), "*");
        }
    }
}