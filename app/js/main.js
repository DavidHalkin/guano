$(document).ready(function(){
    $(".nav-bar .nav-bar-mob").click(function(){
        $(this).next().slideToggle("fast");
        $(this).toggleClass("active");
    });
});

$(window).scroll(function() {
if ($(this).scrollTop() > 50){  
    $('#wrapper').addClass("sticky-header");
  }
  else{
    $('#wrapper').removeClass("sticky-header");
  }
});