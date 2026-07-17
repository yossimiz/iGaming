// ================================================================= 
// FETCH_DATA.JS - INDEPENDENT GEO ENGINE & LIVE DATA SYNC          
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

    // עדכון קוד המדינה על המסך במידה וקיים אינדיקטור
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) {
        countryLabel.innerText = detectedCountry;
    }

    // 2. משיכת קובץ ה-JSON הדינמי שהפייתון וה-Actions מייצרים ברקע
    try {
        const jsonResponse = await fetch('data.json');
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            console.log("📥 [JSON Loaded] Scraped data attached successfully:", jsonData);
            
            // הזנת הבונוסים שנסרקו לתוך מערך המותגים הראשי של המשחק
            if (jsonData.top_brands && typeof casinoData !== 'undefined') {
                casinoData = jsonData.top_brands;
            }
        }
    } catch (jsonErr) {
        console.log("ℹ️ [Notice] data.json not active yet. Running fallback lists.");
    }

    // 3. הפעלת מנגנון הסינון הקיים בתוך app.js עבור המדינה שנמצאה
    if (typeof window.updateCasinoDataByCountry === "function") {
        window.updateCasinoDataByCountry(detectedCountry);
    }
}

// הפעלת מנוע הנתונים והמיקום מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);
