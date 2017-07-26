$(document).ready(function(){
    $(".nav-bar .nav-bar-mob").click(function(){
        $(this).next().slideToggle("fast");
        $(this).toggleClass("active");
    });
});