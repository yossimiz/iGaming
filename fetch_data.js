// ================================================================= 
// FETCH_DATA.JS - INDEPENDENT GEO ENGINE WITH NO UI OVERRIDES       
// ================================================================= 

window.userCountry = "CY";
window.casinoData = [];

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
                if (code && code !== 'IL') {
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
                console.log("📥 [JSON] Live dynamic data loaded into global memory.");
            }
        }
    } catch (jsonErr) {}

    // 3. 🎯 עדכון תוויות UI ממוקד בלבד - ללא דריסת התיבות העליונות!
    setTimeout(() => {
        // עדכון שקט של תיבת הבחירה (Select) למדינה האמיתית של הגולש
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // העלמת הודעת הסנכרון התקועה בטבלה בצורה מאובטחת
        const loadingBox = document.getElementById('loading');
        if (loadingBox) {
            loadingBox.style.setProperty('display', 'none', 'important');
        }

        // הפעלת פונקציות הסינון בתוך app.js
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        // בנייה וחשיפה של שורות הטבלה התחתונה מה-JSON
        renderLiveTableRows(detectedCountry);
    }, 300); 
}

// פונקציה ממוקדת שמזריקה את שורות המותגים ומציגה את הטבלה בכפייה
function renderLiveTableRows(country) {
    const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
    if (!tableBody) return;

    const sourceList = (window.casinoData && window.casinoData.length > 0) ? window.casinoData : [];
    if (sourceList.length === 0) return;

    let tableHTML = '';
    sourceList.forEach(brand => {
        const countries = brand.allowed_countries || [];
        if (countries.includes(country) || countries.includes('ALL')) {
            const regText = brand.regulatory_text || "18+. T&Cs apply. Play responsibly. BeGambleAware.org";
            
            tableHTML += `
                <tr style="border-bottom: 1px solid #1a2232; background: #0f1420; transition: background 0.2s;">
                    <td style="padding: 20px 15px; color: #ffffff; font-weight: 700; text-align: left; border: none;">👑 ${brand.casino_name || brand.name}</td>
                    <td style="padding: 20px 15px; color: #3b82f6; font-weight: 700; font-size: 14px; text-align: left; border: none;">${brand.bonus_text || brand.bonus}</td>
                    <td style="padding: 20px 15px; color: #10b981; font-size: 13px; font-weight: 600; text-align: left; border: none;">
                        <span style="display: inline-flex; align-items: center; gap: 4px; color: #10b981;">● Verified App</span>
                    </td>
                    <td style="padding: 20px 15px; color: #10b981; font-weight: 700; font-size: 15px; text-align: left; border: none;">${brand.rtp_score || brand.rtp}</td>
                    <td style="padding: 20px 15px; text-align: right; border: none; vertical-align: top;">
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                            <a href="${brand.affiliate_link || '#'}" target="_blank" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); display: inline-block; text-align: center;">Claim Access</a>
                            <span style="color: #4a5568; font-size: 10px; font-weight: 500; text-align: right; max-width: 160px; line-height: 1.3; display: block;">${regText}</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    if (tableHTML) {
        tableBody.innerHTML = tableHTML;
        const casinoTable = document.getElementById('casino-table');
        if (casinoTable) {
            casinoTable.style.setProperty('display', 'table', 'important');
            casinoTable.style.setProperty('width', '100%', 'important');
        }
    }
}

// הפעלת מנוע הנתונים מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);

// מאזין להחלפה ידנית ברשימה
document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            let userSelected = e.target.value;
            if (userSelected === 'GB') userSelected = 'UK';
            window.userCountry = userSelected;
            const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
            if (tableBody) tableBody.innerHTML = ''; 
            renderLiveTableRows(userSelected); 
        });
    }
});
