(function ($) {
	
	Drupal.behaviors.b14_image_dual_hover = {
		attach: function(context, settings) {
			$('.image-dual-hover', context).each(function (k,v) {
				var imgs = $(v).hover(
					function (e) {
						$('img.img-normal',this).stop().fadeTo(250,0);
					}, function (e) {
						$('img.img-normal',this).stop().fadeTo(250,1);
					}
				);
				// Set up hover selectors if any
				if (Drupal.settings.b14ImageTools && Drupal.settings.b14ImageTools.hoverSelectors) {
				
				    var instanceId = $('.instance-id', this).html();
					var selectors = Drupal.settings.b14ImageTools.hoverSelectors['id-'+instanceId];
										
					$(selectors, $(v).parents('.node:first')).hover(
						function (e) {
							$('img.img-normal',imgs).stop().fadeTo(250,0);
						}, function (e) {
							$('img.img-normal',imgs).stop().fadeTo(250,1);
						}
					);
				}
			});
		}
	}
})(jQuery);