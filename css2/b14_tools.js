(function($) {
  $.fn.extend({
    userDebug: function(options) {
      // Set default values
      var defaults = {
        user: -1,
        output: '',
      };
      // Populate the options with missing default values.
      var options = $.extend(defaults, options);
      // Execute
      return this.each(function() {
      	if(options.user == -1 || Drupal.settings.user == options.user) {
      		if(window.console) {
      			window.console.log(options.output);
      		}
      	}
      });
    },
  });

  /**
   * Inject destination query strings for current page.
   */
  Drupal.behaviors.clearCacheDestination = {
    attach: function(context, settings) {
      if (Drupal.settings.b14_tools.destination) {
        $('a#toolbar-link-admin-flush-cache', context).each(function() {
          var $href = $(this).attr('href');
          $href += ($href.indexOf('?') == -1 ? '?' : '&') + Drupal.settings.b14_tools.destination;
          $(this).attr('href', $href );
        });
      }
    }
  }
/**
 * @} End of "B14_tools js".
 */

})(jQuery);

/**
 *
 * b14 tool class
 *
 */
(function($) {

var b14 = {
  
  /*
   * Google Analytics Universal - Event tracking
   *
   *
   * nonInteraction 1/0 - An event will count as a non bounce unless nonInteraction is set
   *
   */
  event: function(category,action,label,nonInteraction) {
    if (ga) {
      // Defaults
      nonInteraction = nonInteraction == 1 ? 1:0;
      label = label == undefined ? "" : label;

      ga('send', {
        'hitType':        'event',          
        'eventCategory':  category,   
        'eventAction':    action,      
        'eventLabel':     label,
        'page':           window.location.pathname,
        'nonInteraction': nonInteraction    
      });
    
    }
  },
  
  /*
   * More tool functions here..
   *
   *
   */
   
};

window.b14 = b14;

})(jQuery);