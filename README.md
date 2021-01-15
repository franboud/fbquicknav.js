# fbquicknav.js
This vanilla JS plugin creates a quick nav to navigate the sections of a web page.


## How to use
### JS
```javascript
new FBQuickNav('.jsQuicknav');
const quickNav = new FBQuickNav('.jsQuicknav');
const quickNav = new FBQuickNav('.jsQuicknav', { options });
```

### HTML
#### QuickNav
Add this in your HTML where you want the quick nav to appear: `<div class="quickNav jsQuickNav"></div>` (the `quickNav` class is for CSS styling, and the `jsQuickNav` is to bind it to the JS).

#### Sections
For each section that you want in the quick nav:
* Add the `jsQuickNav__section` class
* Add the `[data-quicknav-title]` data attribute and write in it the title of the section

### CSS
The basic styles are in the `style.css` file. Copy those classes in your project for basic styles.


## Required
* [GSAP](https://greensock.com/gsap/) with [ScrollTrigger](https://greensock.com/scrolltrigger/)
* [LoDash](https://lodash.com/) _.throttle


## Options
Configurable options for the plugin. The default values are shown.

```js
new FBQuickNav('.jsQuicknav', {
    
    // Class name of the sections added in the quick nav.
    // Value: CSS selector
    section_class: ".jsQuickNav__section",

    // Data attribute for the title of the section, displayed in the quick nav.
    // Value: HTML data attribute
    section_title: "data-quicknav-title",

    // When the quicknav reaches this section, hide it.
    // Value: CSS selector
    section_class_hide: ".jsQuickNav__hide",
    
    // Offset when scrolling to a section.
    // Value: pixels
    scroll_offset: -100,
    
    // Add a button to open and close the quicknav.
    // Value: boolean
    add_trigger: false,

    // Position of the trigger HTML: before or after the items.
    // Value: boolean
    trigger_after_items: false,

    // SVG icons of the trigger.
    // Value: SVG
    trigger_icon_open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 79.53L2.5 32.03l11.56-11.56L50 56.41l35.94-35.94L97.5 32.03z"/></svg>',
    trigger_icon_close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M1.004 89.605l88.6-88.6 9.397 9.397-88.6 88.6z"/><path d="M1.004 10.394L10.402.997l88.6 88.6-9.398 9.397z"/></svg>',

});
```
