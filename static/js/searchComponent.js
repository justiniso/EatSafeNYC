
jQuery(document).ready(function () {
    var searchContainer = jQuery('[data-render-search]')[0];
    
    // Set global search object for debugging
    searchObject = React.createElement(Search, null);
    React.render(
        searchObject,
        searchContainer
    );
});