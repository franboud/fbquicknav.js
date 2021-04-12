/**
 * Quick Nav plugin.
 * Version 2.4
 *
 * Required:
 *    - LoDash _.throttle
 *    - GSAP with ScrollTrigger
 *
 * To activate:
 *    new FBQuickNav('.jsQuicknav');
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

class FBQuickNav {
  constructor(selector, options) {
    this.quicknavEl = document.querySelector(selector);

    // Try to init
    if (this.quicknavEl == null || typeof this.quicknavEl === 'undefined') {
      return;
    }

    // Default settings
    this.settings = {
      sectionClass: '.jsQuickNav__section',
      sectionTitle: 'data-quicknav-title',
      section_ClassHide: '.jsQuickNav__hide',
      scrollOffset: -100,
      addTrigger: false,
      triggerAfterItems: false,
      triggerIconOpen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
      triggerIconClose: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>',
    };

    // Merge options in the settings
    this.settings = Object.assign(this.settings, options);

    // Cache HTML nodes, for fast and easy access
    this.nodesEls = [];
    this.nodesEls.sections = [];
    this.nodesEls.links = [];
    this.nodesEls.titles = [];

    // Init this plugin
    this.init();
  }

  init() {
    this.getSections();
    this.buildHTML();
    this.clickItemsEvents();
    this.scrollActivateItems();
    this.triggerEvents();
    this.closeOnScroll();
    this.hideQuickNav();

    // This init will show the quicknav
    this.quicknavEl.classList.add('isInit');
  }

  /**
   * Get the sections that we will use for the quick nav.
   * Only the sections that has a title defined.
   */
  getSections() {
    const sectionsEl = document.querySelectorAll(`${this.settings.sectionClass}[${this.settings.sectionTitle}]`);

    sectionsEl.forEach((sectionEl, index) => {
      // Set section in a var for quick access by index later on.
      this.nodesEls.sections[index] = sectionEl;

      // Set title in a var for quick access by index later on.
      const sectionTitle = sectionEl.getAttribute('data-quicknav-title');
      this.nodesEls.titles[index] = sectionTitle;
    });
  }

  /**
   * Creates the HTML and add it to the DOM.
   */
  buildHTML() {
    /**
     * CHECK
     * If the HTML is hard-coded, don't create it again.
     */
    if (this.quicknavEl.innerHTML !== '') {
      return;
    }

    /**
     * WRAP
     * Wrap everything in a __in div.
     */
    const quicknavInEl = document.createElement('div');
    quicknavInEl.classList.add('quickNav__in');

    /**
     * ADD ITEMS
     * Add all the items in the quicknav.
     */
    const itemsEl = document.createElement('div');
    itemsEl.classList.add('quickNav__items', 'jsQuickNav__ctn');

    this.nodesEls.sections.forEach((sectionEl, index) => {
      const title = sectionEl.getAttribute(this.settings.sectionTitle);

      // <a>
      const itemEl = document.createElement('a');
      itemEl.classList.add('quickNav__item');
      itemEl.href = '#';

      // <span> inside of the <a>
      const spanEl = document.createElement('span');
      spanEl.classList.add('quickNav__text');
      spanEl.textContent = title;

      // Set in this var for quick access by index later on.
      this.nodesEls.links[index] = itemEl;

      // Add to the items DOM
      itemEl.appendChild(spanEl);
      itemsEl.appendChild(itemEl);
    });

    quicknavInEl.appendChild(itemsEl);

    /**
     * TRIGGER
     * Trigger to open / close quicknav
     */
    if (this.settings.addTrigger === true) {
      const buttonEl = document.createElement('button');
      buttonEl.type = 'button';
      buttonEl.classList.add('quickNav__trigger', 'jsQuickNav__trigger');

      const buttonLabel = document.createElement('span');
      buttonLabel.classList.add('quickNav__triggerLabel', 'jsQuickNav__triggerLabel');

      const buttonIcons = document.createElement('span');
      buttonIcons.classList.add('quickNav__triggerIcon');

      const buttonIconOpen = document.createElement('span');
      buttonIconOpen.classList.add('svgIcon', 'quickNav__triggerOpen');
      buttonIconOpen.innerHTML = this.settings.triggerIconOpen;

      const buttonIconClose = document.createElement('span');
      buttonIconClose.classList.add('svgIcon', 'quickNav__triggerClose');
      buttonIconClose.innerHTML = this.settings.triggerIconClose;

      buttonIcons.appendChild(buttonIconOpen);
      buttonIcons.appendChild(buttonIconClose);
      buttonEl.appendChild(buttonLabel);
      buttonEl.appendChild(buttonIcons);

      // Before or after the items list
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
    this.setTriggerLabel(0);
  }

  /**
   * Click on the quicknav link.
   * When there's a click, the page scrolls to the chosen section.
   */
  clickItemsEvents() {
    this.nodesEls.links.forEach((linkEl, index) => {
      linkEl.addEventListener('click', (evt) => {
        evt.preventDefault();

        this.goToSection(this.nodesEls.sections[index]);
      });
    });
  }

  /**
   * Automatic activation of the "active" class on the items.
   * When the user scrolls, the active section is highlighted.
   */
  scrollActivateItems() {
    this.nodesEls.sections.forEach((sectionEl, index) => {
      const linkEl = this.nodesEls.links[index];

      ScrollTrigger.create({
        trigger: sectionEl,

        // Describes a place on the trigger and a place on the scroller
        // that must meet in order to start the ScrollTrigger.
        // Example:
        // "top center" = "when the top of trigger hits the center of the scroller"
        // "bottom 80%" = "when the bottom of trigger hits 80% down from the top of the viewport"
        start: 'top center',
        end: 'bottom center',

        // Gestion custom des events
        onEnter: () => {
          linkEl.classList.add('active');
          this.setTriggerLabel(index);
        },
        onLeave: () => {
          linkEl.classList.remove('active');
        },
        onEnterBack: () => {
          linkEl.classList.add('active');
          this.setTriggerLabel(index);
        },
        onLeaveBack: () => {
          linkEl.classList.remove('active');
        },

        // markers: true,
        // id: "section " + sectionIndex,
      });
    });
  }

  /**
   * Click on the trigger button.
   * Open and close the quicknav.
   */
  triggerEvents() {
    if (this.settings.addTrigger !== true) { return; }

    const triggerEl = this.quicknavEl.querySelector('.jsQuickNav__trigger');
    if (!triggerEl) { return; }

    triggerEl.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (this.quicknavEl.classList.contains('open')) {
        this.closeQuicknav();
      } else {
        this.openQuicknav();
      }
    });
  }

  /**
   * Close the quicknav on scroll
   */
  closeOnScroll() {
    if (this.settings.addTrigger !== true) { return; }

    window.addEventListener('scroll', _.throttle(() => {
      if (this.quicknavEl.classList.contains('open')) {
        this.closeQuicknav();
      }
    }, 300));
  }

  /**
   * Hide the quicknav
   * When the window reach a section, hide the quicknav.
   * Usually, this section is the footer.
   */
  hideQuickNav() {
    const hideHereEl = document.querySelector(this.settings.sectionClassHide);
    if (!hideHereEl) { return; }

    ScrollTrigger.create({
      trigger: hideHereEl,
      toggleClass: { targets: this.quicknavEl, className: 'quickNav--hide' },

      // Describes a place on the trigger and a place on the scroller
      // that must meet in order to start the ScrollTrigger.
      // Example:
      // "top center" = "when the top of the trigger hits the center of the scroller"
      // "bottom 80%" = "when the bottom of the trigger hits 80% down from the top of the viewport"
      start: 'top 25%',

      // No end ScrollTrigger
      endTrigger: 'html',
      end: 'bottom top',

      // markers: true,
      // id: "hide quicknav",
    });
  }

  /**
   * Update the trigger label
   * Set the name of the active section in the trigger button label.
   */
  setTriggerLabel(index) {
    if (this.settings.addTrigger !== true) { return; }

    // Init the var, so we won't query it each time
    if (!this.triggerLabelEl) {
      this.triggerLabelEl = this.quicknavEl.querySelector('.jsQuickNav__triggerLabel');
    }

    // If the node exists, update it.
    if (this.triggerLabelEl) {
      this.triggerLabelEl.textContent = this.nodesEls.titles[index];
    }
  }

  /**
   * Open the quicknav
   */
  openQuicknav() {
    this.quicknavEl.classList.add('open');
  }

  /**
   * Close the quicknav
   */
  closeQuicknav() {
    this.quicknavEl.classList.remove('open');
  }

  /**
   * Scroll to a specific section
   */
  goToSection(sectionEl) {
    const
      y = sectionEl.getBoundingClientRect().top
      + window.pageYOffset
      + this.settings.scrollOffset;

    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
