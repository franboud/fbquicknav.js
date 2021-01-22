"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Quick Nav plugin.
 * Version 2.2
 *
 * Required:
 *    - LoDash _.throttle
 *	  - GSAP with ScrollTrigger
 *
 * To activate:
 *	  new FBQuickNav('.jsQuicknav');
 *    const quickNav = new FBQuickNav('.jsQuicknav');
 *    const quickNav = new FBQuickNav('.jsQuicknav', { options });
 *
 * Settings:
 *    - sectionClass --> Class name of the sections added in the quick nav.
 *    - sectionTitle --> Data attribute for the title of the section, displayed in the quick nav.
 *    - sectionClassHide --> When the quicknav reaches this section, hide it.
 *    - scrollOffset --> Offset when scrolling to a section.
 *    - addTrigger --> Add a button to open and close the quicknav.
 *    - triggerAfterItems --> Position of the trigger HTML: before or after the items.
 *    - triggerIconOpen --> SVG of the icon of the trigger to show the items.
 *    - triggerIconClose --> SVG of the icon of the trigger to hide the items.
 */
var FBQuickNav = /*#__PURE__*/function () {
  function FBQuickNav(selector, options) {
    _classCallCheck(this, FBQuickNav);

    this.quicknavEl = document.querySelector(selector); // Try to init

    if (this.quicknavEl == null || typeof this.quicknavEl === "undefined") {
      return;
    } // Default settings


    this.settings = {
      sectionClass: ".jsQuickNav__section",
      sectionTitle: "data-quicknav-title",
      sectionClassHide: ".jsQuickNav__hide",
      scrollOffset: -100,
      addTrigger: false,
      triggerAfterItems: false,
      triggerIconOpen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
      triggerIconClose: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>'
    }; // Merge options in the settings

    this.settings = Object.assign(this.settings, options); // Cache HTML nodes, for fast and easy access

    this.nodesEls = [];
    this.nodesEls['sections'] = [];
    this.nodesEls['links'] = [];
    this.nodesEls['titles'] = []; // Init this plugin

    this.init();
  }

  _createClass(FBQuickNav, [{
    key: "init",
    value: function init() {
      this.getSections();
      this.buildHTML();
      this.clickItemsEvents();
      this.scrollActivateItems();
      this.triggerEvents();
      this.closeOnScroll();
      this.hideQuickNav(); // This init will show the quicknav

      this.quicknavEl.classList.add("isInit");
    }
    /**
     * Get the sections that we will use for the quick nav.
     * Only the sections that has a title defined.
     */

  }, {
    key: "getSections",
    value: function getSections() {
      var _this = this;

      var sectionsEl = document.querySelectorAll(this.settings.sectionClass + '[' + this.settings.sectionTitle + ']');
      sectionsEl.forEach(function (sectionEl, index) {
        // Set section in a var for quick access by index later on.
        _this.nodesEls['sections'][index] = sectionEl; // Set title in a var for quick access by index later on.

        var sectionTitle = sectionEl.getAttribute("data-quicknav-title");
        _this.nodesEls['titles'][index] = sectionTitle;
      });
    }
    /**
     * Creates the HTML and add it to the DOM.
     */

  }, {
    key: "buildHTML",
    value: function buildHTML() {
      var _this2 = this;

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
      this.nodesEls['sections'].forEach(function (sectionEl, index) {
        var title = sectionEl.getAttribute(_this2.settings.sectionTitle); // <a>

        var itemEl = document.createElement("a");
        itemEl.classList.add("quickNav__item");
        itemEl.href = "#"; // <span> inside of the <a>

        var spanEl = document.createElement("span");
        spanEl.classList.add("quickNav__text");
        spanEl.textContent = title; // Set in this var for quick access by index later on.

        _this2.nodesEls['links'][index] = itemEl; // Add to the items DOM

        itemEl.appendChild(spanEl);
        itemsEl.appendChild(itemEl);
      });
      quicknavInEl.appendChild(itemsEl);
      /**
       * TRIGGER
       * Trigger to open / close quicknav
       */

      if (this.settings.addTrigger === true) {
        var buttonEl = document.createElement("button");
        buttonEl.type = "button";
        buttonEl.classList.add("quickNav__trigger", "jsQuickNav__trigger");
        var buttonLabel = document.createElement("span");
        buttonLabel.classList.add("quickNav__triggerLabel", "jsQuickNav__triggerLabel");
        var buttonIcons = document.createElement("span");
        buttonIcons.classList.add("quickNav__triggerIcon");
        var buttonIconOpen = document.createElement("span");
        buttonIconOpen.classList.add("svgIcon", "quickNav__triggerOpen");
        buttonIconOpen.innerHTML = this.settings.triggerIconOpen;
        var buttonIconClose = document.createElement("span");
        buttonIconClose.classList.add("svgIcon", "quickNav__triggerClose");
        buttonIconClose.innerHTML = this.settings.triggerIconClose;
        buttonIcons.appendChild(buttonIconOpen);
        buttonIcons.appendChild(buttonIconClose);
        buttonEl.appendChild(buttonLabel);
        buttonEl.appendChild(buttonIcons); // Before or after the items list

        if (this.settings.triggerAfterItems) {
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
       * DEFAULT LABEL
       * We show the first section name in the label.
       */

      this.set_trigger_label(0);
    }
    /**
     * Click on the quicknav link.
     * When there's a click, the page scrolls to the chosen section.
     */

  }, {
    key: "clickItemsEvents",
    value: function clickItemsEvents() {
      var _this3 = this;

      this.nodesEls['links'].forEach(function (linkEl, index) {
        linkEl.addEventListener("click", function (evt) {
          evt.preventDefault();

          _this3.go_to_section(_this3.nodesEls['sections'][index]);
        });
      });
    }
    /**
     * Automatic activation of the "active" class on the items.
     * When the user scrolls, the active section is highlighted.
     */

  }, {
    key: "scrollActivateItems",
    value: function scrollActivateItems() {
      var _this4 = this;

      this.nodesEls['sections'].forEach(function (sectionEl, index) {
        var linkEl = _this4.nodesEls['links'][index];
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

            _this4.set_trigger_label(index);
          },
          onLeave: function onLeave() {
            linkEl.classList.remove("active");
          },
          onEnterBack: function onEnterBack() {
            linkEl.classList.add("active");

            _this4.set_trigger_label(index);
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
    key: "triggerEvents",
    value: function triggerEvents() {
      var _this5 = this;

      if (this.settings.addTrigger !== true) {
        return;
      }

      var triggerEl = this.quicknavEl.querySelector(".jsQuickNav__trigger");

      if (!triggerEl) {
        return;
      }

      triggerEl.addEventListener("click", function (evt) {
        evt.preventDefault();

        if (_this5.quicknavEl.classList.contains("open")) {
          _this5.close_quicknav();
        } else {
          _this5.open_quicknav();
        }
      });
    }
    /**
     * Close the quicknav on scroll
     */

  }, {
    key: "closeOnScroll",
    value: function closeOnScroll() {
      var _this6 = this;

      if (this.settings.addTrigger !== true) {
        return;
      }

      window.addEventListener('scroll', _.throttle(function () {
        if (_this6.quicknavEl.classList.contains("open")) {
          _this6.close_quicknav();
        }
      }, 300));
    }
    /**
     * Hide the quicknav
     * When the window reach a section, hide the quicknav.
     * Usually, this section is the footer.
     */

  }, {
    key: "hideQuickNav",
    value: function hideQuickNav() {
      var hideHereEl = document.querySelector(this.settings.sectionClassHide);

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
        // No end ScrollTrigger
        endTrigger: "html",
        end: "bottom top" // markers: true,
        // id: "hide quicknav",

      });
    }
    /**
     * Update the trigger label
     * Set the name of the active section in the trigger button label.
     */

  }, {
    key: "set_trigger_label",
    value: function set_trigger_label(index) {
      if (this.settings.addTrigger !== true) {
        return;
      } // Init the var, so we won't query it each time


      if (!this.triggerLabelEl) {
        this.triggerLabelEl = this.quicknavEl.querySelector(".jsQuickNav__triggerLabel");
      } // If the node exists, update it.


      if (this.triggerLabelEl) {
        this.triggerLabelEl.textContent = this.nodesEls['titles'][index];
      }
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
     * Scroll to a specific section
     */

  }, {
    key: "go_to_section",
    value: function go_to_section(sectionEl) {
      var y = sectionEl.getBoundingClientRect().top + window.pageYOffset + this.settings.scrollOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }]);

  return FBQuickNav;
}();
//# sourceMappingURL=fbquicknav.js.map
