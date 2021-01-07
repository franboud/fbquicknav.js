/**
 * Quick Nav jQuery plugin.
 * Version 1.7
 *
 * Required:
 *    - jQuery (tested on jQuery v3.1.1)
 *    - ScrollTo (tested on 2.1.2)
 *    - ScrollMagic (tested on v2.0.5)
 *    - LoDash _.debounce function
 *
 * Pour activer :
 *    $(".jsQuickNav").fbquicknav();
 *
 * Options configurables :
 *    - section_class --> .jsQuickNav__section --> Sections added in the quick nav.
 *    - section_class_hide --> .jsQuickNav__hide --> When the quicknav reaches this section, hide it.
 *    - section_title --> data-quicknav-title --> Data attribute for the title of the section, displayed in the quick nav.
 *    - scroll_offset --> -100 (px) --> Offset of the scroll when we click on a quick nav link.
 *    - scroll_duration --> 500 (ms) --> Duration of the scroll.
 *    - calculate_heights --> false | true --> Calculate each of the section heights, makes the 'active' classes match exactly the height of each section.
 *    - add_trigger --> false | true --> Add a button to open and close the quicknav.
 *    - trigger_after_items --> false | true --> Position of the trigger: before or after the items.
 *    - trigger_icon_open --> SVG --> SVG of the icon of the trigger to show the items.
 *    - trigger_icon_close --> SVG --> SVG of the icon of the trigger to hide the items.
 */

