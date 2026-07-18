// ================================================================= 
// FETCH_DATA.JS - FORCED GEO ENFORCEMENT ENGINE (CYPRUS FIX)        
// ================================================================= 

window.userCountry = "CY"; // ברירת מחדל קשיחה מראש לקפריסין
window.casinoData = [];

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Triggering standalone geo enforcement...");
    let detectedCountry = "CY"; // מציב קפריסין כבסיס קבוע
    
    // 1. ניסיון זיהוי ה-IP האמיתי שלך בלייב
    const geoSources = ['https://ipapi.co', 'https://ipwhois.app'];
    for (const url of geoSources) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const ipData = await response.json();
                const code = (ipData.country_code || ipData.country || '').toString().trim().toUpperCase();
                if (code && code !== 'IL') { // אם זוהתה מדינה שאינה ישראל, ניקח אותה
                    detectedCountry = code === 'GB' ? 'UK' : code;
                    break;
                }
            }
        } catch (err) {}
    }

    // כפייה מוחלטת של המדינה שנמצאה (או CY) על כל המשתנים הגלובליים באתר
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
            }
        }
    } catch (jsonErr) {}

    // 3. 🎯 אכיפת ה-UI והרס המילים הישנות (מניע חזרה ל-IL)
    setTimeout(() => {
        // א. מעדכן פיזית את תיבת המדינות (Select) למדינה האמיתית שלך
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // ב. ניקוי אגרסיבי של תוויות הטעינה וכפיית המדינה על המסך
        updateVisualLabels(detectedCountry);
        
        // ג. הפעלת הלוגיקה ב-app.js
        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        // ד. בנייה ישירה של הטבלה מה-JSON כדי למנוע קוביות ריקות
        renderFallbackTableDirectly(detectedCountry);

    }, 300); 
}

// פונקציה לעדכון תוויות הסטטוס על המסך
function updateVisualLabels(targetCountry) {
    const countryLabel = document.getElementById('display-country');
    if (countryLabel) countryLabel.innerText = targetCountry;

    const targets = document.querySelectorAll('h3, div, span, p, [id*="target"], [class*="feed"]');
    targets.forEach(el => {
        if (el.innerText === 'Loading Matrix...') el.innerText = 'Matrix Engine Active';
        if (el.innerText === 'Detecting...' || el.innerText === 'IL') {
            el.innerText = targetCountry; // מוחק כל זכר לטקסט IL קבוע ומשתיל את המדינה האמיתית
        }
        if (el.innerText === 'Loading Brand...') el.innerText = 'MyStake Casino';
        if (el.innerText === 'Loading Package...') el.innerText = 'Exclusive 150% Welcome Pack';
    });
}

// רינדור ישיר וחסין תקלות של שורות המותגים בהתאם למדינה
function renderFallbackTableDirectly(country) {
    const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
    if (!tableBody) return;

    // מנקה שורות תקועות או הודעות שגיאה ישנות
    tableBody.innerHTML = '';

    const sourceList = (window.casinoData && window.casinoData.length > 0) ? window.casinoData : [];
    if (sourceList.length === 0) return;

    let tableHTML = '';
    sourceList.forEach(brand => {
        const countries = brand.allowed_countries || [];
        // אם המותג תומך במדינה הנוכחית או פתוח לכולם
        if (countries.includes(country) || countries.includes('ALL')) {
            tableHTML += `
                <tr style="background: #131926; border-bottom: 1px solid #222d42;">
                    <td style="padding: 15px; color: #ffffff; font-weight: 700;">👑 ${brand.casino_name || brand.name}</td>
                    <td style="padding: 15px; color: #00e676; font-weight: 700;">🎁 ${brand.bonus_text || brand.bonus}</td>
                    <td style="padding: 15px; color: #ecc94b;">⭐⭐⭐⭐⭐ (${brand.rating || '4.8'})</td>
                    <td style="padding: 15px; color: #00b0ff; font-weight: 700;">${brand.rtp_score || brand.rtp}</td>
                    <td style="padding: 15px; text-align: right;">
                        <a href="${brand.affiliate_link || '#'}" target="_blank" style="background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%); color: #0b0e14; text-decoration: none; padding: 6px 14px; border-radius: 4px; font-weight: 800; font-size: 11px; text-transform: uppercase;">PLAY NOW</a>
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

// הפעלת מנוע האכיפה מיד עם טעינת הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);

// 4. מאזין להחלפה ידנית ברשימה (משמר את זכות הבחירה של המשתמש באירופה)
document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            let userSelected = e.target.value;
            if (userSelected === 'GB') userSelected = 'UK';
            
            console.log("🎯 [User Interactive] Country switched to:", userSelected);
            window.userCountry = userSelected;
            if (typeof userCountry !== 'undefined') userCountry = userSelected;
            
            updateVisualLabels(userSelected);
            
            const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
            if (tableBody) tableBody.innerHTML = ''; 
            renderFallbackTableDirectly(userSelected); 
        });
    }
});
