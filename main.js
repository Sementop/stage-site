// --- КОНФИГ FIREBASE ---
const firebaseConfig = {
    databaseURL: "https://stagesite-2666a-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const downloadsRef = database.ref('total_downloads');

const downloadBtn = document.getElementById('downloadBtn');
const downloadDisplay = document.getElementById('download-count');

// Синхронизация счетчика скачиваний
downloadsRef.on('value', (snapshot) => {
    const count = snapshot.val();
    if (count !== null) {
        if (downloadDisplay) downloadDisplay.innerText = count.toLocaleString();
    } else {
        downloadsRef.set(0); 
    }
});

// Клик по кнопке скачивания
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

// --- МОНИТОРИНГ СЕРВЕРА (ВАРИАНТ 3) ---
async function updateServerStatus() {
    const ip = "188.127.241.74";
    const port = "3942";
    const onlineText = document.getElementById('stage-online');
    const progressBar = document.getElementById('stage-bar');

    if (!onlineText || !progressBar) return;

    try {
        // Пробуем альтернативный API, который часто лучше работает с мобильными хостами
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://api.samp-servers.net/v2/server/' + ip + ':' + port)}`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const json = await response.json();
        const data = JSON.parse(json.contents);

        if (data && data.online === true) {
            const current = parseInt(data.players) || 0;
            const max = parseInt(data.maxplayers) || 1000;
            const percent = (current / max) * 100;

            onlineText.innerText = `${current} / ${max}`;
            progressBar.style.width = `${percent}%`;
        } else {
            onlineText.innerText = "OFFLINE";
            progressBar.style.width = "0%";
        }
    } catch (error) {
        console.warn("Ошибка сетевого запроса. Возможно, блокировка на стороне браузера/сервера.");
        onlineText.innerText = "OFFLINE";
        progressBar.style.width = "0%";
    }
}

// Запускаем мониторинг
updateServerStatus();
// Опрашиваем раз в минуту, чтобы не словить бан по IP от прокси
setInterval(updateServerStatus, 60000);

// Плавная прокрутка
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

// Анимация появления блоков
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

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
});

window.addEventListener('scroll', revealOnScroll);

// Эффект шапки
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.8)';
    }
});
