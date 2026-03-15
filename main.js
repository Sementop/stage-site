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

// --- МОНИТОРИНГ СЕРВЕРА (ИСПРАВЛЕННЫЙ) ---
async function updateServerStatus() {
    const ip = "188.127.241.74";
    const port = "3942";
    const onlineText = document.getElementById('stage-online');
    const progressBar = document.getElementById('stage-bar');

    try {
        // Используем прокси allorigins, чтобы обойти ошибку "Failed to fetch" на локалке
        const apiUrl = `https://api.samp-servers.net/v2/server/${ip}:${port}`;
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
        const json = await response.json();
        
        // allorigins возвращает данные в поле contents в виде строки, парсим её
        const data = JSON.parse(json.contents);

        if (data && data.online !== undefined) {
            const current = data.players;
            const max = data.maxplayers;
            const percent = (current / max) * 100;

            onlineText.innerText = `${current} / ${max}`;
            progressBar.style.width = `${percent}%`;
        } else {
            onlineText.innerText = "OFFLINE";
            progressBar.style.width = `0%`;
        }
    } catch (error) {
        console.log("Ошибка мониторинга, сервер возможно недоступен через API");
        onlineText.innerText = "OFFLINE";
        progressBar.style.width = `0%`;
    }
}

updateServerStatus();
setInterval(updateServerStatus, 30000);

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
