// ================================================================= 
// FETCH_DATA.JS - SAFE TARGETED GEO & BACKGROUND UI INJECTION      
// ================================================================= 

window.userCountry = "UNKNOWN";

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Running clean background data injector...");
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

    // הגדרת המשתנים הגלובליים
    window.userCountry = detectedCountry;
    if (typeof userCountry !== 'undefined') userCountry = detectedCountry;

    // 2. עדכון שקט של קוד המדינה על המסך
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) {
        countryLabel.innerText = detectedCountry;
    }

    // 3. משיכת הנתונים הדינמיים מקובץ ה-JSON
    try {
        const jsonResponse = await fetch('data.json');
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            if (jsonData.top_brands) {
                window.casinoData = jsonData.top_brands;
                window.fallbackCasinoData = jsonData.top_brands;
                if (typeof casinoData !== 'undefined') casinoData = jsonData.top_brands;
                console.log("📥 [JSON Loaded] Scraped data attached to global array.");
            }
        }
    } catch (jsonErr) {}

    // 4. 🎯 עדכון טקסטים ישיר וממוקד בלבד - ללא שליחת אירועים (No dispatchEvent!)
    setTimeout(() => {
        // א. מעדכן ישירות את רכיבי הטעינה הישנים כדי שלא יתקעו במסך
        const targets = document.querySelectorAll('h3, div, span, p');
        targets.forEach(el => {
            if (el.innerText === 'Loading Matrix...') el.innerText = 'Matrix Engine Active';
            if (el.innerText === 'Detecting...') el.innerText = detectedCountry;
            if (el.innerText === 'Loading Brand...') el.innerText = 'MyStake Casino';
            if (el.innerText === 'Loading Package...') el.innerText = 'Exclusive 150% Welcome Pack';
        });

        // ב. משנה את הערך הנבחר בתיבת המדינות (Select) בצורה שקטה מבלי להפעיל את הלולאה
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // ג. מפעיל פונקציות פנימיות ב-app.js בצורה ישירה רק אם הן קיימות בבטחה
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        console.log("✅ [Data Engine] Background configuration injected successfully.");
    }, 400); 
}

// הפעלת המנוע מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);
