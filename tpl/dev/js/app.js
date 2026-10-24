const onListener = function (element, type, selector, handler) {
    element.addEventListener(type, function (event) {
        if (event.target.closest(selector)) {
            handler(event);
        }
    });
};

function removeParam(param) {
    const params = new URLSearchParams(window.location.search);
    params.delete(param);
    window.history.replaceState({}, document.title, window.location.pathname + (params.toString() ? '?' + params.toString() : ''));
}

// ---------------------------------------------------------------
// Vídeos d'activitats i exposicions: reproductor accessible amb subtítols
// ---------------------------------------------------------------
document.addEventListener("click", function (event) {
    const link = event.target.closest("a.video-popup");
    if (!link) {
        return;
    }
    event.preventDefault();
    const caption = link.querySelector("figcaption");
    common.open_video_modal({
        url: link.href,
        subtitles: link.dataset.subtitles,
        title: caption ? caption.textContent.trim() : ""
    });
});

// ---------------------------------------------------------------
// Aparició dels elements dels llistats en entrar al viewport
// L'animació és CSS3 (dev/scss/blocks/_animations.scss): aquest codi només
// canvia la classe .js-reveal per .is-revealed quan l'element entra a la pantalla.
// Sense JS, o amb el moviment reduït activat, els elements es mostren directament.
// ---------------------------------------------------------------
(function () {
    const selector = ".galeria > li, .global-search-card, .cd-timeline__date";
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }
    const observer = new IntersectionObserver(function (entries) {
        // els que entren alhora (una fila sencera) es mostren escalonats
        let delay = 0;
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.style.animationDelay = Math.min(delay, 800) + "ms";
            delay += 80;
            entry.target.classList.replace("js-reveal", "is-revealed");
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -5% 0px" });

    const prepare = function (element) {
        if (element.classList.contains("js-reveal") || element.classList.contains("is-revealed")) {
            return;
        }
        element.classList.add("js-reveal");
        observer.observe(element);
    };
    const scan = function (root) {
        if (root.matches(selector)) {
            prepare(root);
        }
        root.querySelectorAll(selector).forEach(prepare);
    };

    // els llistats es pinten després de cridar l'API: cal vigilar els elements nous
    new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    scan(node);
                }
            });
        });
    }).observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener("DOMContentLoaded", function () {
        scan(document.body);
    });
})();

// ----------------
// Div com a button (quan no podem posar un element figure dins un button (ja que no valida) posem el div com si fos un button)
// ----------------
// delegated, so it also works for items added later (galleries loaded from the API)
document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }
    const divButton = event.target.closest(".button-like, [data-a11y-dialog-show][role='button']");
    if (divButton && divButton === event.target) {
        event.preventDefault();
        divButton.click();
    }
});

// ---------------------------------------------------------------
// Iframes del CMS sense title: un nom de reserva segons el contingut
// ---------------------------------------------------------------
function titleIframes(root) {
    (root || document).querySelectorAll("iframe:not([title])").forEach(function (iframe) {
        let host = "";
        try {
            host = new URL(iframe.src, location.href).hostname.replace(/^www\./, "");
        } catch (e) {}
        let title = host;
        if (/google\.[a-z.]+$/.test(host) && /maps/.test(iframe.src)) {
            title = tstring.iframe_map;
        } else if (/youtube|vimeo/.test(host)) {
            title = tstring.iframe_video;
        }
        if (title) {
            iframe.setAttribute("title", title);
        }
    });
}
document.addEventListener("DOMContentLoaded", function () {
    titleIframes(document);
});

// ---------------------------------------------------------------
// Enllaços que s'obren en una finestra nova: s'avisa als lectors de pantalla
// (també el contingut del CMS i el que es carrega després)
// ---------------------------------------------------------------
function markNewWindowLinks(root) {
    if (typeof tstring === "undefined" || !tstring.new_window || !root.querySelectorAll) {
        return;
    }
    const note = " (" + tstring.new_window + ")";
    const links = root.matches && root.matches('a[target="_blank"]') ? [root] : [];
    links.concat(Array.from(root.querySelectorAll('a[target="_blank"]'))).forEach(function (link) {
        if (link.hasAttribute("data-new-window")) {
            return;
        }
        link.setAttribute("data-new-window", "");
        const label = link.getAttribute("aria-label");
        if (label !== null) {
            // aria-label replaces the content: the note goes in the label
            link.setAttribute("aria-label", label + note);
            return;
        }
        const hidden = document.createElement("span");
        hidden.className = "is-sr-only";
        hidden.textContent = note;
        link.appendChild(hidden);
    });
}
document.addEventListener("DOMContentLoaded", function () {
    markNewWindowLinks(document.body);
    new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === 1) {
                    markNewWindowLinks(node);
                }
            });
            // a link that gets target="_blank" later
            if (mutation.type === "attributes" && mutation.target.matches && mutation.target.matches('a[target="_blank"]')) {
                markNewWindowLinks(mutation.target);
            }
        });
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["target"] });
});

