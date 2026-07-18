// ================================================================= 
// 1. DATA FEEDS & CORE ENGINE (CLEAN ORIGINAL APP.JS STRUCTURE)     
// ================================================================= 

let casinoData = [];
let filteredData = [];
let userCountry = "CY"; // ברירת מחדל נקייה מראש לקפריסין (אירופה) במקום ישראל!

const fallbackCasinoData = [
    {
        casino_name: "Vulkan Vegas",
        bonus_text: "100% Up to €1,500 + 150 Free Spins",
        rtp_score: "96.82%",
        affiliate_link: "https://vpartners.link",
        regulatory_text: "18+. New EU players only. Min deposit €10. Wagering 40x. T&Cs apply.",
        allowed_countries: ["DE", "NL", "FI", "IE"]
    },
    {
        casino_name: "Ice Casino",
        bonus_text: "€1,500 Welcome Pack + 270 Free Spins",
        rtp_score: "96.45%",
        affiliate_link: "https://vpartners.link",
        regulatory_text: "18+. T&Cs apply. Play responsibly. BeGambleAware.org",
        allowed_countries: ["DE", "NL", "FI", "CY"]
    },
    {
        casino_name: "Bet365 Casino",
        bonus_text: "Stake £10 and get 50 Free Spins",
        rtp_score: "97.15%",
        affiliate_link: "https://bet365.link",
        regulatory_text: "18+. New UK players only. Min £10 deposit. 50 Free Spins. T&Cs apply.",
        allowed_countries: ["UK", "GB", "IE"]
    },
    {
        casino_name: "William Hill Casino",
        bonus_text: "£30 Free Bets for New UK Customers",
        rtp_score: "96.70%",
        affiliate_link: "https://williamhill.link",
        regulatory_text: "18+. UK & IE players only. New customers. T&Cs apply.",
        allowed_countries: ["UK", "GB"]
    },
    {
        casino_name: "LeoVegas Casino",
        bonus_text: "€100 + 100 Free Spins Welcome Pack",
        rtp_score: "96.90%",
        affiliate_link: "https://leovegas.link",
        regulatory_text: "18+. UK & EU players only. Min deposit €10. T&Cs apply.",
        allowed_countries: ["UK", "IE", "SE", "NO"]
    },
    {
        casino_name: "PlayOJO Casino",
        bonus_text: "50 Free Spins with No Wagering",
        rtp_score: "96.60%",
        affiliate_link: "https://playojo.link",
        regulatory_text: "18+. Available in CY, IE, and select EU markets only. T&Cs apply.",
        allowed_countries: ["CY", "IE", "UK"]
    },
    {
        casino_name: "Casumo Casino",
        bonus_text: "€200 + 20 Free Spins",
        rtp_score: "96.70%",
        affiliate_link: "https://casumo.link",
        regulatory_text: "18+. Cyprus & EU players only. Min deposit €10. T&Cs apply.",
        allowed_countries: ["CY", "FI", "SE", "NO"]
    }
];

// 2. מנגנון אימות גיל (18+) והפעלה ראשונית של האתר
document.addEventListener("DOMContentLoaded", () => {
    const ageGate = document.getElementById("age-gate");
    const ageAccept = document.getElementById("age-accept");
    const ageReject = document.getElementById("age-reject");

    if (localStorage.getItem("age_verified") === "true") {
        if (ageGate) ageGate.style.display = "none";
    } else {
        if (ageGate) ageGate.style.display = "flex";
    }

    if (ageAccept) {
        ageAccept.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.setItem("age_verified", "true");
            if (ageGate) ageGate.style.display = "none";
        });
    }

    if (ageReject) {
        ageReject.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "https://google.com";
        });
    }
    
    // אתחול והפעלת כפתור ה-SPIN ENGINE
    initSlotMachineEngine();
});

// 3. פונקציית הצינור המרכזית (ה-Filter) - מטוהרת ונקייה מערכים קשיחים
window.triggerFilter = function() {
    // קורא את המדינה מחלון ה-Global של הדף (שה-fetch_data.js מזהה בלייב)
    if (window.userCountry && window.userCountry !== "UNKNOWN") {
        userCountry = window.userCountry;
    }
    
    console.log(`📊 [Core App Engine] Synchronizing layouts for country: ${userCountry}`);

    const sourceData = (casinoData && casinoData.length > 0) ? casinoData : fallbackCasinoData;
    
    // סינון אחיד ומקצועי של המותגים המורשים למדינה
    filteredData = sourceData.filter(casino => {
        return casino.allowed_countries.includes(userCountry) || 
               casino.allowed_countries.includes("ALL");
    });

    if (filteredData.length === 0) {
        filteredData = sourceData.filter(casino => 
            casino.allowed_countries.includes("DE") || casino.allowed_countries.includes("CY")
        );
    }
    
    // במידה וקיימת פונקציית בניית טבלה בקוד שלך, היא תופעל כאן
    if (typeof renderTable === "function") {
        renderTable();
    }
};

// הפעלת פונקציית הצינור כפונקציה גלובלית תואמת
window.updateCasinoDataByCountry = function(detectedCountry) {
    if (detectedCountry) window.userCountry = detectedCountry;
    window.triggerFilter();
};

// 4. מנוע ה-SLOT MACHINE (הגלגלים, הריצה והסיבובים)
function initSlotMachineEngine() {
    const spinBtn = document.getElementById("slots-action-trigger");
    if (!spinBtn) return;

    spinBtn.addEventListener("click", () => {
        console.log("⚡ [Slot Engine] Spinning...");
        spinBtn.disabled = true;
        
        // ריצה של שנתיים (אנימציית גלגלים וירטואלית)
        setTimeout(() => {
            spinBtn.disabled = false;
            triggerWinDisplayPanel();
        }, 2000);
    });
}

function triggerWinDisplayPanel() {
    const winPanel = document.getElementById('slots-win-display');
    const panelTitle = document.getElementById('slots-panel-title');
    const panelDetail = document.getElementById('slots-panel-detail');
    const panelLink = document.getElementById('slots-panel-link');
    
    const activeList = (filteredData && filteredData.length > 0) ? filteredData : fallbackCasinoData;
    // הגרלה רנדומלית מתוך המותגים המורשים למדינה
    const matchedCasino = activeList[Math.floor(Math.random() * activeList.length)];
    
    if (matchedCasino && winPanel) {
        panelTitle.innerText = matchedCasino.casino_name || matchedCasino.name;
        panelDetail.innerText = matchedCasino.bonus_text || matchedCasino.bonus;
        panelLink.href = matchedCasino.affiliate_link || "#";
        winPanel.style.setProperty('display', 'block', 'important');
    }
}
