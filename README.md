# fbquicknav.js
This plugin is to automatically create a quick nav to navigate in different sections in a web page.


## Usage
### JS init
`$(".jsQuickNav").fbquicknav();`

### HTML
Add this in your HTML: `<div class="quickNav jsQuickNav"></div>` (the `quickNav` class is for CSS styling, and the `jsQuickNav` is to bind it to the JS).

Add the `jsQuickNav__section` class on each section that you want in the quicknav.

### CSS
The basic styles are in the `style.css` file. Copy those classes in your project for a CSS base.


## Required
* jQuery (tested on jQuery v3.1.1)
* [ScrollMagic](https://github.com/janpaepke/ScrollMagic) (tested on v2.0.5) for modifications on the quick nav when the user scrolls
* [ScrollTo](https://github.com/flesler/jquery.scrollTo) (tested on v2.1.2) for smooth scrolling
* [LoDash](https://lodash.com/) _.debounce


## Options
Configurable options for the plugin. The default values are shown.

```js
$(".jsQuickNav").fbquicknav({
    
    // Class name of the sections that will be added in the quicknav.
    section_class: ".jsQuickNav__section",

    // Required. Data attribute for the title of the section, displayed in the quick nav.
    section_title: "data-quicknav-title",

    // When the quicknav reaches this section, it will hide automatically.
    section_class_hide: ".jsQuickNav__hide",
    
    // Offset of the scroll, in px.
    scroll_offset: -100,
    
    // Duration of the scroll, in ms.
    scroll_duration: 500,
    
    // Calculate each of the section heights, makes the 'active' classes match exactly the height of each section.
    calculate_heights: true,

    // Add a button to open and close the quicknav. Useful for the mobile quickNav.
    add_trigger: false,

    // Place the HTML of the trigger before or after the items.
    trigger_after_items: false,

    // SVG icons of the trigger.
    trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
    trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>',

});
```


## Other options

### Quicknav main title
You can set a main title for your quicknav with the attribute `data-quicknav-main-title` on the quicknav tag: `<div class="quickNav jsQuickNav" data-quicknav-main-title="Main title"></div>`.

### Quicknav main title show
The main title will show only on the sections that you decide. The sections that have the attribute `data-quicknav-main-title-show="1"` will add a `showTitleSection` class to your quicknav to show the main title.

### On dark background
The quicknav can be on a light or a dark background. You can set which sections that are dark with the attribute `data-quicknav-on-dark` on the section. This will add a `onDarkSection` when this section is reached.