// Missatges d'accessibilitat de Swiper en l'idioma de la pàgina
if (typeof Swiper !== "undefined" && typeof tstring !== "undefined") {
    Swiper.extendDefaults({
        a11y: {
            prevSlideMessage: tstring.slider_prev,
            nextSlideMessage: tstring.slider_next,
            firstSlideMessage: tstring.slider_first,
            lastSlideMessage: tstring.slider_last,
            paginationBulletMessage: tstring.slider_goto
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // --------------
    // Tancar pàgina
    // --------------
    var close = document.getElementById("close-page");
    if (close) {
        close.addEventListener("click", function () {
            window.close();
        });
    }

    // -----------------------------------------------------------
    // Alçada de la capçalera sticky (scroll-padding-top del focus)
    // -----------------------------------------------------------
    const mainHeader = document.getElementById("header");
    if (mainHeader && "ResizeObserver" in window) {
        new ResizeObserver(function () {
            document.documentElement.style.setProperty("--header-height", mainHeader.offsetHeight + "px");
        }).observe(mainHeader);
    }

    // ----------
    // scroll top
    // ----------
    const scrollTopElement = document.querySelector(".scrolltop");
    const footer = document.querySelector("footer");

    if (scrollTopElement) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 300) {
                scrollTopElement.classList.add("visible");

                // Adjust position to not overlap footer
                if (footer) {
                    const footerRect = footer.getBoundingClientRect();
                    const scrollTopHeight = scrollTopElement.offsetHeight;
                    const windowHeight = window.innerHeight;

                    // If footer is visible in viewport, move scrolltop above it
                    if (footerRect.top < windowHeight) {
                        const offset = windowHeight - footerRect.top;
                        scrollTopElement.style.bottom = (offset + 20) + "px";
                    } else {
                        scrollTopElement.style.bottom = "20px";
                    }
                }
            } else {
                scrollTopElement.classList.remove("visible");
            }
        });
    }

    // ------------------
    // Cercador capçalera
    // ------------------
    const searchButton = document.querySelector(".header-search button");
    const searchInput = document.querySelector(
        '.header-search input[type="search"]'
    );

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", function () {
            searchInput.focus();
        });
    }

    // ---------------
    // Cerca / Idiomes
    // ---------------

    const searchExpandButton = document.querySelector(
        ".header-search .js-expandmore-button"
    );
    const searchExpandContent = document.querySelector(
        ".header-search .js-to_expand"
    );
    const langExpandButton = document.querySelector(
        ".lang .js-expandmore-button"
    );
    const langExpandContent = document.querySelector(".lang .js-to_expand");

    if (
        searchExpandButton &&
        searchExpandContent &&
        langExpandButton &&
        langExpandContent
    ) {
        searchExpandButton.addEventListener("click", function () {
            const isMenuOpen = menu.getAttribute("hidden") !== "true";
            if (isMenuOpen) {
                menu.setAttribute("hidden", "true");
                toggleMenu.setAttribute("aria-expanded", "false");
                hamburger.classList.remove("is-active");
            }
            const isOpen =
                searchExpandContent.getAttribute("data-hidden") !== "true";
            if (isOpen) {
                langExpandContent.setAttribute("data-hidden", "true");
                langExpandButton.setAttribute("aria-expanded", "false");
            }
        });

        langExpandButton.addEventListener("click", function () {
            const isMenuOpen = menu.getAttribute("hidden") !== "true";
            if (isMenuOpen) {
                menu.setAttribute("hidden", "true");
                toggleMenu.setAttribute("aria-expanded", "false");
                hamburger.classList.remove("is-active");
            }
            const isOpen =
                langExpandContent.getAttribute("data-hidden") !== "true";
            if (isOpen) {
                searchExpandContent.setAttribute("data-hidden", "true");
                searchExpandButton.setAttribute("aria-expanded", "false");
            }
        });
    }

    // ----------------
    // Hamburger button
    // ----------------

    var button = document.createElement("button");
    button.className = "hamburger hamburger--spring";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "menu");
    button.innerHTML =
        '<span class="hamburger-box"><span class="hamburger-inner"></span></span><span class="is-sr-only">' + tstring.menu + '</span>';

    var menu = document.getElementById("menu");

    menu.parentNode.insertBefore(button, menu);

    menu.setAttribute("hidden", "true");

    var toggleMenu = document.querySelector(".navigation button");

    if (toggleMenu) {
        toggleMenu.addEventListener("click", function () {
            var open = JSON.parse(toggleMenu.getAttribute("aria-expanded"));
            toggleMenu.setAttribute("aria-expanded", !open);
            menu.hidden = !menu.hidden;
        });
    }

    // Select the hamburger element
    var hamburger = document.querySelector(".hamburger");

    // Add a click event listener to the hamburger element
    hamburger.addEventListener("click", function () {
        // Toggle the 'is-active' class on the hamburger element
        this.classList.toggle("is-active");
        // Toggle the 'js-menu-open' class on the body element
        // document.body.classList.toggle("js-menu-open");

        // Close the lang menu if it is open
        if (langExpandContent.getAttribute("data-hidden") !== "true") {
            langExpandContent.setAttribute("data-hidden", "true");
            langExpandButton.setAttribute("aria-expanded", "false");
        }

        // Close the search form if it is open
        if (searchExpandContent.getAttribute("data-hidden") !== "true") {
            searchExpandContent.setAttribute("data-hidden", "true");
            searchExpandButton.setAttribute("aria-expanded", "false");
        }
    });

    // -------------------------------
    // Menú principal amb desplegables (https://www.w3.org/WAI/tutorials/menus/flyout/#use-button-as-toggle)
    // -------------------------------

    function hasClass(el, className) {
        return el.classList
            ? el.classList.contains(className)
            : new RegExp("(^| )" + className + "( |$)", "gi").test(
                  el.className
              );
    }

    var menuItems1 = document.querySelectorAll("li.has-submenu");
    var timer1, timer2;

    var parseHTML = function (str) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp.body.children;
    };

    Array.prototype.forEach.call(menuItems1, function (el, i) {
        // first child is the item link (or a span when the item has no page)
        var activatingA = el.firstElementChild;
        var btn =
            '<button type="button" aria-expanded="false"><span class="is-sr-only">' +
            tstring.submenu_show.replace("{label}", activatingA.textContent.trim()) +
            "</span></button>";
        activatingA.insertAdjacentHTML("afterend", btn);

        // Handle hover event for non-touch devices
        el.addEventListener("mouseover", function (event) {
            this.classList.add("open");
            this.querySelector("button").setAttribute("aria-expanded", "true");
            clearTimeout(timer1);
        });

        el.addEventListener("mouseout", function (event) {
            timer1 = setTimeout(function () {
                var openMenu = document.querySelector(".has-submenu.open");
                if (openMenu) {
                    openMenu
                        .querySelector("button")
                        .setAttribute("aria-expanded", "false");
                    openMenu.classList.remove("open");
                }
            }, 5);
        });

        // Handle click and touchstart events for touch devices
        el.querySelector("button").addEventListener("click", function (event) {
            event.preventDefault();
            toggleSubmenu(el);
        });

        el.querySelector("button").addEventListener(
            "touchstart",
            function (event) {
                event.preventDefault();
                toggleSubmenu(el);
            }
        );

        var links = el.querySelectorAll("a");
        Array.prototype.forEach.call(links, function (link, i) {
            link.addEventListener("focus", function () {
                if (timer2) {
                    clearTimeout(timer2);
                    timer2 = null;
                }
            });
            link.addEventListener("blur", function (event) {
                timer2 = setTimeout(function () {
                    var openNav = document.querySelector(".has-submenu.open");
                    if (openNav) {
                        openNav.className = "has-submenu";
                        openNav
                            .querySelector("button")
                            .setAttribute("aria-expanded", "false");
                    }
                }, 10);
            });
        });
    });

    function toggleSubmenu(el) {
        var isOpen = hasClass(el, "open");

        // Close any other open submenus
        var allMenus = document.querySelectorAll("li.has-submenu");
        Array.prototype.forEach.call(allMenus, function (item) {
            item.classList.remove("open");
            item.querySelector("button").setAttribute("aria-expanded", "false");
        });

        // Open the clicked/touched submenu if it was not already open
        if (!isOpen) {
            el.classList.add("open");
            el.querySelector("button").setAttribute("aria-expanded", "true");
        }
    }

    // ------------------------------------------------
    // Escape tanca submenú, menú mòbil, idiomes i cerca
    // ------------------------------------------------
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" || event.defaultPrevented) {
            return;
        }
        // a dialog handles its own Escape
        if (document.activeElement && document.activeElement.closest('[role="dialog"], [aria-modal="true"]')) {
            return;
        }

        var openSubmenu = document.querySelector("li.has-submenu.open");
        if (openSubmenu) {
            var focusInside = openSubmenu.contains(document.activeElement);
            toggleSubmenu(openSubmenu);
            if (focusInside) {
                openSubmenu.querySelector("button").focus();
            }
            return;
        }

        var disclosures = [
            [searchExpandButton, searchExpandContent],
            [langExpandButton, langExpandContent]
        ];
        for (var i = 0; i < disclosures.length; i++) {
            var discButton = disclosures[i][0];
            var discContent = disclosures[i][1];
            if (discButton && discContent && discButton.getAttribute("aria-expanded") === "true") {
                discButton.click();
                discButton.focus();
                return;
            }
        }

        // mobile menu (the toggle is only visible below the desktop breakpoint)
        if (toggleMenu && toggleMenu.offsetParent !== null && toggleMenu.getAttribute("aria-expanded") === "true") {
            toggleMenu.click();
            toggleMenu.focus();
        }
    });

    // --------
    // timeline
    // --------
    var elements = document.querySelectorAll(".timeline");
    elements.forEach(function (element) {
        timelify(element, {
            animLeft: "fadeInLeft",
            animRight: "fadeInRight",
            animCenter: "fadeInUp",
            animSpeed: 600,
            offset: 150,
        });
    });
    // -----------------------------
    // Estils per input[type="date"]
    // -----------------------------
    const dateInput = document.querySelector('.search-form input[type="date"]');
    if (dateInput) {
        dateInput.addEventListener("input", function () {
            if (this.value) {
                this.classList.add("filled");
            } else {
                this.classList.remove("filled");
            }
        });
    }

    onListener(document, "click", "[data-copy-url]", function (event) {
        // Obtenim la URL del data attribute 'data-copy-url'
        const element = event.target;
        const urlToCopy = element.getAttribute("data-copy-url");

        // Creem un element de tipus input per poder copiar la URL
        const tempInput = document.createElement("input");
        tempInput.value = urlToCopy;
        document.body.appendChild(tempInput);

        // Seleccionem el text dins l'input i el copiem al portapapers
        tempInput.select();
        document.execCommand("copy");

        // Eliminen l'element temporal
        document.body.removeChild(tempInput);

        // Trobar el contenedor del missatge de confirmació
        const messageContainer = element.nextElementSibling;

        // Mostrar un missatge de confirmació sota el botó
        if (
            messageContainer &&
            messageContainer.classList.contains("copy-message")
        ) {
            messageContainer.textContent = tstring.share_copy_ok;
            messageContainer.style.color = "green"; // Opcional: estilitzar el missatge

            // Opcional: amaga el missatge després de 3 segons
            setTimeout(function () {
                messageContainer.textContent = "";
            }, 3000);
        }
    });
});

