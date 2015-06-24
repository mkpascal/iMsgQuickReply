var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');

Settings.config(
    {url: 'https://www.mkpascal.net/iMsgQuickReply/'},
    function (e) {
        console.log('opening configurable');
    },
    function (e) {
        console.log('closed configurable');
        Settings.option('server_url', e.options[0]);
        Settings.option('password', e.options[1]);
    }
);

var replies = [{"title": "Yes"}, {"title": "No"}, {"title": "Maybe"}, {"title": "Wait"}];

var parseFeed = function (data) {
    var items = [];

    for (var t in data.contact) {
        items.push({
            title: t,
            subtitle: data.contact[t]
        });
    }

    return items;
};

var title_text = "Quick Reply";
var font_text = "GOTHIC_28";

var server_url = Settings.option('server_url');
var password = Settings.option('password');

if (typeof server_url === 'undefined') {
    var title_text = "Please configure the app";
    var font_text = "GOTHIC_14";
}

var splashWindow = new UI.Window();

var text = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 26),
    text: title_text,
    font: font_text,
    color: 'white',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'cobaltBlue'
});


splashWindow.bgRect = new UI.Rect({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    backgroundColor: 'cobaltBlue'
});

splashWindow.add(splashWindow.bgRect);
splashWindow.add(text);
splashWindow.show();

ajax(
    {
        url: server_url + '/pebble/contacts?password=' + password,
        type: 'json'
    },
    function (data) {
        var menuItems = parseFeed(data);
        var repliesItems = replies;

        var resultsMenu = new UI.Menu({
            sections: [{
                title: 'Contacts',
                items: menuItems,
                backgroundColor: 'cobaltBlue',
                textColor: 'white',
                highlightBackgroundColor: 'celeste',
                highlightTextColor: 'white'
            }]
        });

        resultsMenu.on('select', function (e) {

            var to = e.item.subtitle;

            var answersMenu = new UI.Menu({
                sections: [{
                    title: 'Reply with',
                    items: repliesItems,
                    backgroundColor: 'cobaltBlue',
                    textColor: 'white',
                    highlightBackgroundColor: 'celeste',
                    highlightTextColor: 'white'
                }]
            });

            answersMenu.show();

            answersMenu.on('select', function (e) {
                var message = e.item.title;
                ajax(
                    {
                        url: server_url + '/imsgbridge?to=' + to + '&message=' + message + '&password=' + password,
                        type: 'json'
                    });

                var sentCard = new UI.Card({
                    title: "Reply sent!",
                    subtitle: message,
                    body: to,
                    backgroundColor: 'cobaltBlue',
                    titleColor: 'white',
                    subtitleColor: 'electricBlue',
                    bodyColor: 'celeste',
                    scrollable: true
                });
                sentCard.show();

                setTimeout(function () {
                    answersMenu.hide();
                    sentCard.hide();
                }, 3000);
            });
        });

        resultsMenu.show();
        splashWindow.hide();
    }
);

