let userData = JSON.parse(localStorage.getItem('userData'));
if(!userData) window.location.href = 'index.html';
$(document).ready(() => {
    let day;
    let month;
    let monthNumb;
    let userMonth;
    let year;
    let userYear;
    let rate;
    let clickedEl;
    let openedMenu = false;
    let openedPopUp = false;
    let LSLang = localStorage.getItem('language');
    let ruSheph1 = 'Подтверди предсказание';
    let uaSheph1 = 'Підтверди прогноз';
    let ruSheph2 = 'Посмотри на предсказания <br> других участников';
    let uaSheph2 = 'Подивись на прогнози <br> інших гравців';
    let ruSheph3 = 'Теперь выбери дату для ставки';
    let uaSheph3 = 'Тепер обери дату для ставки';
    let closeRu = 'Закрыть';
    let closeUa = 'Закрити';
    let nextRu = 'Дальше';
    let nextUa = 'Далі';
    const $calendar = $('#calendar');
    const $body = $('body');
    const $predict__popUp = $('.predict__popUp');
    const $predict__input = $('.predict__input');
    const $predict__btn = $('.predict__btn');
    const BASE_URL = 'https://dekurs.com.ua';
    const uaShareImg = window.location.origin + '/quiz/img/gr-share-ua.png?1';
    const ruShareImg = window.location.origin + '/quiz/img/gr-share-ru.png?1';
    let shareImg = LSLang === 'ru' ? ruShareImg : uaShareImg;

    $predict__input.mask('00.00');

    $predict__input.on('keyup', () => {
        if ($predict__input.val().length == 2) {
            $predict__input.val($predict__input.val() + '.');
        }
        if (($predict__input.val()).length === 5) {
            $predict__input.blur()
        }
        if ((!localStorage.getItem('shepherdOnCalendarPopUpShown') && window.innerWidth >= 1024 && ($predict__input.val()).length === 5)) {
            $predict__input.blur();
            setTimeout(() => shepherdTour.f1(), 1000);
            localStorage.setItem('shepherdOnCalendarPopUpShown', 'true');
        }
        checkInputLength();
        $predict__btn.attr('disabled', false);
    });

    $(window).on('keyup', (e) => {
        if (e.keyCode === 8 && $predict__input.is(':visible')) {
            let str = $predict__input.val();
            str = str.substring(0, str.length - 1);
            $predict__input.val(str);
            $predict__input.focus();
        }
        checkInputLength();
    });
    $predict__btn.on('click', () => {
        rate = $predict__input.val();
        submitAndShare(rate, day, monthNumb, year);
    });

    //close popUp when clicked outside the div
    $(document).on("mouseup", (e) => {
        if ($('.predict__popUp').is(':visible') && $body.is(e.target)) {
            closePopUp();
            $body.removeClass('body-blurred');
        }
        else if (openedMenu && $body.is(e.target)) {
            closeMenu();
        }
    });

    function disableBtn() {
        $predict__btn.attr('disabled', true);
    }

    function closePopUp() {
        $predict__popUp.removeClass('visible').addClass('invisible');
        openedPopUp = false;
    }

    function showPopUp() {
        openedPopUp = true;
        $predict__popUp.removeClass('invisible').addClass('visible');
        $predict__input.val('');
        disableBtn();
    }

    function runCalendar() {
        let date = new Date();
        let today = date.getDate();
        let thisMonth = date.getMonth() + 1;
        let thisYear = date.getFullYear();
        let cal = $calendar.calendario({
                onDayClick: function ($el, $contentEl, dateProperties) {
                    let pickedYear = Number(dateProperties.year);
                    let pickedDay = Number(dateProperties.day);
                    let pickedMonth = Number(dateProperties.month);
                    clickedEl = $el;
                    if ((today === pickedDay) && (thisMonth >= pickedMonth) ||
                        (today > pickedDay) && (thisMonth >= pickedMonth) && ( thisYear >= pickedYear) ||
                        (today < pickedDay) && (thisMonth > pickedMonth) && ( thisYear >= pickedYear)
                    ) {
                        return
                    }
                    else {
                        $body.addClass('body-blurred');
                        showPopUp();
                    }
                    for (var key in dateProperties) {
                        // console.log(key + ' = ' + dateProperties[key]);
                        day = dateProperties.day;
                        month = dateProperties.monthname.replace(/ь/g, 'я');
                        monthNumb = dateProperties.month;
                        year = dateProperties.year;
                    }
                    if (LSLang === 'ua' && dateProperties.monthname.endsWith("ень")){
                        month = dateProperties.monthname.replace(/ень/g, 'ня');
                    }
                    else if (LSLang === 'ua' && dateProperties.monthname.endsWith("пад")) {
                        month = dateProperties.monthname.replace(/пад/g, 'пада');
                    }
                    else if (LSLang === 'ua' && dateProperties.monthname.endsWith("ий")) {
                        month = dateProperties.monthname.replace(/ий/g, 'ого');
                    }
                }
            }),
            $month = $('#custom-month').html(cal.getMonthName()),
            $year = $('#custom-year').html(cal.getYear());

        function trackUserYear() {
            userYear = cal.year;
            userMonth = cal.month + 1;

            if (userData.calendar[userYear] && userData.calendar[userYear][userMonth]) {
                const dayKeys = Object.keys(userData.calendar[userYear][userMonth]);
                dayKeys.forEach(day => {
                    const rate = userData.calendar[userYear][userMonth][day].rate;
                    const $el = $($('.fc-body .fc-row').find($('.fc-date'))).eq(day - 1);
                    const renderedDay = $el.html();
                    $el.parent().append(
                        `<div class="predicted">
                            <div class="predicted__wrapper">
                                <div class="predicted__day">${renderedDay}</div>
                                <div class="predicted__dataWrapper">
                                    <div class="predicted__text">Ваша ставка</div>
                                    <div class="predicted__rate">${rate}</div>
                                </div>  
                            </div>       
                        </div>`);
                });
            }
        }
        $('#custom-next').on('click', function () {
            cal.gotoNextMonth(updateMonthYear);
            styleCalendarDay();
            trackUserYear();
        });
        $('#custom-prev').on('click', function () {
            cal.gotoPreviousMonth(updateMonthYear);
            styleCalendarDay();
            trackUserYear();
        });

        function updateMonthYear() {
            $month.html(cal.getMonthName());
            $year.html(cal.getYear());
        }
        function styleCalendarDay(){
            if (cal.getMonth() > thisMonth) {
                paintBg($('.fc-row div:parent'));
            }
            if (cal.getMonth() === thisMonth) {
                checkDayToPick()
            }
            if (cal.getYear() < thisYear) {
                $('.fc-body div').find('div:parent').css('cursor', 'default');
                $('.fc-row div:parent').css('pointer-events', 'none');
            }
            if (cal.getYear() > thisYear) {
                $('.fc-body div').find('div:parent').css('cursor', 'default');
                $('.fc-row div:parent').css('pointer-events', 'auto');
            }
            if ((cal.getYear() > thisYear) && (cal.getMonth() > thisMonth) || ((cal.getYear() > thisYear) && (cal.getMonth() < thisMonth)) ) {
                paintBg($('.fc-row div:parent'));
            }
        }
        trackUserYear();
    }

    //add data to calendar day with prediction
    function submitAndShare(rate, day, monthNumb, year) {
        closePopUp();
        $body.removeClass('body-blurred');
        let ruTitle = `Я думаю, что ${day} ${month} курс доллара будет ${rate}. А вы? Проверим на Dekurs!`;
        let uaTitle = `Я думаю, що ${day} ${month} курс долара буде ${rate}. А ви? Перевіримо на Dekurs!`;
        let title = LSLang === 'ru' ? ruTitle : uaTitle;
        userData = JSON.parse(localStorage.getItem('userData'));
        if (userData.calendar[year]) {
            if (userData.calendar[year][monthNumb]) {
                userData.calendar[year][monthNumb][day] = {
                    rate
                }
            } else {
                userData.calendar[year][monthNumb] = {
                    [day]: {
                        rate
                    }
                }
            }
        } else {
            userData.calendar[year] = {
                [monthNumb]: {
                    [day]: {
                        rate
                    }
                }
            }
        }

        shareOverrideOGMeta(`${BASE_URL}/quiz`, title, shareImg);

        function shareOverrideOGMeta(overrideLink, overrideTitle, overrideImage) {
            FB.ui({
                    method: 'share',
                    display: 'popup',
                    href: `${BASE_URL}/quiz/share?type=website&site_name=Dekurs&title=${title}&locale=ru_RU&image=${shareImg}&image_type=image/png&image_width=1200&image_height=630&redirect=${BASE_URL}/quiz`,
                },
                function (response) {
                    console.log(response);
                    if (response){
                        localStorage.setItem('userData', JSON.stringify(userData));
                        axios.put(`${BASE_URL}/api/users/profile`, {
                            calendar: userData.calendar,
                        }, {
                            headers: {
                                'Authorization': `Bearer ${userData.accessToken}`
                            }
                        })
                            .then(function ({data}) {
                                if (data) {
                                    // console.log(data);
                                }
                            })
                            .catch(console.log);
                        $(clickedEl).find('.predicted').remove();
                        $(clickedEl).append(
                            `<div class="predicted">
                                <div class="predicted__wrapper">
                                    <div class="predicted__day">${day}</div>
                                    <div class="predicted__dataWrapper">
                                        <div class="predicted__text">Ваша ставка</div>
                                        <div class="predicted__rate">${rate}</div>
                                    </div>  
                                </div>       
                            </div>`);
                    }
                });
        }
    }

    function paintBg(element) {
        const $divBg = element;
        $divBg.css('cursor', 'pointer');
        $divBg.on('mouseover', function () {
        });
        $divBg.on('mouseleave', function () {
            // $(this).css('background', 'inherit')
        });
    }

    function checkDayToPick() {
        paintBg($('.fc-today').nextAll('div:parent'));
        paintBg($('.fc-today').closest('.fc-row').nextAll('.fc-row').find('div:parent'));
    }

    function checkInputLength() {
        if ($predict__input.val() === '' || ($predict__input.val()).length !== 5) {
            disableBtn();
            return;
        }
    }


    const shepherdTour = {
        initShepherd: () => new Shepherd.Tour({
            defaults: {
                showCancelLink: true
            }
        }),
        f1: () => {
            const shepherd = shepherdTour.initShepherd();
            shepherd.addStep('welcome', {
                title: '03<span class="slim">/03</span>',
                text: () => {
                    return LSLang === 'ru' ? ruSheph1 : uaSheph1;
                },
                attachTo: '.predict__btn right',
                classes: 'shepherd shepherd-transparent-text',
                buttons: [
                    {
                        action: shepherd.next,
                        classes: 'shepherd-button-example-primary',
                        text: LSLang === 'ru' ? closeRu : closeUa
                    }
                ]
            });
            shepherd.start();
        },
        f2: () => {
            const shepherd = shepherdTour.initShepherd();
            shepherd.addStep('welcome', {
                title: '01<span class="slim">/03</span>',
                text: () => {
                    return LSLang === 'ru' ? ruSheph2 : uaSheph2;
                },
                attachTo: '.calendar__wrapper .btn right',
                classes: 'shepherd shepherd-transparent-text',
                buttons: [
                    {
                        action: shepherd.next,
                        classes: 'shepherd-button-example-primary',
                        text: LSLang === 'ru' ? nextRu : nextUa
                    }
                ]
            });
            shepherd.addStep('welcome', {
                title: '02<span class="slim">/03</span>',
                text: () => {
                    return LSLang === 'ru' ? ruSheph3 : uaSheph3;
                },
                attachTo: '.fc-body right',
                classes: 'shepherd shepherd-transparent-text',
                buttons: [
                    {
                        action: shepherd.back,
                        classes: 'shepherd-button-example-primary',
                        text: 'Назад'
                    },
                    {
                        action: shepherd.cancel,
                        classes: 'shepherd-button-example-primary',
                        text: LSLang === 'ru' ? closeRu : closeUa
                    }
                ]
            });
            shepherd.start();
        }
    };
    if ((!localStorage.getItem('shepherdOnCalendarShown') && (window.innerWidth >= 1024))) {
        setTimeout(() => shepherdTour.f2(), 100);
        localStorage.setItem('shepherdOnCalendarShown', 'true');
    }

    runCalendar();
    checkDayToPick();


});