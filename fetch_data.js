// ================================================================= 
// FETCH_DATA.JS - DIRECT TABLE INJECTION & TEXT CLEARING ENGINE    
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
                console.log("📥 [JSON Loaded] Scraped data attached to global array.");
            }
        }
    } catch (jsonErr) {
        console.warn("Could not load data.json, running simulation mode.");
    }

    // 3. 🎯 ניקוי טקסטים חוסמים והזרקה ישירה של שורות הקזינו לטבלה
    setTimeout(() => {
        // א. מציאת תיבת הטקסט התקועה של ה-Syncing secure ומחיקתה כדי לפנות מקום לטבלה
        const allDivs = document.querySelectorAll('div, p, span, h3');
        allDivs.forEach(el => {
            if (el.innerText && el.innerText.includes('Syncing secure iGaming')) {
                el.style.setProperty('display', 'none', 'important'); // מעלים את הטקסט החוסם
            }
            if (el.innerText === 'Loading Matrix...') el.innerText = 'Matrix Engine Active';
            if (el.innerText === 'Detecting...') el.innerText = detectedCountry;
            if (el.innerText === 'Loading Brand...') el.innerText = 'MyStake Casino';
            if (el.innerText === 'Loading Package...') el.innerText = 'Exclusive 150% Welcome Pack';
        });

        // ב. עדכון שקט של תיבת הבחירה (Select) למדינה האמיתית של הגולש
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // ג. בנייה ישירה בכפייה של שורות הטבלה על המסך מתוך ה-JSON של הפייתון
        renderLiveTableRows(detectedCountry);

    }, 400); 
}

// פונקציה עצמאית שבונה את שורות המותגים ומזריקה אותן פיזית לתוך גוף הטבלה
function renderLiveTableRows(country) {
    // מאתר את גוף הטבלה הקיים באתר שלך (לפי id או לפי תגית tbody)
    let tableBody = document.getElementById('table-body') || document.querySelector('tbody');
    
    // במידה והאלמנט לא נמצא, נחפש את התיבה הכהה הגדולה שבה מופיע טקסט הסנכרון
    if (!tableBody) {
        const tableContainer = Array.from(document.querySelectorAll('div')).find(el => el.innerText && el.innerText.includes('Syncing secure iGaming'));
        if (tableContainer) {
            tableContainer.innerHTML = '<table style="width:100%; border-collapse: collapse;"><tbody id="table-body"></tbody></table>';
            tableBody = document.getElementById('table-body');
        }
    }

    if (!tableBody) return;

    // לקיחת הנתונים שנוצרו ב-Python
    const sourceList = (window.casinoData && window.casinoData.length > 0) ? window.casinoData : [];
    if (sourceList.length === 0) return;

    let tableHTML = '';
    sourceList.forEach(brand => {
        const countries = brand.allowed_countries || [];
        if (countries.includes(country) || countries.includes('ALL')) {
            // יצירת מבנה שורה יוקרתי, רספונסיבי ומיושר לשמאל (LTR) התואם את עיצוב האתר שלך
            tableHTML += `
                <tr style="background: #131926; border-bottom: 1px solid #222d42; display: grid; grid-template-columns: 1.5fr 2fr 1.5fr 1fr 1.2fr; align-items: center; padding: 14px 20px; text-align: left; font-family: 'Segoe UI', sans-serif;">
                    <td style="color: #ffffff; font-weight: 700; font-size: 15px; border: none; padding: 0;">👑 ${brand.casino_name || brand.name}</td>
                    <td style="color: #00e676; font-weight: 700; font-size: 14px; border: none; padding: 0;">🎁 ${brand.bonus_text || brand.bonus}</td>
                    <td style="color: #ecc94b; font-size: 13px; border: none; padding: 0;">⭐⭐⭐⭐⭐ (${brand.rating || '4.9'})</td>
                    <td style="color: #00b0ff; font-weight: 700; font-size: 15px; border: none; padding: 0;">${brand.rtp_score || brand.rtp}</td>
                    <td style="text-align: right; border: none; padding: 0;">
                        <a href="${brand.affiliate_link || '#'}" target="_blank" style="background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%); color: #0b0e14; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">PLAY NOW</a>
                    </td>
                </tr>
            `;
        }
    });

    if (tableHTML) {
        tableBody.innerHTML = tableHTML;
        
        // הצגת הטבלה והעלמת אלמנט הטעינה הישן
        const loadingText = document.getElementById('loading');
        if (loadingText) loadingText.style.display = 'none';
        const casinoTable = document.getElementById('casino-table');
        if (casinoTable) casinoTable.style.display = 'table';
    }
}

// הפעלת מנוע הנתונים והמיקום מיד עם עליית הדף
document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);

// מאזין להחלפה ידנית ברשימה (משמר את זכות הבחירה של המשתמש ומעדכן את השורות בלייב)
document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            let userSelected = e.target.value;
            if (userSelected === 'GB') userSelected = 'UK';
            
            window.userCountry = userSelected;
            if (typeof userCountry !== 'undefined') userCountry = userSelected;
            
            // עדכון המדינה על המסך באופן ידני
            const countryLabel = document.getElementById('display-country');
            if (countryLabel) countryLabel.innerText = userSelected;
            
            const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
            if (tableBody) tableBody.innerHTML = ''; 
            renderLiveTableRows(userSelected); 
        });
    }
});
