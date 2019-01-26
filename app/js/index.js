$(document).ready( () => {
    $(window).on('mousemove', parallaxBg);
    const el =  $('.first__illustration');
    let leftStart =  el.offset().left;
    function parallaxBg(e) {
        if ((window).innerWidth >= 1024) {
            let xpos = e.clientX;
            TweenMax.to(el, 2, {'x': `${-(leftStart/900 + (xpos/150))}`, ease: Power3.easeOut})
        }
    }
});