// ----------------
// Date-slider-setup
// ----------------

async function dateSliderSetup(form_dates_range) {
    api.getRangeDates().then(function(results) {
        const [MIN_DATE, MAX_DATE] = results;

        const leftSlider = document.getElementById("date-slider-left");
        const rightSlider = document.getElementById("date-slider-right");
        const sliderRange = document.getElementById("date-slider-range");
        const minLabel = document.getElementById("date-slider-min");
        const maxLabel = document.getElementById("date-slider-max");

        leftSlider.min = MIN_DATE;
        leftSlider.max = MAX_DATE;
        leftSlider.value = MIN_DATE;

        rightSlider.min = MIN_DATE;
        rightSlider.max = MAX_DATE;
        rightSlider.value = MAX_DATE;

        minLabel.min = maxLabel.min = MIN_DATE;
        minLabel.max = maxLabel.max = MAX_DATE;

        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }

        function updateDateSlider(e) {
            let minVal = parseInt(leftSlider.value);
            let maxVal = parseInt(rightSlider.value);

            if (e && e.target === leftSlider && minVal > maxVal) {
                leftSlider.value = maxVal;
                minVal = maxVal;
            }
            if (e && e.target === rightSlider && maxVal < minVal) {
                rightSlider.value = minVal;
                maxVal = minVal;
            }

            // Update the range fill
            const rangeWidth = leftSlider.max - leftSlider.min;
            const left = ((minVal - leftSlider.min) / rangeWidth) * 100;
            const right = ((maxVal - leftSlider.min) / rangeWidth) * 100;
            sliderRange.style.left = left + "%";
            sliderRange.style.width = right - left + "%";

            // Update displayed values
            minLabel.value = minVal;
            maxLabel.value = maxVal;

            form_dates_range.min = minVal;
            form_dates_range.max = maxVal;
        }

        leftSlider.addEventListener("input", updateDateSlider);
        rightSlider.addEventListener("input", updateDateSlider);

        // Add listeners for label inputs
        function handleMinLabelInput() {
            let val = clamp(parseInt(minLabel.value) || MIN_DATE, MIN_DATE, MAX_DATE);
            let maxVal = parseInt(rightSlider.value);
            if (val > maxVal) val = maxVal;
            leftSlider.value = val;
            updateDateSlider();
        }

        function handleMaxLabelInput() {
            let val = clamp(parseInt(maxLabel.value) || MAX_DATE, MIN_DATE, MAX_DATE);
            let minVal = parseInt(leftSlider.value);
            if (val < minVal) val = minVal;
            rightSlider.value = val;
            updateDateSlider();
        }

        minLabel.addEventListener("change", handleMinLabelInput);
            minLabel.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                handleMinLabelInput();
            }
        });

        maxLabel.addEventListener("change", handleMaxLabelInput);
            maxLabel.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                handleMaxLabelInput();
            }
        });

        // Initialize slider
        updateDateSlider();
    })
}

