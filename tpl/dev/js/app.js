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


  // --------------
  // Menú principal
  // --------------

  // Hamburger button
  var button = document.createElement("button");
  button.className = "hamburger hamburger--spring";
  button.type = "button";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "menu");
  button.innerHTML = '<span class="hamburger-box"><span class="hamburger-inner"></span></span><span class="is-sr-only">Menu</span>';

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
      document.body.classList.toggle("js-menu-open");
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
