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

// --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ПРОВЕРКИ VPN И IP ---
async function checkVPN() {
    const ipLabel = document.getElementById('user-ip');
    const vpnLabel = document.getElementById('vpn-status');
    
    try {
        // Используем надежный API с поддержкой HTTPS и глубоким анализом security
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        
        if (ipLabel) ipLabel.innerText = data.ip || "СКРЫТ";
        
        if (vpnLabel) {
            // Проверяем vpn, proxy и tor одновременно через объект security
            const isProxy = data.security && (data.security.proxy || data.security.vpn || data.security.tor);
            
            if (isProxy) {
                vpnLabel.innerText = "ОБНАРУЖЕН";
                vpnLabel.className = "status-warn";
                vpnLabel.style.color = "#FF0000"; // Принудительно красный
            } else {
                vpnLabel.innerText = "НЕ ИСПОЛЬЗУЕТСЯ";
                vpnLabel.className = "status-safe";
                vpnLabel.style.color = "#00FF00"; // Принудительно зеленый
            }
        }
    } catch (error) {
        console.error("VPN Check Error:", error);
        if (ipLabel) ipLabel.innerText = "ERROR";
        if (vpnLabel) vpnLabel.innerText = "СБОЙ СЕТИ";
    }
}

// --- ЛОГИКА ЭКРАНА ЗАЩИТЫ (STAGE PROTECTION) ---
window.addEventListener('DOMContentLoaded', () => {
    const shield = document.getElementById('ddos-shield');
    const percentText = document.getElementById('shield-percent');
    const nodeId = document.getElementById('node-id');
    
    // Запускаем проверку VPN сразу
    checkVPN();

    // Генерация случайного ID узла
    if (nodeId) {
        const chars = '0123456789ABCDEF';
        let id = 'NODE-';
        for (let i = 0; i < 8; i++) {
            id += chars[Math.floor(Math.random() * 16)];
        }
        nodeId.innerText = id;
    }

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 3; 
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                if (shield) {
                    shield.style.opacity = '0';
                    setTimeout(() => {
                        shield.style.display = 'none';
                    }, 800);
                }
            }, 1200); // Даем игроку время увидеть статус IP и VPN
        }
        
        if (percentText) percentText.innerText = progress + "%";
    }, 150);
});

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
if (revealElements.length > 0) {
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
    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);
}

// 3. Эффект шапки
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
            header.style.height = '70px'; 
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.8)';
            header.style.height = '80px';
        }
    });
}
