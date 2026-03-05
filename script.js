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

// Пауза (в px) для плавного перехода. Должна совпадать или коррелировать с --pause в CSS
const pauseAmount = 400;

lenis.on('scroll', (e) => {
    // Если меню открыто на весь экран по клику - не отслеживать скролл
    if (menu.classList.contains('is-expanded')) return;

    // Сворачивание начинается только после прокрутки первого экрана (hero)
    const thresholdStart = hero.offsetHeight;

    let progress = 0;
    if (e.scroll > thresholdStart) {
        progress = (e.scroll - thresholdStart) / pauseAmount;
        if (progress > 1) progress = 1;
    }

    // 1. Линейный прогресс для фиксации контента (transform: translateY)
    document.documentElement.style.setProperty('--scroll-p', progress);

    // 2. Быстрая кубическая кривая (быстро до 75%, потом до 90% и 100%) для размеров и движения
    let menuP = 1 - Math.pow(1 - progress, 5);
    document.documentElement.style.setProperty('--menu-p', menuP);

    // 3. Сверхбыстрая кривая (0 -> 1 за первые 5% скролла) для формирования квадрата и круга
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
