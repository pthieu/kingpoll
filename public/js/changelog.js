$(function() {
  $('#notes h4').click(function() {
    $(this).parent().find('span').slideToggle(100);
  });
});
