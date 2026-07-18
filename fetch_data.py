// ================================================================= 
// FETCH_DATA.JS - ULTRA STABLE GEO & AUTO-UNLOCK ENGINE            
// ================================================================= 

window.userCountry = "UNKNOWN";

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Initializing Emergency Unlocking Engine...");
    let detectedCountry = "UNKNOWN";
    
    // 1. זיהוי מיקום מהיר ומאובטח
    const geoSources = ['https://ipapi.co', 'https://ipwhois.app'];
    for (const url of geoSources) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const ipData = await response.json();
                const code = (ipData.country_code || ipData.country || '').toString().trim().toUpperCase();
                if (code) {
                    detectedCountry = code === 'GB' ? 'UK' : code;
                    break;
                }
            }
        } catch (err) {}
    }

    if (detectedCountry === "UNKNOWN") {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            detectedCountry = /Jerusalem|Tel_Aviv/i.test(tz) ? 'IL' : 'DE';
        } catch (e) { detectedCountry = 'DE'; }
    }

    // הגדרת המשתנים הגלובליים בכל השמות האפשריים שהאתר מחפש
    window.userCountry = detectedCountry;
    if (typeof userCountry !== 'undefined') userCountry = detectedCountry;

    // עדכון קוד המדינה על המסך (אם קיים רכיב display-country)
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) countryLabel.innerText = detectedCountry;

    // 2. משיכת הנתונים הדינמיים מקובץ ה-JSON
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
    } catch (jsonErr) {
        console.log("Using fallback arrays due to json error.");
    }

    // 3. 🎯 שחרור בכפייה של תיבות הטעינה והמטריצה (Bypass UI Block)
    setTimeout(() => {
        // מציאת כל האלמנטים שמציגים טעינה והחלפתם באופן ידני כדי לשחרר את המסך
        const allElements = document.querySelectorAll('h3, div, span, p');
        allElements.forEach(el => {
            if (el.innerText && el.innerText.includes('Loading Matrix...')) {
                el.innerText = 'Matrix Engine Active';
            }
            if (el.innerText && el.innerText.includes('Detecting...')) {
                el.innerText = detectedCountry;
            }
            if (el.innerText && el.innerText.includes('Loading Brand...')) {
                el.innerText = 'MyStake Casino';
            }
            if (el.innerText && el.innerText.includes('Loading Package...')) {
                el.innerText = 'Exclusive 150% Welcome Pack';
            }
        });

        // הפעלת פונקציות הסינון המקוריות של האתר שלך במידה והן קיימות
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        // סימולציה של שינוי מדינה בתיבת הבחירה (Select) כדי לאלץ את הטבלה להתעורר ולהתרנדר
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
            countrySelect.dispatchEvent(new Event('change'));
        }

        console.log("✅ [Data Engine] Forced unlock completely applied.");
    }, 500); // חצי שנייה המתנה כדי לוודא שכל ה-HTML נטען לחלוטין
}

// הפעלת המנוע מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);
