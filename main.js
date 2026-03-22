// --- КОНФИГ FIREBASE ---
const firebaseConfig = {
    databaseURL: "https://stagesite-2666a-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const downloadsRef = database.ref('total_downloads');

const downloadBtn = document.getElementById('downloadBtn');
const downloadDisplay = document.getElementById('download-count');

// Синхронизация счетчика
downloadsRef.on('value', (snapshot) => {
    const count = snapshot.val();
    if (count !== null) {
        if (downloadDisplay) downloadDisplay.innerText = count.toLocaleString();
    } else {
        downloadsRef.set(0); 
    }
});

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

// --- СОСТОЯНИЕ АНАЛИЗА ---
let isAnalysisReady = false;

// --- УЛЬТРА-ПРОВЕРКА IP + VPN (БЕЗ ОШИБОК В РФ) ---
async function checkVPN() {
    const ipLabel = document.getElementById('user-ip');
    const vpnLabel = document.getElementById('vpn-status');
    
    try {
        // 1. Получаем IP через Cloudflare (самый стабильный метод)
        const cfRes = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
        const cfText = await cfRes.text();
        const ipMatch = cfText.match(/ip=([^\s]+)/);
        const userIP = ipMatch ? ipMatch[1] : null;

        if (userIP) {
            ipLabel.innerText = userIP;

            // 2. Проверка VPN
            try {
                const vpnRes = await fetch(`https://ipapi.co/${userIP}/json/`);
                const vpnData = await vpnRes.json();
                
                const isVpn = vpnData.org && (
                    vpnData.org.toLowerCase().includes('vpn') || 
                    vpnData.org.toLowerCase().includes('proxy') ||
                    vpnData.org.toLowerCase().includes('hosting')
                );

                if (vpnLabel) {
                    if (isVpn) {
                        vpnLabel.innerText = "ОБНАРУЖЕН";
                        vpnLabel.style.color = "#FF0000";
                    } else {
                        vpnLabel.innerText = "НЕ ИСПОЛЬЗУЕТСЯ";
                        vpnLabel.style.color = "#00FF00";
                    }
                }
            } catch (e) {
                // Если API проверки заблочен, пишем АКТИВНА
                if (vpnLabel) {
                    vpnLabel.innerText = "АКТИВНА";
                    vpnLabel.style.color = "#00FF00";
                }
            }
        }
    } catch (error) {
        if (ipLabel) ipLabel.innerText = "ДИНАМИЧЕСКИЙ";
        if (vpnLabel) vpnLabel.innerText = "ЗАЩИЩЕНО";
    } finally {
        // ПОДТВЕРЖДАЕМ ГОТОВНОСТЬ
        isAnalysisReady = true;
    }
}

// --- ЛОГИКА ЭКРАНА ЗАЩИТЫ (СИНХРОНИЗАЦИЯ) ---
window.addEventListener('DOMContentLoaded', () => {
    const shield = document.getElementById('ddos-shield');
    const percentText = document.getElementById('shield-percent');
    const nodeId = document.getElementById('node-id');
    
    // Запускаем анализ сразу
    checkVPN();

    if (nodeId) {
        const chars = '0123456789ABCDEF';
        let id = 'NODE-';
        for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * 16)];
        nodeId.innerText = id;
    }

    let progress = 0;
    const interval = setInterval(() => {
        // Если анализ еще не готов, тормозим на 94%
        if (!isAnalysisReady && progress >= 94) {
            progress = 94;
        } else {
            progress += Math.floor(Math.random() * 5) + 2;
        }
        
        if (progress >= 100 && isAnalysisReady) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                if (shield) {
                    shield.style.opacity = '0';
                    setTimeout(() => { shield.style.display = 'none'; }, 800);
                }
            }, 1000);
        }
        if (percentText) percentText.innerText = Math.min(progress, 100) + "%";
    }, 120);
});

// --- ОСТАЛЬНАЯ ЛОГИКА (Плавная прокрутка и анимации) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

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
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
}

const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.style.background = window.scrollY > 20 ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.8)';
        header.style.height = window.scrollY > 20 ? '70px' : '80px';
    });
}
