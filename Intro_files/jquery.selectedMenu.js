/*jshint forin:false, jquery:true, browser:true, indent:2, trailing:true, unused:false */

(function ($) {
  $.fn.selectedMenu = function (options) {
    var
      opts = $.extend({}, $.fn.selectedMenu.defaults, options),
      self = this,
      lastSelect = '',
      isSelected = false;

    $(window).bind('mouseup.selectMenu keyup.selectMenu', function (evt) {
      var
        selection = window.getSelection(),
        ranges = [],
        range = {},
        rects = {},
        rect = {
          xStart: 9999999,
          xEnd: 0,
          yStart: 9999999,
          yEnd: 0
        },
        selectedText = '';
      
      if (selection.toString() === '') {
        if (isSelected) {
          lastSelect = '';
          opts.onDeselect.call(self);
        }
        isSelected = false;
        
        return;
      }
      
      if ($(selection.anchorNode).parents().filter(self).length === 0
          && $(selection.focusNode).parents().filter(self).length === 0) {
        if (isSelected) {
          lastSelect = '';
          opts.onDeselect.call(self);
        }
        isSelected = false;
        return;
      }
      
      
      // Get all the ranges.                         }
      for (var i = 0; i < selection.rangeCount; i++) {
        range = selection.getRangeAt(i);
        rects = range.getClientRects();

        // Set the rect
        for (var j = 0; j < rects.length; j++) {
          rect.xStart = Math.min(rect.xStart, rects[j].left);
          rect.yStart = Math.min(rect.yStart, rects[j].top);
          rect.xEnd = Math.max(rect.xEnd, rects[j].right);
          rect.yEnd = Math.max(rect.yEnd, rects[j].bottom);
        }
        
        ranges[i] = range.toString();
      }

      // Set the selected text.
      selectedText = ranges.join(opts.splitter);
      selectedText = selection.toString();
      isSelected = true;
      
      if (lastSelect == selectedText) {
        return;
      }
      
      lastSelect = selectedText;

      // Call the onSelect callback.
      var parent = $(selection.focusNode).parents().filter(self);
      if (parent.length == 0) {
        parent = $(selection.anchorNode).parents().filter(self);
      }
      opts.onSelect.call(parent, selectedText, rect);
    });

    return this;
  };

  $.fn.selectedMenu.defaults = {
    // String which will split the selected texts, when the selection spreads
    // out on more than one selection.
    splitter: ' ... ',

    // The function called when something is selected.
    onSelect: function (selectedText, rect) { },
    
    // The function called when something is selected.
    onDeselect: function () { }
  };

}(jQuery));