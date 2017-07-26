$(document).ready(function(){
    $(".nav-bar .nav-bar-mob").click(function(){
        $(this).next().slideToggle("fast");
        $(this).toggleClass("active");
    });
});

$(window).scroll(function() {
if ($(this).scrollTop() > 50){  
    $('header').addClass("sticky");
  }
  else{
    $('header').removeClass("sticky");
  }
});