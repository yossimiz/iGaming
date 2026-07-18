// ================================================================= 
// FETCH_DATA.JS - INDEPENDENT GEO ENGINE WITH LIVE TABLE RENDER     
// ================================================================= 

window.userCountry = "UNKNOWN";
window.casinoData = [];

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Triggering clean standalone data pipeline...");
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

    // הגדרת משתני מדינה גלובליים
    window.userCountry = detectedCountry;
    if (typeof userCountry !== 'undefined') userCountry = detectedCountry;

    // 2. משיכת הנתונים הדינמיים מקובץ ה-JSON
    try {
        const jsonResponse = await fetch('data.json');
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            if (jsonData.top_brands) {
                window.casinoData = jsonData.top_brands;
                window.fallbackCasinoData = jsonData.top_brands;
                if (typeof casinoData !== 'undefined') casinoData = jsonData.top_brands;
                console.log("📥 [JSON Loaded] Scraped dynamic matrix data ready.");
            }
        }
    } catch (jsonErr) {}

    // 3. 🎯 עדכון ה-UI והפעלת מנגנון הצינור המקורי של האתר שלך
    setTimeout(() => {
        // א. סימון שקט של המדינה הנבחרת בתיבת הבחירה (בלי להפעיל אירועים כפולים)
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // ב. הפעלת הלוגיקה המקורית שלך ב-app.js
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        // ג. ניקוי ידני של תוויות הטעינה מהמסך
        updateVisualLabels(detectedCountry);
        
        // ד. רשת ביטחון: בונה את שורות הטבלה ישירות מהנתונים אם הרינדור של app.js נכשל
        renderFallbackTableDirectly(detectedCountry);

    }, 300); 
}

// פונקציה לעדכון התוויות והסטטוס על המסך
function updateVisualLabels(targetCountry) {
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) countryLabel.innerText = targetCountry;

    const targets = document.querySelectorAll('h3, div, span, p');
    targets.forEach(el => {
        if (el.innerText === 'Loading Matrix...') el.innerText = 'Matrix Engine Active';
        if (el.innerText === 'Detecting...') el.innerText = targetCountry;
        if (el.innerText === 'Loading Brand...') el.innerText = 'MyStake Casino';
        if (el.innerText === 'Loading Package...') el.innerText = 'Exclusive 150% Welcome Pack';
    });
}

// פונקציית רשת ביטחון: מרנדרת את שורות המותגים במידה והטבלה נתקעת ריקה
function renderFallbackTableDirectly(country) {
    const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
    if (!tableBody) return;

    // בודק אם הטבלה ריקה או מציגה שורת טעינה
    if (tableBody.children.length === 0 || tableBody.innerHTML.includes('Loading') || tableBody.innerHTML.includes('No regulated brands')) {
        console.log("⚠️ [Fallback Render] Table is empty. Generating premium rows directly...");
        
        const sourceList = (window.casinoData && window.casinoData.length > 0) ? window.casinoData : [];
        if (sourceList.length === 0) return;

        let tableHTML = '';
        sourceList.forEach(brand => {
            // בודק אם המותג מורשה למדינה שנבחרה
            const countries = brand.allowed_countries || [];
            if (countries.includes(country) || countries.includes('ALL')) {
                tableHTML += `
                    <tr style="background: #131926; border-bottom: 1px solid #222d42;">
                        <td style="padding: 15px; color: #ffffff; font-weight: 700;">👑 ${brand.casino_name || brand.name}</td>
                        <td style="padding: 15px; color: #00e676; font-weight: 700;">🎁 ${brand.bonus_text || brand.bonus}</td>
                        <td style="padding: 15px; color: #ecc94b;">⭐⭐⭐⭐⭐ (${brand.rating || '4.8'})</td>
                        <td style="padding: 15px; color: #00b0ff; font-weight: 700;">${brand.rtp_score || brand.rtp}</td>
                        <td style="padding: 15px; text-align: right;">
                            <a href="${brand.affiliate_link || brand.affiliate_link || '#'}" target="_blank" style="background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%); color: #0b0e14; text-decoration: none; padding: 6px 14px; border-radius: 4px; font-weight: 800; font-size: 11px; text-transform: uppercase;">PLAY NOW</a>
                        </td>
                    </tr>
                `;
            }
        });

        if (tableHTML) {
            tableBody.innerHTML = tableHTML;
            const loadingText = document.getElementById('loading');
            if (loadingText) loadingText.style.display = 'none';
            const casinoTable = document.getElementById('casino-table');
            if (casinoTable) casinoTable.style.display = 'table';
        }
    }
}

// הפעלת מנוע הנתונים והמיקום מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);

// 5. האזנה לשינויים ידניים של המשתמש בתיבת ה-Select
document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            let userSelected = e.target.value;
            if (userSelected === 'GB') userSelected = 'UK';
            
            console.log("🎯 [User Action] Country switched manually to:", userSelected);
            window.userCountry = userSelected;
            if (typeof userCountry !== 'undefined') userCountry = userSelected;
            
            updateVisualLabels(userSelected);
            
            // אילוץ בנייה מחדש של השורות בהתאם למדינה החדשה שנבחרה בעכבר
            setTimeout(() => {
                const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
                if (tableBody) tableBody.innerHTML = ''; // מנקה את הישן
                renderFallbackTableDirectly(userSelected); // בונה את החדש
            }, 50);
        });
    }
});
