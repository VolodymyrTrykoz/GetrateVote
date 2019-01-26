$(document).ready(() => {
    let popUpLang = localStorage.getItem('language') === 'ru' ? 'Реальный курс' : 'Реальний курс';
    let closeRu = 'Закрыть';
    let closeUa = 'Закрити';
    let nextRu = 'Дальше';
    let nextUa = 'Далі';
    let ruSheph1 = 'Среднее предсказание участников';
    let uaSheph1 = 'Середній прогноз учасників';
    let ruSheph2 = 'Нажми, чтобы сделать ставку';
    let uaSheph2 = 'Натисни, щоб зробити ставку';
    let LSLang = localStorage.getItem('language');

    function runChart({averageCourses, averageRates}) {
        let year = new Date().getFullYear();
        let date = new Date().getDate() - 5;
        let today = new Date().getDate();
        let month = new Date().getMonth();
        let fz = window.innerWidth > 756 ? 16 : 12;
        let offTop = window.innerWidth > 756 ? 30 : 20;
        Highcharts.chart('charts', {
            chart: {
                type: 'spline',
                backgroundColor: 'transparent',
            },
            title: {
                text: 'USD',
                enabled: true,
                verticalAlign: 'bottom',
                align: 'left',
                x: 31,
                y: -42,
                style: {
                    color: 'rgba(247,247,247,1)',
                    fontSize: `${fz}px`,
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            xAxis: {
                plotLines: [{
                    color: '#fff',
                    width: 1,
                    value: Date.UTC(year, month, today),
                }],
                title: {
                    text: 'Дата',
                    color: 'rgba(247,247,247,1)',
                    align: 'high',
                    x: 0,
                    y: -`${offTop}`,
                    style: {
                        color: 'rgba(247,247,247,1)',
                        fontSize: `${fz}px`,
                    },
                },
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%e.%m'
                },
                labels: {
                    style: {
                        color: "rgba(247,247,247,0.5)",
                        fontSize: `${fz}px`,
                    },
                },
                lineColor: '#72ddfd',
                tickWidth: 0,
                showFirstLabel: false,
                showLastLabel: false,
            },
            yAxis: {
                title: {
                    text: 'Курс',
                    align: 'high',
                    rotation: '0',
                    y: 5,
                    x: 35,
                    style: {
                        color: 'rgba(247,247,247,1)',
                        fontSize: `${fz}px`,
                    }
                },
                labels: {
                    style: {
                        color: "rgba(247,247,247,0.5)",
                        fontSize: `${fz}px`,
                    },
                },
                gridLineWidth: '',
                lineColor: '#72ddfd',
                lineWidth: 1,
                showFirstLabel: false,
                showLastLabel: false,
                allowDecimals: false,
            },
            tooltip: {
                xDateFormat: '%d-%m-%Y'
            },
            series: [{
                name: `${popUpLang}`,
                lineWidth: 2,
                color: {
                    linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
                    stops: [
                        [0, '#F444BC'],
                        [1, '#AA137C']
                    ]
                },
                marker: {
                    symbol: 'circle',
                    radius: 0,
                    states: {
                        hover: {
                            enabled: true,
                            fillColor: '#FFFFFF',
                            radius: 6,
                            lineColor: '#F444BC',
                            lineWidth: 4
                        }
                    },
                },
                data: averageCourses,
            }, {
                name: 'Прогноз',
                lineWidth: 5,
                color: {
                    linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
                    stops: [
                        [0, '#2de2f7'],
                        [1, '#047ced']
                    ]
                },
                marker: {
                    symbol: 'circle',
                    radius: 0,
                    states: {
                        hover: {
                            enabled: true,
                            fillColor: '#FFFFFF',
                            radius: 6,
                            lineColor: '#72ddfd',
                            lineWidth: 4
                        }
                    },
                },
                data: averageRates,
            }],
        });
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
                title: '01<span class="slim">/02</span>',
                text: () => {
                    return LSLang === 'ru' ? ruSheph1 : uaSheph1;
                },
                attachTo: '.charts__table',
                classes: 'position',
                buttons: [
                    {
                        action: shepherd.next,
                        classes: 'shepherd-button-example-primary',
                        text: LSLang === 'ru' ? nextRu : nextUa
                    }
                ]
            });
            shepherd.addStep('welcome', {
                title: '02<span class="slim">/02</span>',
                text: () => {
                    return LSLang === 'ru' ? ruSheph2 : uaSheph2;
                },
                attachTo: '.charts__heading .btn bottom',
                classes: 'shepherd shepherd-transparent-text',
                buttons: [
                    {
                        action: shepherd.back,
                        classes: 'shepherd-button-example-primary',
                        text: 'Назад'
                    },
                    {
                        action: shepherd.next,
                        classes: 'shepherd-button-example-primary',
                        text: LSLang === 'ru' ? closeRu : closeUa
                    }
                ]
            });
            shepherd.start();
        },
    };

    if ((!localStorage.getItem('shepherdOnChartsShown') && window.innerWidth >= 1024)) {
        shepherdTour.f1();
        localStorage.setItem('shepherdOnChartsShown', 'true');

    }


    if (localStorage.getItem('language') === 'ua') {
        $('.shepherd-element[x-placement^=top] .popper__arrow').css('left', '144px');
    }



    axios.get('https://dekurs.com.ua/api/averageCourses?city=kyiv')
        .then(resp => {
            let dates = {};
            let usd = resp.data[0].currencies.history.usd;
            let sArr = usd.filter(item => {
                let fullDay = new Date(item.createdAt);
                let firstDate = moment().set({hour: 0, minute: 0, second: 0}).subtract(5, 'days').toDate();
                return fullDay > firstDate
            });
            sArr.forEach(item => {
                let date = new Date(item.createdAt);
                let day = ('0' + date.getDate()).slice(-2);
                let month = ('0' + date.getMonth()).slice(-2);
                let year = date.getFullYear();
                if (dates[`${year}${month}${day}`]) {
                    if (dates[`${year}${month}${day}`][0].date < date) {
                        dates[`${year}${month}${day}`] = [];
                        dates[`${year}${month}${day}`].push({date, rate: item.sell});
                    }
                } else {
                    dates[`${year}${month}${day}`] = [];
                    dates[`${year}${month}${day}`].push({date, rate: item.sell});
                }
            });
            let averageCourse = [];
            for (let key in dates) {
                if (dates.hasOwnProperty(key)) {
                    let year = key.slice(0, 4);
                    let month = key.slice(-4, -2);
                    let day = key.slice(-2);
                    averageCourse.push([Date.UTC(+year, +month, +day), dates[key][0].rate])
                }
            }
            return averageCourse;
        })
        .then(async averageCourses => {
            let {data} = await axios.get('https://dekurs.com.ua/api/users/averageRates');
            return {averageCourses, averageRates: data.result}
        })
        .then(res => {
            runChart(res);
        });
});