// -----------
// Swiper home
// -----------
function swiperHome() {
    const swiperHome = new Swiper(".swiper--home", {
        cssMode: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
        },
        keyboard: true,
        a11y: {
            // the slides are links: Swiper's role="group" and "1 / 6" label would hide the link
            // and replace its name (the title)
            slideRole: "",
            slideLabelMessage: "",
        },
    });
};

function swiperPublicaciones() {
    // ---------------------------------
    // Swiper Ultimas publicaciones
    // ---------------------------------
    var swiperPublicacions = new Swiper(".swiper--publicacions", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            nextEl: ".swiper--publicacions__btns .swiper-button-next",
            prevEl: ".swiper--publicacions__btns .swiper-button-prev",
        },
        slidesPerView: 1,
        spaceBetween: 24,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            850: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            },
            1700: {
                slidesPerView: 6,
            },
        },
    });
}

function swiperPublications(str) {
    new Swiper(`.swiper--publications-${str}`, {
        slideActiveClass: 'active',
        navigation: {
            nextEl: `.swiper--publications-${str}__btns .swiper-button-next`,
            prevEl: `.swiper--publications-${str}__btns .swiper-button-prev`,
        },
        slidesPerView: 1,
        spaceBetween: 24,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600:  { slidesPerView: 2 },
            850:  { slidesPerView: 3 },
            1100: { slidesPerView: 4 },
            1400: { slidesPerView: 5 },
            1700: { slidesPerView: 6 },
        },
    });
}

