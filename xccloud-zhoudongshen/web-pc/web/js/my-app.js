// Initialize your app
AppFramework = new Framework7();
// Export selectors engine
var $$ = Dom7;

function changepage(_page) {
    AppFramework.showIndicator();
    $f("plugin", _page, 0);
}

$(function() {

    //$f("plugin.startTest",'home');
    homeView = AppFramework.addView(".view-home");
    chatView = AppFramework.addView(".view-chats");
    personView = AppFramework.addView(".view-person");

    $f("plugin", "home", 0);
});
