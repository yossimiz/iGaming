// ================================================================= 
// FETCH_DATA.JS - FIXED VARIABLE SYNC & AUTOMATIC FALLBACK        
// ================================================================= 

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Initializing Geo & File Fetch...");
    let detectedCountry = "UNKNOWN";
    
    // 1. זיהוי מיקום מאובטח דרך שרתים התואמים את פרוטוקול GitHub Pages
    const geoSources = [
        'https://ipapi.co',
        'https://ipwhois.app'
    ];

    for (const url of geoSources) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const ipData = await response.json();
                const code = (ipData.country_code || ipData.country || '').toString().trim().toUpperCase();
                if (code) {
                    detectedCountry = code === 'GB' ? 'UK' : code;
                    console.log(`🌍 [Geo Found] Country detected via ${url}:`, detectedCountry);
                    break;
                }
            }
        } catch (err) {
            console.warn(`⚠️ [Geo Source Failed]: ${url}`);
        }
    }

    // מערכת מילוט (Fallback) לפי אזור זמן במידה ושרתי ה-IP נחסמו
    if (detectedCountry === "UNKNOWN") {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (/Jerusalem|Tel_Aviv/i.test(tz)) {
                detectedCountry = 'IL';
            } else {
                detectedCountry = 'DE'; 
            }
        } catch (e) {
            detectedCountry = 'DE';
        }
    }

    // עדכון קוד המדינה על המסך
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) {
        countryLabel.innerText = detectedCountry;
    }
    
    // עדכון תגית ה-Target Feed הקטנה שלך באתר מ-Detecting למדינה האמיתית
    const targetFeedLabel = document.querySelector('.target-feed-status') || document.body;
    // מחפש טקסט שמכיל Detecting ומחליף אותו
    document.body.innerHTML = document.body.innerHTML.replace('Detecting...', detectedCountry);

    // 2. משיכת קובץ ה-JSON הדינמי ואיחוד שמות המשתנים למניעת תקיעה
    try {
        const jsonResponse = await fetch('data.json');
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            console.log("📥 [JSON Loaded] Scraped data attached successfully:", jsonData);
            
            // תיאום משתנים קריטי: מציב את הנתונים בכל השמות האפשריים שהקוד שלך מחפש
            if (jsonData.top_brands) {
                window.casinoData = jsonData.top_brands;
                window.fallbackCasinoData = jsonData.top_brands;
                if (typeof casinoData !== 'undefined') casinoData = jsonData.top_brands;
            }
        }
    } catch (jsonErr) {
        console.log("ℹ️ [Notice] data.json not active yet or restricted. Running local lists.");
    }

    // 3. הפעלת מנגנון הסינון והצגת הטבלה הקיימת באתר שלך
    // מריץ את כל הפונקציות האפשריות בקוד שלך כדי לוודא שהטבלה תתעורר ותציג את הקזינואים
    if (typeof window.updateCasinoDataByCountry === "function") {
        window.updateCasinoDataByCountry(detectedCountry);
    }
    
    if (typeof window.triggerFilter === "function") {
        window.userCountry = detectedCountry;
        window.triggerFilter();
    }
    
    // קריאה לפונקציית רינדור הטבלה המקורית שלך (אם קיימת כפונקציה עצמאית)
    if (typeof window.renderTable === "function") {
        window.renderTable();
    } else if (typeof window.displayData === "function") {
        window.displayData();
    }
}

// הפעלת מנוע הנתונים והמיקום מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);