(function ($) {

    $.fn.fbquicknav = function (options) {


        // Default options.
        var settings = $.extend({
            section_class: ".jsQuickNav__section",
            section_title: "data-quicknav-title",
            section_class_hide: ".jsQuickNav__hide",
            scroll_offset: -100,
            scroll_duration: 500,
            calculate_heights: true,
            add_trigger: false,
            trigger_after_items: false,
            trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
            trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>',
        }, options);


        // Global vars
        var section_heights = [];
        var scroll_magic_scenes = [];
        var quicknav_is_open = false;


        return this.each(function () {

            // Init vars.
            var
                $quicknav = $(this),
                $sections = $(settings.section_class + '[' + settings.section_title + ']'); // Seulement les sections qui ont un titre defined.

            construct_quicknav($quicknav, $sections);
            click_on_trigger_event($quicknav);
            close_on_scroll($quicknav);
            click_on_quicknav_event($quicknav, $sections);
            set_section_heights($sections);
            toggle_quicknav_classes($quicknav, $sections);
            toggle_hide_quicknav($quicknav);

            // ON RESIZE, the sections changes height.
            // This code set the sections to the new height.
            if (settings.calculate_heights == true) {
                window.addEventListener('resize', _.debounce(function () {
                    set_section_heights($sections);
                    resize_scroll_magic_scenes($sections);
                }, 300));
            }

            // Tout est fait, init quicknav
            $quicknav.addClass('isInit');
        });


        // CONSTRUCTOR
        function construct_quicknav($quicknav, $sections) {

            /**
             * CHECK
             * Check if the HTML was harcoded, if yes : don't create it again.
             */
            var $items = $(".quickNav__items", $quicknav);
            if ($items.length > 0) { return; }


            /**
             * ITEMS
             * Container of all the items.
             */
            $items = $("<div>", {
                "class": "quickNav__items jsQuickNav__ctn"
            });

            $sections.each(function (index, element) {
                var
                    $this_section = $(element),
                    title = $this_section.attr(settings.section_title);

                // Element that will be added to the page.
                var $item = $(
                    '<a>', {
                    'href': '#',
                    'class': 'quickNav__item',
                    'html': $(
                        '<span class="quickNav__text">' + title + '</span>'
                    )
                }
                );

                // Links item to section.
                $item.attr("data-quicknav-index", index);
                $this_section.attr("data-quicknav-index", index);

                // Add title to $section data
                $this_section.data('titre', title);

                $items.append($item);
            });


            /**
             * TITLE
             * Title of the quicknav, optional.
             */
            var quicknavTitle = $quicknav.attr('data-quicknav-main-title');

            if (typeof quicknavTitle !== 'undefined') {
                var $divCarrieres = $(
                    "<div>", {
                    "class": "quickNav__carrieres",
                    "html": quicknavTitle
                });

                $quicknav.append($divCarrieres);
            }

            $quicknav.append($items);


            /**
             * TRIGGER
             * Trigger to open / close quicknav
             */
            if (settings.add_trigger === true) {
                var trigger = ' ' +
                    '<button type="button" class="quickNav__trigger jsQuickNav__trigger"> ' +
                    '<span class="quickNav__triggerLabel jsQuickNav__triggerLabel"> </span> ' +
                    '<span class="quickNav__triggerIcon"> ' +
                    '<span class="svgIcon quickNav__triggerOpen">' + settings.trigger_icon_open + '</span> ' +
                    '<span class="svgIcon quickNav__triggerClose">' + settings.trigger_icon_close + '</span> ' +
                    '</span> ' +
                    '</button>';

                // Avant ou apres la liste d'items
                if (settings.trigger_after_items) {
                    $quicknav.append(trigger);
                } else {
                    $quicknav.prepend(trigger);
                }

                // Par default : on met le nom de la premiere section dans le trigger label.
                set_trigger_label($quicknav, $($sections[0]));
            }


            /**
             * WRAP
             * Wrap everything in a __in div.
             */
            $quicknav.wrapInner('<div class="quickNav__in"></div>');
        }



        // CLICK ON TRIGGER EVENT.
        // To open and close the quicknav.
        function click_on_trigger_event($quicknav) {
            if (settings.add_trigger !== true) { return; }

            var
                $trigger = $(".jsQuickNav__trigger", $quicknav),
                $items = $(".quickNav__item", $quicknav),
                $quicknav_container = $(".jsQuickNav__ctn", $quicknav);


            // QUICKNAV TOGGLE : Quicknav toggle.
            $trigger.on("click", function (evt) {
                if (!$quicknav.hasClass('open')) {
                    // Quicknav not open, so we open it.
                    open_quicknav($quicknav);
                } else {
                    // Quicknav already opened, so we close it.
                    close_quicknav($quicknav);
                }

                evt.preventDefault();
            });
        }


        // CLOSE QUICKNAV ON SCROLL
        function close_on_scroll($quicknav) {
            if (settings.add_trigger !== true) { return; }


            $(window).on("scroll", function () {
                if (quicknav_is_open) {
                    close_quicknav($quicknav);
                }
            });
        }


        function open_quicknav($quicknav) {
            $quicknav.addClass('open');
            quicknav_is_open = true;
        }

        function close_quicknav($quicknav) {
            $quicknav.removeClass('open');
            quicknav_is_open = false;
        }


        // CLICK EVENT on the quicknav link.
        // When there's a click, the page scrolls to the chosen section.
        function click_on_quicknav_event($quicknav, $sections) {

            $quicknav.on("click", "a", function (evt) {
                evt.preventDefault();

                var
                    $this = $(this),
                    section_index = $this.attr("data-quicknav-index"),
                    $section = $sections.filter("[data-quicknav-index='" + section_index + "']");

                go_to_section($section);
            });
        }


        // GO TO SECTION
        // Centralise le code qui permet de scroller vers une section.
        function go_to_section($section) {
            $.scrollTo($section, {
                offset: settings.scroll_offset,
                duration: settings.scroll_duration
            });
        }


        // UPDATE TRIGGER LABEL
        // Mettre le nom de la section active dans le trigger button.
        function set_trigger_label($quicknav, $section) {
            if (settings.add_trigger !== true) { return; }

            var
                $triggerLabel = $(".jsQuickNav__triggerLabel", $quicknav),
                sectionName = $section.data('titre');

            $triggerLabel.html(sectionName);
        }


        // GO TO NEXT SECTION
        // Scroll automatiquement vers la prochaine section.
        // Utile quand on a un bouton de prochaine section.
        function go_to_next_section($quicknav, $sections) {
            var
                section_active_index = $('a.active', $quicknav).attr("data-quicknav-index"),
                next_section_index = 0;

            if (typeof section_active_index === 'undefined') {
                next_section_index = 0;
            } else {
                next_section_index = parseInt(section_active_index) + 1;
            }

            var $section = $sections.filter("[data-quicknav-index='" + next_section_index + "']");

            go_to_section($section);
        }


        // CLASSES TOGGLE on the quicknav.
        function toggle_quicknav_classes($quicknav, $sections) {
            var
                controller = new ScrollMagic.Controller(),
                $linksAll = $('a', $quicknav);

            $sections.each(function (index, section) {
                var
                    $section = $(section),
                    section_index = $section.attr("data-quicknav-index"),
                    onDark = $section.attr("data-quicknav-on-dark"),
                    showTitle = $section.attr("data-quicknav-main-title-show"),
                    $link = $("a[data-quicknav-index='" + section_index + "']", $quicknav);


                // DARK BG section or not?
                if (typeof onDark === "undefined") {
                    onDark = false;
                } else {
                    onDark = true;
                }


                // SHOW TITLE of quicknav in this section or not?
                if (typeof showTitle === "undefined") {
                    showTitle = false;
                } else {
                    showTitle = true;
                }


                // CLASS TOGGLE when the section is centered in the viewport.
                if (settings.calculate_heights == true) {
                    var scene = new ScrollMagic
                        .Scene({
                            triggerElement: section,
                            triggerHook: 0.5,
                            duration: section_heights[section_index]
                        })
                        .on('enter', function () {
                            $section.data('active', 1);
                            $link.addClass('active');

                            if (onDark) {
                                $quicknav.addClass('onDarkSection');
                            }

                            if (showTitle) {
                                $quicknav.addClass('showTitleSection');
                            }

                            set_trigger_label($quicknav, $section);
                        })
                        .on('leave', function () {
                            $section.data('active', 0);
                            $link.removeClass('active');

                            if (onDark) {
                                $quicknav.removeClass('onDarkSection');
                            }

                            if (showTitle) {
                                $quicknav.removeClass('showTitleSection');
                            }
                        })
                        // .addIndicators() // add indicators (requires plugin)
                        .addTo(controller);

                } else {
                    var scene = new ScrollMagic.Scene();
                    scene
                        .triggerElement(section)
                        .triggerHook(0.5)
                        .on('start', function (evt) {

                            if (evt.scrollDirection == "FORWARD") {
                                $linksAll.removeClass('active');
                                $link.addClass('active');

                            } else {
                                $linksAll.removeClass('active');

                                // Get le link de la section precedente
                                var
                                    section_index_prev = section_index - 1,
                                    $linkPrev = $("a[data-quicknav-index='" + section_index_prev + "']", $quicknav);

                                $linkPrev.addClass('active');
                            }
                        })
                        // .addIndicators() // add indicators (requires plugin)
                        .addTo(controller);
                }



                // Push the scene to the array of scene objects
                scroll_magic_scenes[section_index] = scene;
            });
        }


        // HIDE QUICK NAV
        // When the window reach a section, hide the quicknav.
        // Usually, this section is the footer.
        function toggle_hide_quicknav($quicknav) {
            var $hide_on_this_section = $(settings.section_class_hide);
            if ($hide_on_this_section.length === 0) { return; }


            var controller = new ScrollMagic.Controller();

            // CLASS TOGGLE on quick nav when the section is centered in the viewport.
            var scene = new ScrollMagic
                .Scene({ triggerElement: $hide_on_this_section[0], triggerHook: 0.7 })
                .setClassToggle($quicknav[0], "quickNav--hide") // add class toggle
                // .addIndicators() // add indicators (requires plugin)
                .addTo(controller);

        }


        // SET SECTIONS HEIGHTS
        // Set toutes les hauteurs de section.
        // Au init, ou au screen resize.
        function set_section_heights($sections) {
            if (settings.calculate_heights !== true) { return; }

            $sections.each(function (index, section) {
                var height = $(section).outerHeight(true);
                section_heights[index] = height;
            });
        }

        // RESIZE SCENES
        // Resize all the scroll magic scenes according to the new heights.
        function resize_scroll_magic_scenes($sections) {
            $sections.each(function (index, section) {
                scroll_magic_scenes[index].duration(section_heights[index]);
            });
        }
    };

}(jQuery));