function swiperActividades() {
    // ---------------------------------
    // Swiper Proximas Actividades
    // ---------------------------------
    var swiperActivitats = new Swiper(".swiper--activitats", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            nextEl: ".swiper--activitats__btns .swiper-button-next",
            prevEl: ".swiper--activitats__btns .swiper-button-prev",
        },
        slidesPerView: 1,
        spaceBetween: 24,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            850: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            },
            1700: {
                slidesPerView: 6,
            },
        },
    });
}

function swiperActividadesActuales() {
    // ----------------------------
    // Swiper Exposiciones Actuales
    // ----------------------------
    var swiperActividadesActuales = new Swiper(".swiper--actividades-actuales", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            nextEl: ".swiper--actividades-actuales__btns .swiper-button-next",
            prevEl: ".swiper--actividades-actuales__btns .swiper-button-prev",
        },
        slidesPerView: 1,
        spaceBetween: 24,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            850: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            },
            1700: {
                slidesPerView: 6,
            },
        },
    });
}

function swiperExposicionesActuales() {
    // ----------------------------
    // Swiper Exposiciones Actuales
    // ----------------------------
    var swiperExposicionesActuales = new Swiper(".swiper--exposiciones-actuales", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            nextEl: ".swiper--exposiciones-actuales__btns .swiper-button-next",
            prevEl: ".swiper--exposiciones-actuales__btns .swiper-button-prev",
        },
        slidesPerView: 1,
        spaceBetween: 24,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            850: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            },
            1700: {
                slidesPerView: 6,
            },
        },
    });
}

function swiperExposicionesDestacadas() {
    // ---------------------------------
    // Swiper Exposiciones destacadas
    // ---------------------------------
    var swiperExposicionesDestacadas = new Swiper(".swiper--exposiciones-destacadas", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            nextEl: ".swiper--exposiciones-destacadas__btns .swiper-button-next",
            prevEl: ".swiper--exposiciones-destacadas__btns .swiper-button-prev",
        },
        slidesPerView: 1,
        spaceBetween: 24,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            850: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            },
            1700: {
                slidesPerView: 6,
            },
        },
    });
}

function swiperActividadesAnual(year) {
    // ---------------------------------
    // Swiper Exposiciones por año
    // ---------------------------------
    var swiperExposicionesDestacadas = new Swiper(`.swiper--activitats-${year}`, {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            prevEl: `.swiper--activitats-${year}__btns .swiper-button-prev`,
            nextEl: `.swiper--activitats-${year}__btns .swiper-button-next`,
        },
        slidesPerView: 1,
        spaceBetween: 33,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            850: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            },
            1400: {
                slidesPerView: 5,
            },
            1700: {
                slidesPerView: 6,
            },
        },
    });
}

function swiperExposAnual(year) {
    // ---------------------------------
    // Swiper Exposiciones por año
    // ---------------------------------
    var swiperExposicionesDestacadas = new Swiper(`.swiper--expos-${year}`, {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            prevEl: `.swiper--expos-${year}__btns .swiper-button-prev`,
            nextEl: `.swiper--expos-${year}__btns .swiper-button-next`,
        },
        slidesPerView: 1,
        spaceBetween: 33,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            700: {
                slidesPerView: 2,
            },
            1000: {
                slidesPerView: 3,
            },
        },
    });
}

function massonryEnable() {
    // -------
    // Masonry
    // -------
    var grid = document.querySelector(".masonry-grid");

    var msnry = new Masonry(grid, {
        itemSelector: ".masonry-grid-item",
        columnWidth: ".masonry-grid-sizer",
        percentPosition: true,
        gutter: 10,
    });

    imagesLoaded(grid).on("progress", function () {
        msnry.layout();
    });
}

