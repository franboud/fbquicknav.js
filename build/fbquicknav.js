"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Quick Nav plugin.
 * Version 2.0
 *
 * Required:
 *    - LoDash _.throttle
 *	  - GSAP with ScrollTrigger
 *
 * Pour activer :
 *	  new FBQuickNav('.jsQuicknav');
 *    const quickNav = new FBQuickNav('.jsQuicknav');
 *    const quickNav = new FBQuickNav('.jsQuicknav', { options });
 *
 * Options configurables :
 *    - section_class --> Class name of the sections added in the quick nav.
 *    - section_title --> Data attribute for the title of the section, displayed in the quick nav.
 *    - section_class_hide --> When the quicknav reaches this section, hide it.
 *    - scroll_offset --> Offset when scrolling to a section.
 *    - add_trigger --> Add a button to open and close the quicknav.
 *    - trigger_after_items --> Position of the trigger HTML: before or after the items.
 *    - trigger_icon_open --> SVG of the icon of the trigger to show the items.
 *    - trigger_icon_close --> SVG of the icon of the trigger to hide the items.
 */
var FBQuickNav = /*#__PURE__*/function () {
  function FBQuickNav(selector, options) {
    _classCallCheck(this, FBQuickNav);

    this.selector = selector;
    this.quicknavEl = document.querySelector(this.selector); // Try to init

    if (this.quicknavEl == null || typeof this.quicknavEl === "undefined") {
      return;
    } // Default settings


    this.settings = {
      section_class: ".jsQuickNav__section",
      section_title: "data-quicknav-title",
      section_class_hide: ".jsQuickNav__hide",
      scroll_offset: -100,
      add_trigger: false,
      trigger_after_items: false,
      trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
      trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>'
    }; // Merge options in the settings

    this.settings = Object.assign(this.settings, options); // Init this plugin

    this.init();
  }

  _createClass(FBQuickNav, [{
    key: "init",
    value: function init() {
      this.sectionsEl = document.querySelectorAll(this.settings.section_class + '[' + this.settings.section_title + ']'); // Seulement les sections qui ont un titre defined.

      this.build_html();
      this.click_items_events();
      this.scroll_activate_items();
      this.open_close_trigger();
      this.close_on_scroll();
      this.hide_quicknav(); // Tout est fait, init quicknav

      this.quicknavEl.classList.add("isInit");
    }
    /**
     * Creates the HTML and add it to the DOM.
     */

  }, {
    key: "build_html",
    value: function build_html() {
      var _this = this;

      /**
       * CHECK
       * Check if the HTML was harcoded, if yes : don't create it again.
       */
      var itemsCheck = this.quicknavEl.querySelector('.quickNav__items');

      if (typeof itemsCheck != 'undefined' && itemsCheck != null) {
        return;
      }
      /**
       * WRAP
       * Wrap everything in a __in div.
       */


      var quicknavInEl = document.createElement("div");
      quicknavInEl.classList.add("quickNav__in");
      /**
       * ADD ITEMS
       * Add all the items in the quicknav.
       */

      var itemsEl = document.createElement("div");
      itemsEl.classList.add('quickNav__items', 'jsQuickNav__ctn');
      this.sectionsEl.forEach(function (sectionEl, index) {
        var title = sectionEl.getAttribute(_this.settings.section_title); // <a>

        var itemEl = document.createElement("a");
        itemEl.classList.add("quickNav__item");
        itemEl.href = "#"; // <span> inside of the <a>

        var spanEl = document.createElement("span");
        spanEl.classList.add("quickNav__text");
        spanEl.textContent = title; // Link the item to the section, for easy access later

        itemEl.setAttribute("data-quicknav-index", index);
        sectionEl.setAttribute("data-quicknav-index", index);
        itemEl.appendChild(spanEl);
        itemsEl.appendChild(itemEl);
      });
      quicknavInEl.appendChild(itemsEl);
      /**
       * TRIGGER
       * Trigger to open / close quicknav
       */

      if (this.settings.add_trigger === true) {
        var buttonEl = document.createElement("button");
        buttonEl.type = "button";
        buttonEl.classList.add("quickNav__trigger", "jsQuickNav__trigger");
        var buttonLabel = document.createElement("span");
        buttonLabel.classList.add("quickNav__triggerLabel", "jsQuickNav__triggerLabel");
        var buttonIcons = document.createElement("span");
        buttonIcons.classList.add("quickNav__triggerIcon");
        var buttonIconOpen = document.createElement("span");
        buttonIconOpen.classList.add("svgIcon", "quickNav__triggerOpen");
        buttonIconOpen.innerHTML = this.settings.trigger_icon_open;
        var buttonIconClose = document.createElement("span");
        buttonIconClose.classList.add("svgIcon", "quickNav__triggerClose");
        buttonIconClose.innerHTML = this.settings.trigger_icon_close;
        buttonIcons.appendChild(buttonIconOpen);
        buttonIcons.appendChild(buttonIconClose);
        buttonEl.appendChild(buttonLabel);
        buttonEl.appendChild(buttonIcons); // Avant ou apres la liste d'items

        if (this.settings.trigger_after_items) {
          quicknavInEl.appendChild(buttonEl);
        } else {
          quicknavInEl.insertBefore(buttonEl, quicknavInEl.firstChild);
        }
      }
      /**
       * ADD TO DOM
       * Add all those elements to the quicknav.
       */


      this.quicknavEl.appendChild(quicknavInEl);
      /**
       * VAR REFERENCE
       * For easy access later on...
       */

      this.linksEL = this.quicknavEl.querySelectorAll("a");
      /**
       * DEFAULT LABEL
       * On met le nom de la premiere section dans le trigger label.
       */

      this.set_trigger_label(this.sectionsEl[0]);
    }
    /**
     * Click on the quicknav link.
     * When there's a click, the page scrolls to the chosen section.
     */

  }, {
    key: "click_items_events",
    value: function click_items_events() {
      var _this2 = this;

      this.quicknavEl.addEventListener("click", function (evt) {
        // On cible seulement les liens <a>
        // ATTENTION! closest bubbles up jusqu'au document.
        var linkEl = evt.target.closest("a.quickNav__item");

        if (!linkEl) {
          return;
        }

        ;
        evt.preventDefault();
        var section_index = linkEl.getAttribute("data-quicknav-index");

        var sectionEl = _this2.find_section_by_index(section_index);

        if (sectionEl != null) {
          _this2.go_to_section(sectionEl);
        }
      });
    }
    /**
     * Gerer l'activation automatique des classes "active" sur les items.
     * Quand le user scroll, on indique sur quelle section on se trouve.
     */

  }, {
    key: "scroll_activate_items",
    value: function scroll_activate_items() {
      var _this3 = this;

      this.sectionsEl.forEach(function (sectionEl) {
        var sectionIndex = sectionEl.getAttribute("data-quicknav-index"),
            linkEl = _this3.find_link_by_index(sectionIndex);

        ScrollTrigger.create({
          trigger: sectionEl,
          // Describes a place on the trigger and a place on the scroller 
          // that must meet in order to start the ScrollTrigger.
          // Example:
          // "top center" = "when the top of the trigger hits the center of the scroller"
          // "bottom 80%" = "when the bottom of the trigger hits 80% down from the top of the viewport" 
          start: "top center",
          end: "bottom center",
          // Gestion custom des events
          onEnter: function onEnter() {
            linkEl.classList.add("active");

            _this3.set_trigger_label(sectionEl);
          },
          onLeave: function onLeave() {
            linkEl.classList.remove("active");
          },
          onEnterBack: function onEnterBack() {
            linkEl.classList.add("active");

            _this3.set_trigger_label(sectionEl);
          },
          onLeaveBack: function onLeaveBack() {
            linkEl.classList.remove("active");
          } // markers: true,
          // id: "section " + sectionIndex,

        });
      });
    }
    /**
     * Click on the trigger button.
     * Open and close the quicknav.
     */

  }, {
    key: "open_close_trigger",
    value: function open_close_trigger() {
      var _this4 = this;

      if (this.settings.add_trigger !== true) {
        return;
      }

      var triggerEl = this.quicknavEl.querySelector(".jsQuickNav__trigger");
      triggerEl.addEventListener("click", function (evt) {
        evt.preventDefault();

        if (_this4.quicknavEl.classList.contains("open")) {
          _this4.close_quicknav();
        } else {
          _this4.open_quicknav();
        }
      });
    }
    /**
     * Close the quicknav on scroll
     */

  }, {
    key: "close_on_scroll",
    value: function close_on_scroll() {
      var _this5 = this;

      if (this.settings.add_trigger !== true) {
        return;
      }

      window.addEventListener('scroll', _.throttle(function () {
        if (_this5.quicknavEl.classList.contains("open")) {
          _this5.close_quicknav();
        }
      }, 300));
    }
    /**
     * Hide the quicknav
     * When the window reach a section, hide the quicknav.
     * Usually, this section is the footer.
     */

  }, {
    key: "hide_quicknav",
    value: function hide_quicknav() {
      var hideHereEl = document.querySelector(this.settings.section_class_hide);

      if (!hideHereEl) {
        return;
      }

      ScrollTrigger.create({
        trigger: hideHereEl,
        toggleClass: {
          targets: this.quicknavEl,
          className: "quickNav--hide"
        },
        // Describes a place on the trigger and a place on the scroller 
        // that must meet in order to start the ScrollTrigger.
        // Example:
        // "top center" = "when the top of the trigger hits the center of the scroller"
        // "bottom 80%" = "when the bottom of the trigger hits 80% down from the top of the viewport" 
        start: "top 25%",
        // Ce code permet de ne pas avoir de fin au ScrollTrigger
        endTrigger: "html",
        end: "bottom top" // markers: true,
        // id: "hide quicknav",

      });
    }
    /**
     * Update the trigger label
     * Mettre le nom de la section active dans le trigger button.
     */

  }, {
    key: "set_trigger_label",
    value: function set_trigger_label(sectionEl) {
      if (this.settings.add_trigger !== true) {
        return;
      }

      var sectionName = sectionEl.getAttribute("data-quicknav-title"),
          triggerLabelEl = this.quicknavEl.querySelector(".jsQuickNav__triggerLabel");
      triggerLabelEl.textContent = sectionName;
    }
    /**
     * Open the quicknav
     */

  }, {
    key: "open_quicknav",
    value: function open_quicknav() {
      this.quicknavEl.classList.add('open');
    }
    /**
     * Close the quicknav
     */

  }, {
    key: "close_quicknav",
    value: function close_quicknav() {
      this.quicknavEl.classList.remove('open');
    }
    /**
     * Trouver une section par index de section (data-quicknav-index).
     */

  }, {
    key: "find_section_by_index",
    value: function find_section_by_index(searchIndex) {
      var sectionFound = null;
      this.sectionsEl.forEach(function (sectionEl) {
        var sectionIndex = sectionEl.getAttribute("data-quicknav-index");

        if (sectionIndex == searchIndex) {
          sectionFound = sectionEl;
        }
      });
      return sectionFound;
    }
    /**
     * Trouver un lien par index de section (data-quicknav-index).
     */

  }, {
    key: "find_link_by_index",
    value: function find_link_by_index(searchIndex) {
      var linkFound = null;
      this.linksEL.forEach(function (linkEl) {
        var sectionIndex = linkEl.getAttribute("data-quicknav-index");

        if (sectionIndex == searchIndex) {
          linkFound = linkEl;
        }
      });
      return linkFound;
    }
    /**
     * Scroll to section
     * Centralise le code qui permet de scroller vers une section.
     */

  }, {
    key: "go_to_section",
    value: function go_to_section(sectionEl) {
      var y = sectionEl.getBoundingClientRect().top + window.pageYOffset + this.settings.scroll_offset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      }); // Un jour, utiliser ceci?
      // sectionEl.scrollIntoView({
      // 	behavior: 'smooth', // Defines the transition animation. default: auto
      // 	block: 'center', // Defines vertical alignment. default: start
      // 	inline: 'nearest' // Defines horizontal alignment. default: nearest
      // });
    }
  }]);

  return FBQuickNav;
}();
//# sourceMappingURL=fbquicknav.js.map
