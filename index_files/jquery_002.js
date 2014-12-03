// 
// See jquery.init.js, for the following global variables:
// - headerMinHeight
// - headerMaxHeight 
// - scrollSizingArea

(function($) {
  $(window).scroll(function (e) {
    if ($('.page-calendar-2013').length > 0) {
      $('#header').css('height', headerMinHeight);
      return;
    }
      
    var scrollTop = $(window).scrollTop() || $('html,body').scrollTop();
    if ( scrollTop < scrollSizingArea ) {
      // If we're still scrolling in the first X amount of pixels keep sizing.
      $('#header').css('height', headerMaxHeight - scrollTop);
    } else if ($('#header').height() > headerMinHeight) {
      // If the header is larger than 50 set it to 50.
      // This will only happen if we're out of our scroll-sizing area
      $('#header').css('height', headerMinHeight);
    }

    // Set selected link:
    var $selected = null;
    $('.block-ref').each(function (index, element) {
      var $element = $(element);
      
      // If there's no selected element yet, set the first one we meet.
      if ($selected === null) {
        $selected = $element;
      }
      
      // If the current element is below the header select it.
      if (scrollTop + headerMinHeight >= $element.offset().top) {
        $selected = $element;
      }
    });
    
    // Set the selected section.
    if ($selected) {
      set_active_section($selected.find('.section-title').html());
    }
  });
  
  $(window).resize(function (e) {
    var $lastSection = $('.block-ref').last();
    if ($lastSection.length == 0) {
      $('body').css('margin-bottom', 0);
      return;
    }
    
    var lastHeight = $lastSection.height() + 438;
    var diff = $(window).height() - lastHeight;
    
    if (diff > 0) {
      $('body').css('margin-bottom', diff + 19);
    } else {
      $('body').css('margin-bottom', 0);
    }
  });
  
  function set_active_section(title) {
    // Insert the title in our section title.
    $('#section-title-container').html(title);
    
    // Find and activate the right section menu item.
    $('#block-site-module-section-menu .item-list a').each(function (index, element) {
      var $element = $(element);
      if ($element.html() == title) {
        $element.addClass('active');
      } else {
        $element.removeClass('active');
      }
    });
  }
})(jQuery);
//(function($) {
//
//  $.fn.b14Scroll = function() {
//    return this.each(function() {
//      
//      // TODO: do docs
//      var headerMinHeight = 124,
//        headerMaxHeight = 182,
//        scrollSizingArea = headerMaxHeight - headerMinHeight;
//      
//      // The wrapper which should be scrollable
//      var wrapper = $(this);
//      // The html header
//      var header = wrapper.find('#header');
//      
//      // The top div container the static content sections on the page (node-type: page).
//      var sections = $('.block-ref', wrapper);
//      // The menu linking to the different section on the page (node-type: page).
//      var section_menu = $('#block-site-module-section-menu .item-list a');
//      
//      // The div containing the title of the current section
//      var section_title_container = $('#section-title-container', header);
//      // The position of this container - used for reference
//      var container_pos = section_title_container.offset().top;
//      // The current title - initially the top section
//      var current_title = $('.section-title',sections.eq(0)).html();
//
//      /*
//       * Init
//       */
//      var init = function() {
//        // Hide title of first section
//        $('.section-title',sections.eq(0)).hide();
//        set_active_section(current_title);
//      }
//
//      /*
//       * Method: Set the active menu-item and title
//       */
//      var set_active_section = function(title) {
//    
//        // Inject the title into the container
//        section_title_container.html(title);
//    
//        // Find the corresponding link in the menu, and add active class
//        // Remove active class from all other
//        $(section_menu).each(function() {
//          if ($(this).html() == title) {
//            $(this).addClass('active');
//          } else {
//            $(this).removeClass('active');
//          }
//        });
//      };
//      
//      /*
//       * Event listener: Scroll
//       */
//      wrapper.scroll(function (e) {
//        
//        if ( $('#outer-wrapper').scrollTop() < scrollSizingArea ) {
//          header.css('height', headerMaxHeight - wrapper.scrollTop());
//        } else if (header.height() > headerMinHeight) {
//          header.css('height', headerMinHeight);
//        }
//        current_title = section_title_container.html();
//        container_pos = section_title_container.offset().top;
//        
//        sections.each(function () {
//          if ($(this).offset().top < (container_pos + 6)) {
//             current_title = $('.section-title', this).html();
//          }
//        });
//        set_active_section(current_title);
//      });
//
//      /*
//       * Event listener: Click
//       */      
//      section_menu.click(function (e) {
//        e.preventDefault();
//        
//        var link_title = $(this).html();
//        var scroll_to_pos = 0;
//        
//        sections.each(function () {          
//          if ($('.section-title', this).html() == link_title) {
//            scroll_to_pos = $(this).position().top;
//            return false;
//          }
//        });
//        if (scroll_to_pos > 0) scroll_to_pos += 109;
//        $('#outer-wrapper').stop().animate({'scrollTop':scroll_to_pos}, 1000);
//      });
//      
//      init();    
//    });
//  };
//})(jQuery);  