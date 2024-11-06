const onListener = function(element, type, selector, handler) {
    element.addEventListener(type, function(event) {
        if (event.target.closest(selector)) {
            handler(event);
        }
    });
  };



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


      // ----------------
      // Hamburger button
      // ----------------

      var button = document.createElement("button");
      button.className = "hamburger hamburger--spring";
      button.type = "button";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "menu");
      button.innerHTML = '<span class="hamburger-box"><span class="hamburger-inner"></span></span><span class="is-sr-only">Menú</span>';

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
      hamburger.addEventListener("click", function() {
          // Toggle the 'is-active' class on the hamburger element
          this.classList.toggle("is-active");
          // Toggle the 'js-menu-open' class on the body element
          // document.body.classList.toggle("js-menu-open");
      });

      // -------------------------------
      // Menú principal amb desplegables (https://www.w3.org/WAI/tutorials/menus/flyout/#use-button-as-toggle)
      // -------------------------------

      function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }

    var menuItems1 = document.querySelectorAll('li.has-submenu');
    var timer1, timer2;

    var parseHTML = function(str) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp.body.children;
    };

    Array.prototype.forEach.call(menuItems1, function(el, i) {
        var activatingA = el.querySelector('a');
        var btn = '<button type="button"><span class="is-sr-only">Mostra el submenú de “' + activatingA.text + '”</span></button>';
        activatingA.insertAdjacentHTML('afterend', btn);

        // Handle hover event for non-touch devices
        el.addEventListener("mouseover", function(event) {
            this.classList.add("open");
            this.querySelector('a').setAttribute('aria-expanded', "true");
            this.querySelector('button').setAttribute('aria-expanded', "true");
            clearTimeout(timer1);
        });

        el.addEventListener("mouseout", function(event) {
            timer1 = setTimeout(function() {
                var openMenu = document.querySelector('.has-submenu.open');
                if (openMenu) {
                    openMenu.querySelector('a').setAttribute('aria-expanded', "false");
                    openMenu.querySelector('button').setAttribute('aria-expanded', "false");
                    openMenu.classList.remove("open");
                }
            }, 5);
        });

        // Handle click and touchstart events for touch devices
        el.querySelector('button').addEventListener("click", function(event) {
            event.preventDefault();
            toggleSubmenu(el);
        });

        el.querySelector('button').addEventListener("touchstart", function(event) {
            event.preventDefault();
            toggleSubmenu(el);
        });

        var links = el.querySelectorAll('a');
        Array.prototype.forEach.call(links, function(link, i) {
            link.addEventListener("focus", function() {
                if (timer2) {
                    clearTimeout(timer2);
                    timer2 = null;
                }
            });
            link.addEventListener("blur", function(event) {
                timer2 = setTimeout(function() {
                    var openNav = document.querySelector(".has-submenu.open")
                    if (openNav) {
                        openNav.className = "has-submenu";
                        openNav.querySelector('a').setAttribute('aria-expanded', "false");
                        openNav.querySelector('button').setAttribute('aria-expanded', "false");
                    }
                }, 10);
            });
        });
    });

    function toggleSubmenu(el) {
        var isOpen = hasClass(el, "open");

        // Close any other open submenus
        var allMenus = document.querySelectorAll('li.has-submenu');
        Array.prototype.forEach.call(allMenus, function(item) {
            item.classList.remove("open");
            item.querySelector('a').setAttribute('aria-expanded', "false");
            item.querySelector('button').setAttribute('aria-expanded', "false");
        });

        // Open the clicked/touched submenu if it was not already open
        if (!isOpen) {
            el.classList.add("open");
            el.querySelector('a').setAttribute('aria-expanded', "true");
            el.querySelector('button').setAttribute('aria-expanded', "true");
        }
    }

      // -------------------------------
      // Menú principal amb desplegables (https://www.w3.org/WAI/tutorials/menus/flyout/#use-parent-as-toggle)
      // -------------------------------
      // var menuItems = document.querySelectorAll('li.has-submenu');
      // Array.prototype.forEach.call(menuItems, function (el, i) {
      //     el.addEventListener("mouseover", function(event){
      //         this.className = "has-submenu open";
      //         clearTimeout(timer);
      //     });
      //     el.addEventListener("mouseout", function(event){
      //         timer = setTimeout(function(event){
      //             document.querySelector(".has-submenu.open").className = "has-submenu";
      //         }, 1000);
      //     });
      //     el.querySelector('a').addEventListener("click",  function(event){
      //         if (this.parentNode.className == "has-submenu") {
      //             this.parentNode.className = "has-submenu open";
      //             this.setAttribute('aria-expanded', "true");
      //         } else {
      //             this.parentNode.className = "has-submenu";
      //             this.setAttribute('aria-expanded', "false");
      //         }
      //         event.preventDefault();
      //         return false;
      //     });
      // });


      var menuItems = document.querySelectorAll('li.has-submenu');
      Array.prototype.forEach.call(menuItems, function(el, i){

      });

      // --------
      // timeline
      // --------
      var elements = document.querySelectorAll('.timeline');
      elements.forEach(function(element) {
          timelify(element, {
              animLeft: "fadeInLeft",
              animRight: "fadeInRight",
              animCenter: "fadeInUp",
              animSpeed: 600,
              offset: 150
          });
      });
    // -----------------------------
    // Estils per input[type="date"]
    // -----------------------------
    const dateInput = document.querySelector('.search-form input[type="date"]');
    if (dateInput) {
        dateInput.addEventListener('input', function() {
        if (this.value) {
            this.classList.add('filled');
        } else {
            this.classList.remove('filled');
        }
        });
    }


      onListener(document, 'click', '[data-copy-url]', function(event){
          // Obtenim la URL del data attribute 'data-copy-url'
          const element = event.target;
          const urlToCopy = element.getAttribute('data-copy-url');

          // Creem un element de tipus input per poder copiar la URL
          const tempInput = document.createElement('input');
          tempInput.value = urlToCopy;
          document.body.appendChild(tempInput);

          // Seleccionem el text dins l'input i el copiem al portapapers
          tempInput.select();
          document.execCommand('copy');

          // Eliminen l'element temporal
          document.body.removeChild(tempInput);

          // Trobar el contenedor del missatge de confirmació
          const messageContainer = element.nextElementSibling;

          // Mostrar un missatge de confirmació sota el botó
          if (messageContainer && messageContainer.classList.contains('copy-message')) {
              messageContainer.textContent = tstring.share_copy_ok;
              messageContainer.style.color = 'green';  // Opcional: estilitzar el missatge

              // Opcional: amaga el missatge després de 3 segons
              setTimeout(function(){
                  messageContainer.textContent = '';
              }, 3000);
          }
      });


  });

  function viewInit() {
    // -------------------------
    // Swiper (fitxa Col·lecció)
    // -------------------------
    var swiper = new Swiper(".swiper--thumbs", {
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
    var swiper2 = new Swiper(".swiper--fitxa", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
        },
        thumbs: {
        swiper: swiper,
        },
    });

  // ---------------------------------
  // Swiper (Exposicions i activitats)
  // ---------------------------------
    var swiperExpos = new Swiper(".swiper--expos", {
        // spaceBetween: 10,
        slideActiveClass: 'active',
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
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


    // ---------
    // Accordion (https://github.com/10up/component-library/tree/develop/packages/accordion)
    // ---------
    let accordionInstance = new TenUp.accordion('.accordion', {
        // onCreate: function() {
        //   console.log( 'onCreate callback' );
        // },
        // onOpen: function( { link, content, heading } ) {
        //   console.log( 'onOpen callback' );
        // },
        // onClose: function( { link, content, heading } ) {
        //   console.log( 'onClose callback' );
        // },
        // onToggle: function( { link, content, heading } ) {
        //   console.log( 'onToggle callback' );
        // }
    });

    // ----
    // Tabs (https://github.com/10up/component-library/tree/develop/packages/tabs)
    // ----
    let myTabs = new TenUp.tabs('.tabs', {
        // onCreate: function() {
        //   console.log( 'onCreate callback' );
        // },
        // onTabChange: function() {
        //   console.log( 'onTabChange callback' );
        // }
    });

    // ----------------
    // Div com a button (quan no podem posar un element figure dins un button (ja que no valida) posem el div com si fos un button)
    // ----------------
    const divButtons = document.querySelectorAll('.button-like');

    divButtons.forEach(divButton => {
        divButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                divButton.click();
            }
        });
    });


    /*
    images-group
    image-action-zoom
    image-action-download
    image-action-fullscreen
    */
    const images = document.getElementsByClassName('images-group');
    if (images.length > 0) {
        images.forEach(function(group){
            const zoom = group.querySelector('.image-action-zoom');
            if (zoom) {
                zoom.addEventListener('click', function(event){
                    event.preventDefault();
                    const activeImage = group.querySelector('img.active, div.active img');
                    const urlImg = activeImage.dataset.original;
                    hiresViewer(urlImg);
                });
            }
            const download = group.querySelector('.image-action-download');
            if (download) {
                download.addEventListener('click', function(event){
                    event.preventDefault();
                    const activeImage = group.querySelector('img.active, div.active img');
                    const urlImg = activeImage.dataset.original;
                    return common.download_item(urlImg)
                });
            }
            const fullscreen = group.querySelector('.image-action-fullscreen');
            if (fullscreen) {
                fullscreen.addEventListener('click', function(event){
                    event.preventDefault();
                    document.body.classList.toggle("fullscreen");
                    window.scrollTo({
                        top: 0
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
                    if (group.classList.contains('fullscreen__content--2')) {
                        const columns = document.querySelectorAll(".fullscreen__content--2");
                        if (document.body.classList.contains("fullscreen")) {
                            console.log('full');
                            columns.forEach(function(elem){
                                console.log(elem);
                                console.log(group.isEqualNode(elem));
                                if (!group.isEqualNode(elem)) {
                                    elem.style.display = 'none';
                                }
                            });
                        } else {
                            columns.forEach(function(elem){
                                elem.style.display = '';
                            });
                        }

                    }
                });
            }

        });
    }
  }

  function hiresViewer(hires_url) {
    const new_image = new Image();
    new_image.src = hires_url;

    const viewer = new Viewer(new_image, {
        // inline: true,
        viewed() {
            // viewer.zoomTo(1);
        },
        hidden: function () {
            viewer.destroy();
        },
        navbar: false,
        toolbar: {
            zoomIn: {
                show: 2,
                size: 'large'
            },
            zoomOut: {
                show: 2,
                size: 'large'
            },
            oneToOne: {
                show: 2,
                size: 'large'
            },
            reset: {
                show: 2,
                size: 'large'
            },
            prev: {
                show: 0,
                size: 'large',
            },
            play: {
                show: 0,
                size: 'large',
            },
            next: {
                show: 0,
                size: 'large',
            },
            rotateLeft: {
                show: 2,
                size: 'large'
            },
            rotateRight: {
                show: 2,
                size: 'large'
            },
            flipHorizontal: {
                show: 2,
                size: 'large'
            },
            flipVertical: {
                show: 2,
                size: 'large'
            },
        }
    });
    // new_image.click();
    viewer.show();

    return viewer
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

  // -----------
  // A11y Dialog (https://github.com/KittyGiraudel/a11y-dialog)
  // -----------
  var dialogEl = document.getElementById('dialog-01')

  if (dialogEl) {
      var dialog = new A11yDialog(dialogEl)

      dialog.on('show', function (event) {
      const container = event.target

      // And if the event is the result of a UI interaction (i.e. was not triggered
      // programmatically via `.show(..)`), the `detail` prop contains the original
      // event
      const target = event.detail.target
      const opener = target.closest('[data-a11y-dialog-show]')

      console.log(container, target, opener)
      })

      // To manually control the dialog:
      // dialog.show()
      // dialog.hide()
      // dialog.destroy()


  }

  // ------------------------------------------------------------------------------
  // Comprova si la primera opció del select està seleccionada (per ajustar colors)
  // ------------------------------------------------------------------------------
  // Function to check the selected option for a given select element
  function checkSelectOption(selectElement) {
      if (selectElement.selectedIndex !== 0) {
          selectElement.classList.add('not-first-selected');
      } else {
          selectElement.classList.remove('not-first-selected');
      }
  }

  // Function to initialize the checks on page load and set event listeners
  function initializeSelectChecks() {
      // Get all select elements on the page
      const selectElements = document.querySelectorAll('select');

      // Loop through each select element and check its initial state
      selectElements.forEach(selectElement => {
          checkSelectOption(selectElement);

          // Add an event listener to check the option on change
          selectElement.addEventListener('change', () => {
              checkSelectOption(selectElement);
          });
      });
  }

  // Run the initialize function when the page loads
  window.onload = initializeSelectChecks;
