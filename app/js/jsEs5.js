'use strict';

window.fbAsyncInit = function () {
    FB.init({
        appId: 2160146270936955,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v3.1'
    });
    FB.AppEvents.logPageView();
    FB.getLoginStatus();
};
(function (d, s, id) {
    var js,
        fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');
var userName;
$(document).ready(function () {
    var openedMenu = false;
    var language = localStorage.getItem('language') || 'ru';
    var authorLang = localStorage.getItem('language') === 'ru' ? 'вы успешно авторизировались' : 'ви успішно авторизувались';
    var $headerMemu = $('.header__menu');
    var $headerMemuWrapper = $('.header__menuWrapper');
    var $html = $('html');
    var $body = $('body');
    var $menu = $('.menu');
    var BASE_URL = 'https://dekurs.com.ua';

    function statusChangeCallback(response) {
        if (response.status !== 'connected') {
            FB.login(function (response) {
                if (response.status === 'connected') facebookLogin(response);
            }, { scope: 'public_profile, email, user_link' });
        } else {
            facebookLogin(response);
        }
    }

    function facebookLogin(response) {
        if (!response && !response.authResponse && !response.authResponse.accessToken) return;
        axios.post(BASE_URL + '/api/auth/facebook', {
            access_token: response.authResponse.accessToken
        }).then(function (_ref) {
            var data = _ref.data;

            if (data) {
                var userData = {
                    'accessToken': data.token.accessToken,
                    'refreshToken': data.token.refreshToken,
                    'id': data.user.id,
                    'name': data.user.firstname + ' ' + data.user.lastname,
                    'email': data.user.email,
                    'calendar': data.user.calendar ? data.user.calendar : {},
                    'expiresData': data.token.expiresIn
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                ifUserLoggedIn(userData);
            }
            window.location.href = "gift.html";
        }).catch(console.log);
    }
    function ifWeHaveLS() {
        var getUserData = localStorage.getItem('userData');
        if (getUserData && !ifExpDate()) {
            ifUserLoggedIn(JSON.parse(getUserData));
            var lang = localStorage.getItem('language') === 'ru' ? 'Сделать ставку' : 'Зробити ставку';
            $('.logIn').removeClass('logIn').html('' + lang).attr('href', 'calendar.html');
            return true;
        }
    }

    function ifExpDate() {
        var userData = JSON.parse(localStorage.getItem('userData'));
        var tokenExpireData = userData.expiresData;
        return new Date(tokenExpireData) < new Date();
    }
    function ifUserLoggedIn(_ref2) {
        var name = _ref2.name;

        userName = name;
        $('.user__name').html(name + ', <br> ' + authorLang);
        $('.logOut').removeClass('invisible');
    }

    $('.logIn').on('click', function (e) {
        e.preventDefault();
        if (ifWeHaveLS()) {
            return window.location.href = "calendar.html";
        } else {
            FB.getLoginStatus(function (response) {
                statusChangeCallback(response);
            });
        }
    });

    $('.logOut').on('click', function () {
        closeMenu();
        FB.getLoginStatus(function (response) {
            window.location.href = "index.html";
            localStorage.clear();
            if (response.status === 'connected') {
                FB.logout(function (response) {});
            }
        });
    });

    //close popUp when clicked outside the div
    $(document).on("mouseup", function (e) {
        if (openedMenu && $body.is(e.target)) {
            closeMenu();
        }
    });

    $headerMemuWrapper.on('mousedown', function () {
        TweenMax.to($headerMemu, 0.3, { 'scale': 0.8 });
        $headerMemuWrapper.on('mouseup', function () {
            openMenu();
        });
        if ($headerMemu.is('.opened')) {
            $headerMemu.on('mousedown', function () {
                TweenMax.to($headerMemu, 0.3, { 'scale': 0.8 });
            });
            $headerMemuWrapper.on('mouseup', function () {
                closeMenu();
            });
        }
    });
    $headerMemu.on('mouseleave', function () {
        TweenMax.to($headerMemu, 0.3, { 'scale': 1 });
    });

    function openMenu() {
        if (!openedMenu) {
            openedMenu = true;
            $headerMemu.addClass('opened');
            $body.addClass('body-blurred');
            TweenMax.to($menu, 0.5, { x: 0, autoAlpha: 1 });
            $('html').css('overflow', 'hidden');
        }
    }

    function closeMenu() {
        $headerMemu.removeClass('opened');
        $body.removeClass('body-blurred');
        openedMenu = false;
        TweenMax.to($menu, 0.1, { x: 150, autoAlpha: 0 });
        TweenMax.to($headerMemu, 0.1, { 'scale': 1 });
        $('html').css('overflow', 'auto');
    }

    $('.lang__switch a').on('click', function () {
        $('.lang__switch a').removeClass('langActive');
        $(this).addClass('langActive');
    });

    if (localStorage.getItem('language') === null) {
        localStorage.setItem('language', 'ru');
    }

    var i18n = domI18n({
        selector: '[data-translatable]',
        separator: ' // ',
        languages: ['ru', 'ua'],
        defaultLanguage: 'ru',
        currentLanguage: '' + language
    });

    $('.lang__switch a').each(function (ind, elem) {
        if (localStorage.getItem('language') === 'ru') {
            $('.ru').addClass('langActive');
        }
        $(elem).on('click', function () {
            $(elem).removeClass('langActive');
            $(this).addClass('langActive');
            var lang = $(this).attr('class').substr(0, 2);
            localStorage.setItem('language', '' + lang);
            $html.css('overflow', 'hidden');
            $body.addClass('readyState');
            location.reload();
        });
    });

    (function () {
        $('.lang__switch a').each(function (ind, elem) {
            var lang = $(this).attr('class').substr(0, 2);
            if (lang === language) {
                $(this).addClass('langActive');
            }
        });
    })();

    ifWeHaveLS();

    $html.css('overflow', 'auto');
    $body.removeClass('readyState');
});