/**
 * Quick Nav plugin.
 * Version 2.2
 *
 * Required:
 *    - LoDash _.debounce et _.throttle
 *
 * Pour activer :
 *	  new FBQuickNav('.jsQuicknav');
 *    const quickNav = new FBQuickNav('.jsQuicknav');
 *
 * Options configurables :
 *    - section_class --> .jsQuickNav__section --> Sections added in the quick nav.
 *    - section_title --> data-quicknav-title --> Data attribute for the title of the section, displayed in the quick nav.
 *    - section_class_hide --> .jsQuickNav__hide --> When the quicknav reaches this section, hide it.
 *    - scroll_offset --> -100 (px) --> Offset of the scroll when we click on a quick nav link.
 *    - add_trigger --> false | true --> Add a button to open and close the quicknav.
 *    - trigger_after_items --> false | true --> Position of the trigger: before or after the items.
 *    - trigger_icon_open --> SVG --> SVG of the icon of the trigger to show the items.
 *    - trigger_icon_close --> SVG --> SVG of the icon of the trigger to hide the items.
 */

class FBQuickNav {
	constructor(selector) {
		this.selector = selector;
		this.quicknavEl = document.querySelector(this.selector);

		// Try to init
		if (this.quicknavEl == null || typeof this.quicknavEl === "undefined") {
			return;
		}


		this.settings = {
			section_class: ".jsQuickNav__section",
			section_title: "data-quicknav-title",
			section_class_hide: ".footer",
			scroll_offset: -120,
			add_trigger: true,
			trigger_after_items: false,
			// trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
			// trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>',
			trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 28.82l.75-.65 8.4-7.27-1.49-1.72L24 25.81l-7.66-6.63-1.49 1.72 8.4 7.27.75.65z"/></svg>',
			trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M34.53 34.4l-.09.1a1.11 1.11 0 01-1.82 0L24 25.93l-8.57 8.57a1.1 1.1 0 01-1.82 0l-.14-.1a1.11 1.11 0 010-1.82L22.09 24l-8.57-8.6a1.09 1.09 0 010-1.82l.09-.1a1.12 1.12 0 011.82 0L24 22.05l8.57-8.57a1.12 1.12 0 011.82 0l.09.1a1.11 1.11 0 010 1.82L25.92 24l8.61 8.61a1.12 1.12 0 010 1.79z"/></svg>',
		}

		this.init();
	}

	init() {
		this.sectionsEl = document.querySelectorAll(this.settings.section_class + '[' + this.settings.section_title + ']'); // Seulement les sections qui ont un titre defined.

		this.build_html();
		this.click_on_quicknav_event();
		this.toggle_quicknav_classes();
		this.click_on_trigger_event();
		this.close_on_scroll();
		this.toggle_hide_quicknav();

		// Tout est fait, init quicknav
		this.quicknavEl.classList.add("isInit");
	}


	/**
	 * Creates the HTML and add it to the DOM.
	 */
	build_html() {

		/**
		 * CHECK
		 * Check if the HTML was harcoded, if yes : don't create it again.
		 */
		const itemsCheck = this.quicknavEl.querySelector('.quickNav__items');
		if (typeof (itemsCheck) != 'undefined' && itemsCheck != null) {
			return;
		}


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

		this.sectionsEl.forEach((sectionEl, index) => {
			const title = sectionEl.getAttribute(this.settings.section_title);

			// <a>
			let itemEl = document.createElement("a");
			itemEl.classList.add("quickNav__item");
			itemEl.href = "#";

			// <span> inside of the <a>
			let spanEl = document.createElement("span");
			spanEl.classList.add("quickNav__text");
			spanEl.textContent = title;

			// Link the item to the section, for easy access later
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
	 * Click on the trigger button.
	 * Open and close the quicknav.
	 */
	click_on_trigger_event() {
		if (this.settings.add_trigger !== true) { return; }

		const triggerEl = this.quicknavEl.querySelector(".jsQuickNav__trigger");

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
	 * Update the trigger label
	 * Mettre le nom de la section active dans le trigger button.
	 */
	set_trigger_label(sectionEl) {
		if (this.settings.add_trigger !== true) { return; }

		const
			sectionName = sectionEl.getAttribute("data-quicknav-title"),
			triggerLabelEl = this.quicknavEl.querySelector(".jsQuickNav__triggerLabel");

		triggerLabelEl.textContent = sectionName;
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
	 * Click on the quicknav link.
	 * When there's a click, the page scrolls to the chosen section.
	 */
	click_on_quicknav_event() {
		this.quicknavEl.addEventListener("click", (evt) => {
			// On cible seulement les liens <a>
			// ATTENTION! closest bubbles up jusqu'au document.
			const linkEl = evt.target.closest("a.quickNav__item");
			if (!linkEl) { return };
			evt.preventDefault();


			const section_index = linkEl.getAttribute("data-quicknav-index");
			const sectionEl = this.find_section_by_index(section_index);

			if (sectionEl != null) {
				this.go_to_section(sectionEl);
			}
		});
	}


	/**
	 * Trouver une section par index de section (data-quicknav-index).
	 */
	find_section_by_index(searchIndex) {
		let sectionFound = null;

		this.sectionsEl.forEach((sectionEl) => {
			const sectionIndex = sectionEl.getAttribute("data-quicknav-index");

			if (sectionIndex == searchIndex) {
				sectionFound = sectionEl;
			}
		});

		return sectionFound;
	}


	/**
	 * Trouver un lien par index de section (data-quicknav-index).
	 */
	find_link_by_index(searchIndex) {
		let linkFound = null;

		this.linksEL.forEach((linkEl) => {
			const sectionIndex = linkEl.getAttribute("data-quicknav-index");

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
	go_to_section(sectionEl) {
		const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + this.settings.scroll_offset;
		window.scrollTo({ top: y, behavior: 'smooth' });

		// Un jour, utiliser ceci?
		// sectionEl.scrollIntoView({
		// 	behavior: 'smooth', // Defines the transition animation. default: auto
		// 	block: 'center', // Defines vertical alignment. default: start
		// 	inline: 'nearest' // Defines horizontal alignment. default: nearest
		// });
	}



	/**
	 * Gerer l'activation automatique des classes "active" sur les items.
	 * Quand le user scroll, on indique sur quelle section on se trouve.
	 */
	toggle_quicknav_classes() {
		this.sectionsEl.forEach((sectionEl) => {
			const
				sectionIndex = sectionEl.getAttribute("data-quicknav-index"),
				linkEl = this.find_link_by_index(sectionIndex);


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
					this.set_trigger_label(sectionEl);
				},
				onLeave: () => {
					linkEl.classList.remove("active")
				},
				onEnterBack: () => {
					linkEl.classList.add("active")
					this.set_trigger_label(sectionEl);
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
	 * Hide the quicknav
	 * When the window reach a section, hide the quicknav.
	 * Usually, this section is the footer.
	 */
	toggle_hide_quicknav() {
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
}