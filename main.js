// --- КОНФИГ FIREBASE ---
const firebaseConfig = {
    databaseURL: "https://stagesite-2666a-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const downloadsRef = database.ref('total_downloads');

const downloadBtn = document.getElementById('downloadBtn');
const downloadDisplay = document.getElementById('download-count');

// Синхронизация счетчика с базой данных
downloadsRef.on('value', (snapshot) => {
    const count = snapshot.val();
    if (count !== null) {
        if (downloadDisplay) downloadDisplay.innerText = count.toLocaleString();
    } else {
        downloadsRef.set(0); 
    }
});

// Клик по кнопке с защитой и КД 12 часов
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const lastDownload = localStorage.getItem('stage_last_download_time');
        const now = new Date().getTime(); 
        const twelveHours = 12 * 60 * 60 * 1000;

        if (!lastDownload || (now - lastDownload) > twelveHours) {
            downloadsRef.transaction((currentValue) => {
                return (currentValue || 0) + 1;
            });
            localStorage.setItem('stage_last_download_time', now);
        }
    });
}

// 1. Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// 2. Анимация появления блоков при скролле
const revealElements = document.querySelectorAll('.feature-card');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight / 5 * 4;
    revealElements.forEach(el => {
        const elTop = el.getBoundingClientRect().top;
        if (elTop < triggerBottom) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

// Начальные настройки карточек
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
});

// Запуск проверки сразу и при скролле
revealOnScroll();
window.addEventListener('scroll', revealOnScroll);

// 3. Эффект шапки (фикс прозрачности при прокрутке)
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.height = '70px'; // Немного сужаем при скролле для стиля
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.8)';
        header.style.height = '80px';
    }
});
