
$(document).ready(function() {
  $(".read-more").on("click", "p", function() {
    $(this).find(".more-content").slideToggle();
    $(this).find(".ion-chevron-down").toggleClass("ion-chevron-up");
  });
});