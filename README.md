# fbquicknav.js
This plugin is to automatically create a quick nav to navigate in different sections in a web page.


## Usage
### JS init
`$(".js-quicknav").fbquicknav();`

### HTML
Add this in your HTML: `<div class="quicknav js-quicknav"></div>` (the `quicknav` class is for CSS styling, and the `js-quicknav` is to bind it to the JS).

Add the `js-quicknav-section` class on each section that you want in the quicknav.

### CSS
Ajouter les classes du fichier `style.css`. Ces styles donnent une base pour l'affichage.


## Required
* jQuery (tested on jQuery v3.1.1)
* [ScrollMagic](https://github.com/janpaepke/ScrollMagic) (tested on v2.0.5) for modifications on the quick nav when the user scrolls
* [ScrollTo](https://github.com/flesler/jquery.scrollTo) (tested on v2.1.2) for smooth scrolling


## Options (and default values)
Those options are configurable. You can set them when you create your quick nav instance, like this :
```js
$(".js-quicknav").fbquicknav({
    section_class: ".js-quicknav-section",
    section_class_hide: ".js-quicknav-hide",
    section_title: "data-quicknav-title",
    scroll_offset: -100,
    scroll_duration: 500,
    add_trigger: false
});
```

### section_class
Default: `.js-quicknav-section`. This is the class name of the sections that will be added in the quicknav.

### section_class_hide
Default: `.js-quicknav-hide`. When the quicknav reaches this section, hide it automatically.

### section_title
Default: `data-quicknav-title`. Data attribute for the title of the section, displayed in the quick nav.

### scroll_offset
Default: `-100`. Offset of the scroll when we click on a quick nav link.

### scroll_duration
Default: `500`. Duration of the scroll, in ms.

### add_trigger
Default: `false`. Add a button to open and close the quicknav.

