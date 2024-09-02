//Codi convertit de jQuery (original: https://github.com/Liinkiing/jquery-timelify)

// Define the isVisible function for a DOM element
function isVisible(element, offset) {
    var rect = element.getBoundingClientRect();
    return (
        (rect.height > 0 || rect.width > 0) &&
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight - offset || document.documentElement.clientHeight - offset) &&
        rect.left <= (window.innerWidth - offset || document.documentElement.clientWidth - offset)
    );
}

// Define the timelify function for a set of DOM elements
function timelify(elements, options) {
    var settings = Object.assign({
        animLeft: "bounceInLeft",
        animRight: "bounceInRight",
        animCenter: "bounceInUp",
        animSpeed: 300,
        offset: 150
    }, options);

    var timelineItems = elements.querySelectorAll('.timeline-items li');

    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY || document.documentElement.scrollTop;
        if (document.querySelectorAll('.timeline-items li.is-hidden').length > 0) {
            if (scrollPos > elements.offsetTop - 600) {
                timelineItems.forEach(function(item) {
                    if (isVisible(item, settings.offset)) {
                        item.classList.remove('is-hidden');
                        item.classList.add('animated');
                        item.style.animationDuration = settings.animSpeed + 'ms';
                        if (!item.classList.contains('inverted')) {
                            if (item.classList.contains('centered')) {
                                item.classList.add(settings.animCenter);
                            } else {
                                item.classList.add(settings.animLeft);
                            }
                        } else {
                            item.classList.add(settings.animRight);
                        }
                    }
                });
            }
        }
    });

    return elements;
}