function viewInit() {
    titleIframes(document.getElementById("main"));
    // enable A11y Dialogs
    enableDialogs(document.getElementById("main"));

    document.querySelectorAll('.images-group').forEach(function(gallery){

        // thumbs
        const thumbsEl = gallery.querySelector('.swiper--thumbs');

        const swiperThumbs = new Swiper(thumbsEl, {
            slidesPerView: 4,
            spaceBetween: 6,
            freeMode: true,
            watchSlidesProgress: true,
            breakpoints: {
                600: {
                    spaceBetween: 10,
                    slidesPerView: 5,
                },
                768: {
                    slidesPerView: 4,
                },
                1400: {
                    slidesPerView: 5,
                },
                1500: {
                    spaceBetween: 15,
                },
            },
        });

        // slider principal
        const mainEl = gallery.querySelector('.swiper--fitxa');

        const swiperMain = new Swiper(mainEl, {
            slideActiveClass: "active",

            navigation: {
                nextEl: gallery.querySelector('.swiper-button-next'),
                prevEl: gallery.querySelector('.swiper-button-prev'),
            },

            thumbs: {
                swiper: swiperThumbs,
            }
        });

    });

    // ---------
    // Accordion (https://github.com/10up/component-library/tree/develop/packages/accordion)
    // ---------
    let accordionInstance = new TenUp.Accordion('.accordion', {open: true});
    // let accordionInstance = new TenUp.accordion(".accordion", {
    //     // onCreate: function() {
    //     //   console.log( 'onCreate callback' );
    //     // },
    //     // onOpen: function( { link, content, heading } ) {
    //     //   console.log( 'onOpen callback' );
    //     // },
    //     // onClose: function( { link, content, heading } ) {
    //     //   console.log( 'onClose callback' );
    //     // },
    //     // onToggle: function( { link, content, heading } ) {
    //     //   console.log( 'onToggle callback' );
    //     // }
    // });

    // ----
    // Tabs (https://github.com/10up/component-library/tree/develop/packages/tabs)
    // ----
    let myTabs = new TenUp.tabs(".tabs", {
        // onCreate: function() {
        //   console.log( 'onCreate callback' );
        // },
        // onTabChange: function() {
        //   console.log( 'onTabChange callback' );
        // }
    });
    let myTabs2 = new TenUp.tabs('.tabs-2', {
        // onCreate: function() {
        //   console.log( 'onCreate callback' );
        // },
        // onTabChange: function() {
        //   console.log( 'onTabChange callback' );
        // }
    });

    // accordion panels named by their header are regions (aria-labelledby is not allowed on a plain div)
    document.querySelectorAll('.accordion-content[aria-labelledby]:not([role])').forEach(function (panel) {
        panel.setAttribute("role", "region");
    });



    /*
    images-group
    image-action-zoom
    image-action-download
    image-action-fullscreen
    */
    const images = document.querySelectorAll(".images-group");
    if (images.length > 0) {
        images.forEach(function (group) {
            const zoomBase = group.querySelectorAll(".image-zoom");
            if (zoomBase) {
                zoomBase.forEach(function (elem) {
                    elem.addEventListener("click", function (event) {
                        event.preventDefault();
                        const activeImage = this;
                        const urlImg = activeImage.dataset.original;
                        // viewer title: the image description, not the file name
                        const caption = activeImage.alt || activeImage.dataset.caption || null;
                        common.get_best_image_url(urlImg).then(function (result) {
                            hiresViewer(result.url, caption);
                        });
                    });
                });
            }

            const zoom = group.querySelector(".image-action-zoom");
            if (zoom) {
                zoom.addEventListener("click", function (event) {
                    event.preventDefault();
                    const activeImage = group.querySelector(
                        "img.active, div.active img"
                    );
                    const urlImg = activeImage.dataset.original;
                    const caption = activeImage.alt || activeImage.dataset.caption || null;
                    common.get_best_image_url(urlImg).then(function (result) {
                        hiresViewer(result.url, caption);
                    });
                });
            }
            const download = group.querySelector(".image-action-download");
            if (download) {
                download.addEventListener("click", function (event) {
                    event.preventDefault();
                    const activeImage = group.querySelector(
                        "img.active, div.active img"
                    );
                    const urlImg = activeImage.dataset.original;
                    const caption = activeImage.dataset.caption || null;
                    showDownloadModal(urlImg, caption);
                });
            }
            const fullscreen = group.querySelector(".image-action-fullscreen");
            if (fullscreen) {
                fullscreen.addEventListener("click", function (event) {
                    event.preventDefault();
                    document.body.classList.toggle("fullscreen");
                    window.scrollTo({
                        top: 0,
                    });
                    const img = this.querySelector("img");

                    // Canvia icona del botó
                    if (document.body.classList.contains("fullscreen")) {
                        img.src = "/assets/img/ico-tancar.svg";
                        img.alt = tstring.close;
                        img.width = 20;
                        img.height = 20;
                    } else {
                        img.src = "/assets/img/ico-pantalla-completa.svg";
                        img.alt = tstring.item_image_fullscreen;
                        img.width = 30;
                        img.height = 30;
                    }

                    // Quan és versió amb dues imatges, oculta una de les imatges a l'ampliar
                    if (group.classList.contains("fullscreen__content--2")) {
                        const columns = document.querySelectorAll(
                            ".fullscreen__content--2"
                        );
                        if (document.body.classList.contains("fullscreen")) {
                            console.log("full");
                            columns.forEach(function (elem) {
                                console.log(elem);
                                console.log(group.isEqualNode(elem));
                                if (!group.isEqualNode(elem)) {
                                    elem.style.display = "none";
                                }
                            });
                        } else {
                            columns.forEach(function (elem) {
                                elem.style.display = "";
                            });
                        }
                    }
                });
            }
        });
    }
}

