$(document).ready( () => {
    let lang = localStorage.getItem('language');
    if(window.innerWidth >= 768) {
        listScroll();
        $('.winners__wrapper').on('scroll', listScroll);
        function listScroll() {
            const contTop = $('.winners__wrapper').offset().top;
            const contBottom = $('.winners__wrapper').offset().top + $('.winners__wrapper').height();
            $('.winners__item').each(function () {
                let opacity,
                    itemTop,
                    itemBottom;
                itemTop = $(this).eq(0).offset().top;
                itemBottom = $(this).offset().top + $(this).height();
                if (itemBottom + 400 > contTop) {
                    opacity = (contBottom - itemBottom) * 0.015;
                }
                if (itemTop < contBottom - 400) {
                    opacity = (itemTop - contTop) * 0.015;
                }
                if (opacity < 0) {
                    opacity = 0;
                }
                if (opacity > 1) {
                    opacity = 1;
                }
                TweenMax.set($(this), {
                    opacity: opacity
                })
            });
        }
    }

    axios.get('https://lab73digital.github.io/GetRateVote/app/winners.json')
        .then(response => {
            const monthObj = response.data;
            monthObj.forEach(item =>{
                const month = item.month[lang];
                const winners = item.winner;
                $('.winners__wrapper').append(
                    `<div class="winners__monthWrap ${month}">
                        <p class="winners__month">${month}</p>
                    </div>`
                );
                winners.forEach(item => {
                    $(`.winners__monthWrap.${month}`).append(
                        `<a href="${item.link}" target="_blank">
                            <div class="winners__item">
                                <div class="winners__name">${item.name}</div>
                                <div class="winners__numb">${item.day}</div>
                                <div class="winners__numb winners__numb--rate">${item.rate}</div>
                            </div>
                        </a>`
                    )
                })
            });
        });
});
