/**
 * Quick Nav jQuery plugin.
 * Version 1.3
 *
 * Required:
 *    - jQuery (tested on jQuery v3.1.1)
 *    - ScrollTo (tested on 2.1.2)
 *    - ScrollMagic (tested on v2.0.5)
 *
 * Pour activer :
 *    $(".jsQuicknav").fbquicknav();
 *
 * Options configurables :
 *    - section_class --> .jsQuicknav__section --> Sections added in the quick nav.
 *    - section_class_hide --> .jsQuicknav__hide --> When the quicknav reaches this section, hide it.
 *    - section_title --> data-quicknav-title --> Data attribute for the title of the section, displayed in the quick nav.
 *    - scroll_offset --> -100 (px) --> Offset of the scroll when we click on a quick nav link.
 *    - scroll_duration --> 500 (ms) --> Duration of the scroll.
 *    - add_trigger --> false | true --> Add a button to open and close the quicknav.
 *    - calculate_heights --> false | true --> Calculate each of the section heights, makes the 'active' classes match exactly the height of each section.
 */

(function ($) {

    $.fn.fbquicknav = function (options) {


        // Default options.
        var settings = $.extend({
            section_class: ".jsQuicknav__section",
            section_class_hide: ".jsQuicknav__hide",
            section_title: "data-quicknav-title",
            scroll_offset: -100,
            scroll_duration: 500,
            add_trigger: false,
            calculate_heights: false
        }, options);


        // Global vars
        var section_heights = [];
        var scroll_magic_scenes = [];
        var quicknav_is_open = false;


        return this.each(function () {

            // Init vars.
            var
                $quicknav = $(this),
                $sections = $(settings.section_class);

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
                $(window).on("resize", function () {
                    set_section_heights($sections);
                    resize_scroll_magic_scenes($sections);
                });
            }
        });


        // CONSTRUCTOR
        function construct_quicknav($quicknav, $sections) {
            // Create each section in the quicknav and add the title.
            var $items = $("<div>", {
                "class": "quicknav__items jsQuicknav__ctn"
            });

            $sections.each(function (index, element) {
                var
                    $this_section = $(this),
                    title = $this_section.attr(settings.section_title);

                // Element that will be added to the page.
                var $item = $(
                    '<a>', {
                        'href': '#',
                        'class': 'quicknav__item',
                        'html': $(
                            '<span class="quicknav__text">' + title + '</span>'
                        )
                    }
                );

                // Links item to section.
                $item.attr("data-quicknav-index", index);
                $this_section.attr("data-quicknav-index", index);

                $items.append($item);
            });

            $quicknav.append($items);


            // Trigger to open / close quicknav
            if (settings.add_trigger === true) {
                var trigger = ' ' +
                    '<button type="button" class="btn-icon quicknav__trigger jsQuicknav__trigger">' +
                    '<svg class="icon quicknav__triggeropen"><use xlink:href="#icon-main-menu" /></svg>' +
                    '<svg class="icon quicknav__triggerclose"><use xlink:href="#icon-close" /></svg>' +
                    '</button>';

                $quicknav.append(trigger);
            }
        }


        // CLICK ON TRIGGER EVENT.
        // To open and close the quicknav.
        function click_on_trigger_event($quicknav) {
            if (settings.add_trigger !== true) { return; }

            var
                $trigger = $(".jsQuicknav__trigger", $quicknav),
                $items = $(".quicknav__item", $quicknav),
                $quicknav_container = $(".jsQuicknav__ctn", $quicknav);


            // QUICKNAV TOGGLE : Quicknav toggle.
            $trigger.on("click", function (evt) {
                var $this = $(this);

                if (!$quicknav_container.hasClass("on")) {
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
            var
                $trigger = $(".jsQuicknav__trigger", $quicknav),
                $quicknav_container = $(".jsQuicknav__ctn", $quicknav);

            $quicknav_container.addClass("on");
            $trigger.addClass("on");
            quicknav_is_open = true;
        }

        function close_quicknav($quicknav) {
            var
                $trigger = $(".jsQuicknav__trigger", $quicknav),
                $quicknav_container = $(".jsQuicknav__ctn", $quicknav);

            $quicknav_container.removeClass("on");
            $trigger.removeClass("on");
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

                $.scrollTo($section, {
                    offset: settings.scroll_offset,
                    duration: settings.scroll_duration
                });
            });
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
                    $link = $("a[data-quicknav-index='" + section_index + "']", $quicknav),
                    link = $link[0];


                // CLASS TOGGLE when the section is centered in the viewport.
                if (settings.calculate_heights == true) {
                    var scene = new ScrollMagic
                        .Scene({
                            triggerElement: section,
                            triggerHook: 0.5,
                            duration: section_heights[section_index]
                        })
                        .setClassToggle(link, "active") // add class toggle
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
                .setClassToggle($quicknav[0], "quicknav--hide") // add class toggle
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
            // console.log("Sections heights recalculated");
            // console.log(section_heights);
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