/**
 * Mostrar modal de confirmació de descàrrega amb text de llicència
 * @param {string} urlImg
 */
function showDownloadModal(urlImg, fileName) {
    const overlay = common.create_dom_element({
        element_type: 'div',
        class_name: 'download-modal-overlay'
    });

    const modal = common.create_dom_element({
        element_type: 'div',
        class_name: 'download-modal'
    });

    const content = common.create_dom_element({
        element_type: 'div',
        id: 'download_license_text',
        class_name: 'download-modal__content',
        inner_html: '<p>' + tstring.loading + '</p>'
    });
    content.setAttribute('tabindex', '-1');

    const footer = common.create_dom_element({
        element_type: 'div',
        class_name: 'download-modal__footer'
    });

    const btnCancel = common.create_dom_element({
        element_type: 'button',
        class_name: 'button button--alt download-modal__btn-cancel',
        text_content: tstring.cancel,
        type: 'button'
    });

    const btnDownload = common.create_dom_element({
        element_type: 'button',
        class_name: 'button download-modal__btn-download',
        text_content: tstring.download,
        type: 'button'
    });

    modal.appendChild(content);
    footer.appendChild(btnCancel);
    footer.appendChild(btnDownload);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    const closeModal = common.make_dialog(overlay, {
        label: tstring.download,
        // long licence text: start reading at its top (WAI-ARIA dialog pattern)
        initial_focus: content,
        on_close: function () {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    });

    btnCancel.addEventListener('click', closeModal);
    btnDownload.addEventListener('click', function () {
        common.download_item(urlImg, fileName);
        closeModal();
    });
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
    });

    try {
        api.getDownloadLicenseText().then(function (rows) {
            if (rows && rows[0] && rows[0].body) {
                content.innerHTML = rows[0].body;
            }
        }).catch(function () {
            content.innerHTML = tstring.download_terms;
        });
    } catch (err) {
        content.innerHTML = tstring.download_terms;
    }
}

function hiresViewer(hires_url, caption) {
    const new_image = new Image();
    new_image.src = hires_url;
    new_image.alt = caption || "";
    // give the focus back to the button that opened the viewer
    const opener = document.activeElement;

    // names of the icon-only viewer controls
    const toolbar_names = {
        "zoom-in": tstring.viewer_zoom_in,
        "zoom-out": tstring.viewer_zoom_out,
        "one-to-one": tstring.viewer_one_to_one,
        "reset": tstring.viewer_reset,
        "rotate-left": tstring.viewer_rotate_left,
        "rotate-right": tstring.viewer_rotate_right,
        "flip-horizontal": tstring.viewer_flip_horizontal,
        "flip-vertical": tstring.viewer_flip_vertical,
        "mix": tstring.close,
        // thumbnail of the image in the (hidden) navbar
        "view": caption || tstring.viewer_image
    };

    const viewer = new Viewer(new_image, {
        // above the sticky header (z-index 10000), which otherwise covers the toolbar and close button
        zIndex: 10002,
        title() {
            return caption ? caption : "";
        },
        // inline: true,
        shown() {
            const container = viewer.viewer;
            container.querySelectorAll("[data-viewer-action]").forEach(function (control) {
                const name = toolbar_names[control.dataset.viewerAction];
                if (name) {
                    control.setAttribute("aria-label", name);
                }
            });
            const close_button = container.querySelector(".viewer-close");
            if (close_button) {
                close_button.setAttribute("aria-label", tstring.close);
                close_button.focus();
            }
        },
        viewed() {
            // viewer.zoomTo(1);
        },
        hidden: function () {
            viewer.destroy();
            if (opener && document.contains(opener)) {
                opener.focus();
            }
        },
        navbar: false,
        toolbar: {
            zoomIn: {
                show: 2,
                size: "large",
            },
            zoomOut: {
                show: 2,
                size: "large",
            },
            oneToOne: {
                show: 2,
                size: "large",
            },
            reset: {
                show: 2,
                size: "large",
            },
            prev: {
                show: 0,
                size: "large",
            },
            play: {
                show: 0,
                size: "large",
            },
            next: {
                show: 0,
                size: "large",
            },
            rotateLeft: {
                show: 2,
                size: "large",
            },
            rotateRight: {
                show: 2,
                size: "large",
            },
            flipHorizontal: {
                show: 2,
                size: "large",
            },
            flipVertical: {
                show: 2,
                size: "large",
            },
        },
    });
    // new_image.click();
    viewer.show();

    return viewer;
}

