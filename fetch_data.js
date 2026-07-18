// ================================================================= 
// FETCH_DATA.JS - ULTRA SAFE SINGLE-POINT DATA INJECTION ENGINE     
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
                console.log("📥 [JSON] Live dynamic data injected into the application.");
            }
        }
    } catch (jsonErr) {}

    // 3. 🎯 עדכון תוויות UI ממוקד ובניית שורות הטבלה בבטחה
    setTimeout(() => {
        // א. עדכון שקט של תיבת הבחירה (Select) למדינה האמיתית של הגולש
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // ב. העלמת כיתובי טעינה ממוקדים בלבד
        const uiLabels = document.querySelectorAll('h3, div, span, p');
        uiLabels.forEach(el => {
            if (el.innerText === 'Loading Matrix...') el.innerText = 'Matrix Engine Active';
            if (el.innerText === 'Detecting...') el.innerText = detectedCountry;
            if (el.innerText === 'Loading Brand...') el.innerText = 'MyStake Casino';
            if (el.innerText === 'Loading Package...') el.innerText = 'Exclusive 150% Welcome Pack';
            
            // העלמת משפט הסטטוס התקוע בצורה בטוחה
            if (el.innerText && el.innerText.includes('Syncing secure iGaming cryptographic matrix...')) {
                el.style.setProperty('display', 'none', 'important');
            }
        });

        // ג. הפעלת פונקציות הצינור המקוריות שרשומות אצלך ב-app.js
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        // ד. בנייה ממוקדת של שורות הטבלה ישירות מתוך ה-JSON של הפייתון
        renderLiveTableRows(detectedCountry);

    }, 300); 
}

// פונקציה ממוקדת שבונה את שורות המותגים ומזריקה אותן אך ורק לתוך ה-tbody הקיים
function renderLiveTableRows(country) {
    const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
    if (!tableBody) return;

    const sourceList = (window.casinoData && window.casinoData.length > 0) ? window.casinoData : [];
    if (sourceList.length === 0) return;

    let tableHTML = '';
    sourceList.forEach(brand => {
        const countries = brand.allowed_countries || [];
        if (countries.includes(country) || countries.includes('ALL')) {
            tableHTML += `
                <tr style="background: #131926; border-bottom: 1px solid #222d42;">
                    <td style="padding: 15px; color: #ffffff; font-weight: 700; text-align: left; border: none;">👑 ${brand.casino_name || brand.name}</td>
                    <td style="padding: 15px; color: #00e676; font-weight: 700; text-align: left; border: none;">🎁 ${brand.bonus_text || brand.bonus}</td>
                    <td style="padding: 15px; color: #ecc94b; text-align: left; border: none;">⭐⭐⭐⭐⭐ (${brand.rating || '4.9'})</td>
                    <td style="padding: 15px; color: #00b0ff; font-weight: 700; text-align: left; border: none;">${brand.rtp_score || brand.rtp}</td>
                    <td style="padding: 15px; text-align: right; border: none;">
                        <a href="${brand.affiliate_link || '#'}" target="_blank" style="background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%); color: #0b0e14; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">PLAY NOW</a>
                    </td>
                </tr>
            `;
        }
    });

    if (tableHTML) {
        tableBody.innerHTML = tableHTML;
        
        // חשיפת הטבלה והסרת מסך הטעינה
        const loadingText = document.getElementById('loading');
        if (loadingText) loadingText.style.display = 'none';
        const casinoTable = document.getElementById('casino-table');
        if (casinoTable) casinoTable.style.display = 'table';
    }
}

// הפעלת מנוע הנתונים והמיקום מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);

// מאזין להחלפה ידנית ברשימה
document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            let userSelected = e.target.value;
            if (userSelected === 'GB') userSelected = 'UK';
            
            window.userCountry = userSelected;
            if (typeof userCountry !== 'undefined') userCountry = userSelected;
            
            const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
            if (tableBody) tableBody.innerHTML = ''; 
            renderLiveTableRows(userSelected); 
        });
    }
});
