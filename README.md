# fbquicknav.js
This plugin is to automatically create a quick nav to navigate in different sections in a web page.


## Usage
### JS init
`$(".jsQuicknav").fbquicknav();`

### HTML
Add this in your HTML: `<div class="quicknav jsQuicknav"></div>` (the `quicknav` class is for CSS styling, and the `jsQuicknav` is to bind it to the JS).

Add the `jsQuicknav__section` class on each section that you want in the quicknav.

### CSS
The basic styles are in the `style.css` file. Copy those classes in your project.


## Required
* jQuery (tested on jQuery v3.1.1)
* [ScrollMagic](https://github.com/janpaepke/ScrollMagic) (tested on v2.0.5) for modifications on the quick nav when the user scrolls
* [ScrollTo](https://github.com/flesler/jquery.scrollTo) (tested on v2.1.2) for smooth scrolling
* [LoDash](https://lodash.com/) _.debounce


## Options (and default values)
Some options are configurable, others aren't. You can set them when you create your quick nav instance, like this :
```js
$(".jsQuicknav").fbquicknav({
    section_class: ".jsQuicknav__section",
    section_class_hide: ".jsQuicknav__hide",
    section_title: "data-quicknav-title",
    scroll_offset: -100,
    scroll_duration: 500,
    add_trigger: false
});
```

### section_class
Default: `.jsQuicknav__section`. This is the class name of the sections that will be added in the quicknav.

### section_class_hide
Default: `.jsQuicknav__hide`. When the quicknav reaches this section, it will hide automatically.

### section_title
Default: `data-quicknav-title`. Data attribute for the title of the section, displayed in the quick nav.

### scroll_offset
Default: `-100`. Offset of the scroll when we click on a quick nav link.

### scroll_duration
Default: `500`. Duration of the scroll, in ms.

### add_trigger
Default: `false`. Add a button to open and close the quicknav.

### calculate_heights
Default: `false`. Calculate each of the section heights, makes the 'active' classes match exactly the height of each section.

### Quicknav main title
You can set a main title for your quicknav with the attribute `data-quicknav-main-title` on the quicknav tag: `<div class="quicknav jsQuicknav" data-quicknav-main-title="Main title"></div>`.

### Quicknav main title show
The main title will show only on the sections that you decide. The sections that have the attribute `data-quicknav-main-title-show="1"` will add a `showTitleSection` class to your quicknav to show the main title.

### On dark background
The quicknav can be on a light or a dark background. You can set which sections that are dark with the attribute `data-quicknav-on-dark` on the section. This will add a `onDarkSection` when this section is reached.