// ----------------------
// Taula amb desplegables
// ----------------------
function toggle(btnID, eID) {
    var theRow = document.getElementById(eID);
    var theButton = document.getElementById(btnID);
    if (theRow.style.display == "none") {
        theRow.style.display = "table-row";
        theButton.setAttribute("aria-expanded", "true");
    } else {
        theRow.style.display = "none";
        theButton.setAttribute("aria-expanded", "false");
    }
}

function enableDialogs(elem) {
    if (!elem) {
        return;
    }

    // triggers that are not buttons (div.button-like with a figure inside) must work as buttons
    elem.querySelectorAll("[data-a11y-dialog-show]").forEach(function (trigger) {
        if (!trigger.matches("button, a[href]")) {
            trigger.setAttribute("role", "button");
            if (!trigger.hasAttribute("tabindex")) {
                trigger.setAttribute("tabindex", "0");
            }
        }
    });

    elem.querySelectorAll(".dialog-container").forEach(function (container) {
        // enableDialogs can run more than once on the same content
        if (container.dataset.a11yDialogReady) {
            return;
        }
        container.dataset.a11yDialogReady = "true";

        // name: aria-labelledby must point to a title inside this dialog
        const labelledby = container.getAttribute("aria-labelledby");
        if (!labelledby || !container.querySelector("#" + CSS.escape(labelledby))) {
            const heading = container.querySelector("h1, h2, h3, figcaption");
            if (heading) {
                heading.id = heading.id && !document.querySelectorAll("#" + CSS.escape(heading.id))[1]
                    ? heading.id
                    : "dialog-title-" + Math.random().toString(36).slice(2, 9);
                container.setAttribute("aria-labelledby", heading.id);
            } else {
                // no title: the image description, or what the trigger says
                container.removeAttribute("aria-labelledby");
                const trigger = document.querySelector('[data-a11y-dialog-show="' + container.getAttribute("data-a11y-dialog") + '"]');
                const img = container.querySelector("img[alt]:not([alt=''])")
                    || (trigger && trigger.querySelector("img[alt]:not([alt=''])"));
                // (while the dialog is still inside its trigger, the trigger text would include it)
                const trigger_text = trigger && !trigger.contains(container) ? trigger.textContent.trim() : "";
                container.setAttribute("aria-label", img ? img.alt : (trigger_text || tstring.viewer_image));
            }
        }

        // a trigger with no text or image description is named like its dialog (4.1.2)
        const opener = document.querySelector('[data-a11y-dialog-show="' + container.getAttribute("data-a11y-dialog") + '"]');
        if (opener && opener !== container && !opener.getAttribute("aria-label")) {
            const own_text = Array.from(opener.childNodes)
                .filter(function (node) { return !(node.nodeType === 1 && node.contains(container)); })
                .map(function (node) { return node.textContent; }).join("").trim();
            const own_img = Array.from(opener.querySelectorAll("img[alt]:not([alt=''])"))
                .find(function (img) { return !container.contains(img); });
            if (!own_text && !own_img) {
                const dialog_label = container.getAttribute("aria-label")
                    || (document.getElementById(container.getAttribute("aria-labelledby")) || {}).textContent;
                if (dialog_label) {
                    opener.setAttribute("aria-label", dialog_label.trim());
                }
            }
        }

        // a dialog can't live inside its role=button trigger (its content would be flattened and
        // every click inside would reach the trigger), and it must sit above the sticky header
        document.body.appendChild(container);

        new A11yDialog(container);
    });
}

// -----------
// A11y Dialog (https://github.com/KittyGiraudel/a11y-dialog)
// -----------
var dialogEl = document.getElementById("dialog-01");

if (dialogEl) {
    // same setup as the other dialogs (name, out of its trigger, only once)
    enableDialogs(dialogEl.parentNode);
}

// ------------------------------------------------------------------------------
// Comprova si la primera opció del select està seleccionada (per ajustar colors)
// ------------------------------------------------------------------------------
// Function to check the selected option for a given select element
function checkSelectOption(selectElement) {
    if (selectElement.selectedIndex !== 0) {
        selectElement.classList.add("not-first-selected");
    } else {
        selectElement.classList.remove("not-first-selected");
    }
}

// Function to initialize the checks on page load and set event listeners
function initializeSelectChecks() {
    // Get all select elements on the page
    const selectElements = document.querySelectorAll("select");

    // Loop through each select element and check its initial state
    selectElements.forEach((selectElement) => {
        checkSelectOption(selectElement);

        // Add an event listener to check the option on change
        selectElement.addEventListener("change", () => {
            checkSelectOption(selectElement);
        });
    });
}

// Run the initialize function when the page loads
window.onload = initializeSelectChecks;
