// ================================================================= 
// FETCH_DATA.JS - INDEPENDENT GEO ENGINE WITH LIVE DATA SYNC         
// ================================================================= 

window.userCountry = "CY"; // ברירת מחדל נקייה לאירופה

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Initializing live geo-detection pipeline...");
    let detectedCountry = "CY"; 
    
    // 1. זיהוי מיקום אמיתי בלייב לפי ה-IP של הגולש
    const geoSources = ['https://ipapi.co', 'https://ipwhois.app'];
    for (const url of geoSources) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const ipData = await response.json();
                const code = (ipData.country_code || ipData.country || '').toString().trim().toUpperCase();
                if (code && code !== 'IL') { // מונע תקלות קודמות
                    detectedCountry = code === 'GB' ? 'UK' : code;
                    break;
                }
            }
        } catch (err) {}
    }

    // הגדרת משתנה המדינה בחלון הגלובלי
    window.userCountry = detectedCountry;
    if (typeof userCountry !== 'undefined') userCountry = detectedCountry;

    // עדכון קוד המדינה בתיבת הסטטוס על המסך
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) countryLabel.innerText = detectedCountry;

    // 2. משיכת קובץ ה-JSON הדינמי שנוצר על ידי שרת הפייתון
    try {
        const jsonResponse = await fetch('data.json');
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            if (jsonData.top_brands) {
                window.casinoData = jsonData.top_brands;
                window.fallbackCasinoData = jsonData.top_brands;
                if (typeof casinoData !== 'undefined') casinoData = jsonData.top_brands;
            }
        }
    } catch (jsonErr) {}

    // 3. עדכון תוויות ה-UI והפעלת הסינון המטוהר ב-app.js
    setTimeout(() => {
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        const uiLabels = document.querySelectorAll('h3, div, span, p');
        uiLabels.forEach(el => {
            if (el.innerText === 'Loading Matrix...') el.innerText = 'Matrix Engine Active';
            if (el.innerText === 'Detecting...') el.innerText = detectedCountry;
            if (el.innerText === 'Loading Brand...') el.innerText = 'MyStake Casino';
            if (el.innerText === 'Loading Package...') el.innerText = 'Exclusive 150% Welcome Pack';
        });

        // הפעלת פונקציית הצינור המשולבת שעדכנו בתוך app.js
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
    }, 300); 
}

// הפעלת המערכת אוטומטית עם טעינת הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);
