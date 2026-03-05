const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const menu = document.getElementById('menu');
const hero = document.getElementById('hero');
const btnBack = document.getElementById('btnBack');

// Задержка и дистанция трансформации должны соответствовать CSS переменным (--sticky-delay и --transform-dist)
const stickyDelay = 400; // px
const transformDist = 500; // px

lenis.on('scroll', (e) => {
    // Если меню открыто на весь экран по клику - не отслеживать скролл
    if (menu.classList.contains('is-expanded')) return;

    const thresholdStart = hero.offsetHeight;

    let totalScrollP = 0;
    let progress = 0; // Трансформация самого меню

    if (e.scroll > thresholdStart) {
        let scrolled = e.scroll - thresholdStart;

        // 1. Отвечает за удержание белого контента на месте (все время stickyDelay + transformDist)
        totalScrollP = Math.min(scrolled / (stickyDelay + transformDist), 1);

        // 2. Трансформация меню начинается только ПОСЛЕ преодоления stickyDelay
        if (scrolled > stickyDelay) {
            progress = Math.min((scrolled - stickyDelay) / transformDist, 1);
        }
    }

    // Линейный прогресс для фиксации контента (transform: translateY)
    document.documentElement.style.setProperty('--total-scroll-p', totalScrollP);

    // Быстрая кубическая кривая (быстро до 75%, потом до 90% и 100%) для размеров и движения
    let menuP = 1 - Math.pow(1 - progress, 5);
    document.documentElement.style.setProperty('--menu-p', menuP);

    // Сверхбыстрая кривая (0 -> 1 за первые 5% скролла трансформации) для формирования квадрата и круга
    let roundP = Math.min(progress * 20, 1);
    document.documentElement.style.setProperty('--round-p', roundP);

    // Добавляем класс-флаг, когда трансформация завершена
    if (progress === 1) {
        menu.classList.add('is-fab');
    } else {
        menu.classList.remove('is-fab');
    }
});

// Клик по свернутой кнопке (FAB)
menu.addEventListener('click', (e) => {
    if (menu.classList.contains('is-fab')) {
        menu.classList.remove('is-fab');
        menu.classList.add('has-transition'); // Включаем CSS-анимацию

        requestAnimationFrame(() => {
            menu.classList.add('is-expanded');
            lenis.stop(); // Останавливаем скролл, пока открыто меню
        });
    }
});

// Клик по кнопке "Назад/Закрыть" внутри открытого меню
btnBack.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.remove('is-expanded');
    lenis.start();

    // Отключаем плавную анимацию после ее завершения, чтобы скрол снова работал мгновенно
    setTimeout(() => {
        menu.classList.remove('has-transition');
    }, 400); // 400ms = время transition в CSS
});
