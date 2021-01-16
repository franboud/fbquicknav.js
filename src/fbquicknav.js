/**
 * Quick Nav plugin.
 * Version 2.1
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

class FBQuickNav {
	constructor(selector, options) {
		this.quicknavEl = document.querySelector(selector);

		// Try to init
		if (this.quicknavEl == null || typeof this.quicknavEl === "undefined") {
			return;
		}

		// Default settings
		this.settings = {
			section_class: ".jsQuickNav__section",
			section_title: "data-quicknav-title",
			section_class_hide: ".jsQuickNav__hide",
			scroll_offset: -100,
			add_trigger: false,
			trigger_after_items: false,
			trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
			trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>',
		}

		// Merge options in the settings
		this.settings = Object.assign(this.settings, options);

		// Cache HTML nodes, for fast and easy access
		this.nodesEls = [];
		this.nodesEls['sections'] = [];
		this.nodesEls['links'] = [];
		this.nodesEls['titles'] = [];

		// Init this plugin
		this.init();
	}

	init() {
		this.get_sections();
		this.build_html();
		this.click_items_events();
		this.scroll_activate_items();
		this.open_close_trigger();
		this.close_on_scroll();
		this.hide_quicknav();

		// Tout est fait, init quicknav
		this.quicknavEl.classList.add("isInit");
	}


	/**
	 * Get the sections that we will use for the quick nav.
	 * Only the sections that has a title defined.
	 */
	get_sections() {
		const sectionsEl = document.querySelectorAll(this.settings.section_class + '[' + this.settings.section_title + ']');

		sectionsEl.forEach((sectionEl, index) => {
			// Set section in a var for quick access by index later on.
			this.nodesEls['sections'][index] = sectionEl;

			// Set title in a var for quick access by index later on.
			const sectionTitle = sectionEl.getAttribute("data-quicknav-title");
			this.nodesEls['titles'][index] = sectionTitle;
		});
	}


	/**
	 * Creates the HTML and add it to the DOM.
	 */
	build_html() {

		/**
		 * WRAP
		 * Wrap everything in a __in div.
		 */
		let quicknavInEl = document.createElement("div");
		quicknavInEl.classList.add("quickNav__in");


		/**
		 * ADD ITEMS
		 * Add all the items in the quicknav.
		 */
		let itemsEl = document.createElement("div");
		itemsEl.classList.add('quickNav__items', 'jsQuickNav__ctn');

		this.nodesEls['sections'].forEach((sectionEl, index) => {
			const title = sectionEl.getAttribute(this.settings.section_title);

			// <a>
			let itemEl = document.createElement("a");
			itemEl.classList.add("quickNav__item");
			itemEl.href = "#";

			// <span> inside of the <a>
			let spanEl = document.createElement("span");
			spanEl.classList.add("quickNav__text");
			spanEl.textContent = title;

			// Set in this var for quick access by index later on.
			this.nodesEls['links'][index] = itemEl;

			// Add to the items DOM
			itemEl.appendChild(spanEl);
			itemsEl.appendChild(itemEl);
		});

		quicknavInEl.appendChild(itemsEl);


		/**
		 * TRIGGER
		 * Trigger to open / close quicknav
		 */
		if (this.settings.add_trigger === true) {
			let buttonEl = document.createElement("button");
			buttonEl.type = "button";
			buttonEl.classList.add("quickNav__trigger", "jsQuickNav__trigger");

			let buttonLabel = document.createElement("span");
			buttonLabel.classList.add("quickNav__triggerLabel", "jsQuickNav__triggerLabel");

			let buttonIcons = document.createElement("span");
			buttonIcons.classList.add("quickNav__triggerIcon");

			let buttonIconOpen = document.createElement("span");
			buttonIconOpen.classList.add("svgIcon", "quickNav__triggerOpen");
			buttonIconOpen.innerHTML = this.settings.trigger_icon_open;

			let buttonIconClose = document.createElement("span");
			buttonIconClose.classList.add("svgIcon", "quickNav__triggerClose");
			buttonIconClose.innerHTML = this.settings.trigger_icon_close;

			buttonIcons.appendChild(buttonIconOpen);
			buttonIcons.appendChild(buttonIconClose);
			buttonEl.appendChild(buttonLabel);
			buttonEl.appendChild(buttonIcons);

			// Avant ou apres la liste d'items
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
		 * DEFAULT LABEL
		 * On met le nom de la premiere section dans le trigger label.
		 */
		this.set_trigger_label(0);
	}


	/**
	 * Click on the quicknav link.
	 * When there's a click, the page scrolls to the chosen section.
	 */
	click_items_events() {
		this.nodesEls['links'].forEach((linkEl, index) => {
			linkEl.addEventListener("click", (evt) => {
				evt.preventDefault();

				this.go_to_section(this.nodesEls['sections'][index]);
			});
		});
	}


	/**
	 * Gerer l'activation automatique des classes "active" sur les items.
	 * Quand le user scroll, on indique sur quelle section on se trouve.
	 */
	scroll_activate_items() {
		this.nodesEls['sections'].forEach((sectionEl, index) => {
			const linkEl = this.nodesEls['links'][index];

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
				onEnter: () => {
					linkEl.classList.add("active");
					this.set_trigger_label(index);
				},
				onLeave: () => {
					linkEl.classList.remove("active")
				},
				onEnterBack: () => {
					linkEl.classList.add("active")
					this.set_trigger_label(index);
				},
				onLeaveBack: () => {
					linkEl.classList.remove("active")
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
	open_close_trigger() {
		if (this.settings.add_trigger !== true) { return; }

		const triggerEl = this.quicknavEl.querySelector(".jsQuickNav__trigger");
		if (!triggerEl) { return; }


		triggerEl.addEventListener("click", (evt) => {
			evt.preventDefault();

			if (this.quicknavEl.classList.contains("open")) {
				this.close_quicknav();
			} else {
				this.open_quicknav();
			}
		});
	}


	/**
	 * Close the quicknav on scroll
	 */
	close_on_scroll() {
		if (this.settings.add_trigger !== true) { return; }

		window.addEventListener('scroll', _.throttle(() => {
			if (this.quicknavEl.classList.contains("open")) {
				this.close_quicknav();
			}
		}, 300));
	}


	/**
	 * Hide the quicknav
	 * When the window reach a section, hide the quicknav.
	 * Usually, this section is the footer.
	 */
	hide_quicknav() {
		const hideHereEl = document.querySelector(this.settings.section_class_hide);
		if (!hideHereEl) { return; }


		ScrollTrigger.create({
			trigger: hideHereEl,
			toggleClass: { targets: this.quicknavEl, className: "quickNav--hide" },

			// Describes a place on the trigger and a place on the scroller 
			// that must meet in order to start the ScrollTrigger.
			// Example:
			// "top center" = "when the top of the trigger hits the center of the scroller"
			// "bottom 80%" = "when the bottom of the trigger hits 80% down from the top of the viewport" 
			start: "top 25%",

			// Ce code permet de ne pas avoir de fin au ScrollTrigger
			endTrigger: "html",
			end: "bottom top",

			// markers: true,
			// id: "hide quicknav",
		});
	}


	/**
	 * Update the trigger label
	 * Mettre le nom de la section active dans le trigger button.
	 */
	set_trigger_label(index) {
		if (this.settings.add_trigger !== true) { return; }

		// Init the var, so we won't query it each time
		if (!this.triggerLabelEl) {
			this.triggerLabelEl = this.quicknavEl.querySelector(".jsQuickNav__triggerLabel");
		}

		// If the node exists, update it.
		if (this.triggerLabelEl) {
			this.triggerLabelEl.textContent = this.nodesEls['titles'][index];
		}
	}


	/**
	 * Open the quicknav
	 */
	open_quicknav() {
		this.quicknavEl.classList.add('open');
	}


	/**
	 * Close the quicknav
	 */
	close_quicknav() {
		this.quicknavEl.classList.remove('open');
	}


	/**
	 * Scroll to section
	 * Centralise le code qui permet de scroller vers une section.
	 */
	go_to_section(sectionEl) {
		const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + this.settings.scroll_offset;
		window.scrollTo({ top: y, behavior: 'smooth' });
	}
}