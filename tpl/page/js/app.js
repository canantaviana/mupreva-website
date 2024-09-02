/*global tstring, page_globals, SHOW_DEBUG, item_list_row, common, page, forms, document, DocumentFragment, tstring, console */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */

/**
* This file only collect another files and generates a new one called app-min.js
* (!) You need to maintain opened Codekit to work
*/

// web_app common files
// @codekit-append "../../../web_app/common/js/common.js";

// factory files
// @codekit-append "../../../web_app/factory/form_factory.js
// @codekit-append "../../../web_app/factory/list_factory.js
// @codekit-append "../../../web_app/factory/map_factory.js
// @codekit-append "../../../web_app/factory/tree_factory.js
// @codekit-append "../../../web_app/factory/timeline_factory.js

// app_utils. Note that we include here the MINIFIED version (!)
// @codekit-append "app_utils-min.js";

// page files
// @codekit-append "page.js";
// @codekit-append "render_page.js";
// @codekit-append "data.js";
// @codekit-append "data_export.js";
// @codekit-append "video_player.js";
