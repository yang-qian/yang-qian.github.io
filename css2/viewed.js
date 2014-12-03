/*jshint forin:false, jquery:true, browser:true, indent:2, trailing:true, unused:false */
/*global Drupal, docCookies */

(function ($) {
  var 
    $viewed_buttons,
    viewed = {};
  
  Drupal.behaviors.viewed = {
    attach: function(context, settings) {
      viewed = JSON.parse(docCookies.getItem('viewed')) || {};
      
      // Setup the viewed buttons.
      var $buttons = $('.viewed-button', context).each(function (delta, viewed_button) {
        var
          $viewed_button = $(viewed_button),
          id = $viewed_button.attr('data-id'),
          type = $viewed_button.attr('data-type');

        // Setup the button event so the user can click it to switch the view.
        $('.not-viewed', viewed_button).click(function (evt) {
          evt.preventDefault();
          add_viewed(type, id);
        });
        
        // Add the viewed class to the button if it's already viewed.
        if (is_viewed(type, id)) {
          $viewed_button.addClass('viewed');
        }

        // Oh how I wish setImmediate was implemented, by other browsers than MSIE.
        setTimeout(function () { $viewed_button.addClass('ready'); }, 0);
      });
      
      // Add the new buttons to the 
      if ($viewed_buttons) {
        $viewed_buttons.add($buttons);
      } else {
        $viewed_buttons = $buttons;
      }
      
      $viewed_buttons = $viewed_buttons.not('.viewed');
      
      // Setup the case menu.
      update_viewed_menu('case');
    }
  };
  
  $(function () {
    $(window).bind('scroll', function (evt) {
      var scroll_top = $(window).scrollTop();
      
      $viewed_buttons.each(function (delta, viewed_button) {
        if (scroll_top + $(window).height() === $('body').outerHeight(true)) {
          var
            $viewed_button = $(viewed_button),
            id = $viewed_button.attr('data-id'),
            type = $viewed_button.attr('data-type');
          add_viewed(type, id);
          // $viewed_button.addClass('viewed');
        }
      });
      
      $viewed_buttons = $viewed_buttons.not('.viewed');
    }).triggerHandler('scroll');
  });
  
  function update_viewed_menu(type) {
    if (viewed[type] !== undefined) {
        var $link;
        for (var i in viewed[type]) {
          $link = $('.view-' + type + 's.view-display-id-menu .active .node-case[data-id="' + i + '"]');
          if ($link.length > 0) {
            $link.appendTo($('.view-' + type + 's.view-display-id-menu .visited .list'));
          }
          
          // Update preview
          $link = $('.view-' + type + 's.view-display-id-preview .active .node-case[data-id="' + i + '"]');
          if ($link.length > 0) {
            $link.appendTo($('.view-' + type + 's.view-display-id-preview .visited .list'));
          }
        }
      }
  }
  
  function add_viewed(type, id) {
    if (viewed[type] === undefined) {
      viewed[type] = {};
    }
    viewed[type][id] = id;
    
    $('.viewed-button[data-type="' + type + '"][data-id="' + id + '"]').addClass('viewed');
    update_viewed_menu(type);
    
    docCookies.setItem('viewed', JSON.stringify(viewed), Infinity);
    
    // track event
    b14.event("scroll","viewed");
  }
  
  function is_viewed(type, id) {
    return (viewed[type] !== undefined && viewed[type][id] !== undefined);
  }
}(jQuery));