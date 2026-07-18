// ================================================================= 
// FETCH_DATA.JS - PREMIUM EU FULL-WIDTH TABLE INJECTION ENGINE    
// ================================================================= 

window.userCountry = "CY";
window.casinoData = [];

async function runGlobalDataSyncEngine() {
    console.log("🚀 [Data Sync] Initializing live geo-detection pipeline...");
    let detectedCountry = "CY"; 
    
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

    window.userCountry = detectedCountry;
    if (typeof userCountry !== 'undefined') userCountry = detectedCountry;

    const countryLabel = document.getElementById('display-country');
    if (countryLabel) countryLabel.innerText = detectedCountry;

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

    setTimeout(() => {
        const countrySelect = document.getElementById('country-select');
        if (countrySelect) {
            countrySelect.value = detectedCountry === 'UK' ? 'GB' : detectedCountry;
        }

        // עדכון תוויות המטריצה הראשיות בלבד
        const matrixStatus = document.getElementById('matrix-status-text');
        if (matrixStatus) matrixStatus.innerText = 'Matrix Engine Active';

        const matrixBrand = document.getElementById('matrix-brand-text');
        if (matrixBrand) matrixBrand.innerText = 'MyStake Casino';

        const matrixPackage = document.getElementById('matrix-package-text');
        if (matrixPackage) matrixPackage.innerText = 'Exclusive 150% Welcome Pack';

        const loadingBox = document.getElementById('loading');
        if (loadingBox) {
            loadingBox.style.setProperty('display', 'none', 'important');
        }

        if (typeof window.updateCasinoDataByCountry === "function") {
            window.updateCasinoDataByCountry(detectedCountry);
        }
        if (typeof window.triggerFilter === "function") {
            window.triggerFilter();
        }

        renderLiveTableRows(detectedCountry);
    }, 300); 
}

function renderLiveTableRows(country) {
    const tableBody = document.getElementById('table-body') || document.querySelector('tbody');
    if (!tableBody) return;

    const sourceList = (window.casinoData && window.casinoData.length > 0) ? window.casinoData : [];
    if (sourceList.length === 0) return;

    let tableHTML = '';
    sourceList.forEach(brand => {
        const countries = brand.allowed_countries || [];
        if (countries.includes(country) || countries.includes('ALL')) {
            
            // שחזור מדויק של הטקסט המשפטי והלוגו לפי העיצוב המקורי בתמונה שלך
            const regText = brand.regulatory_text || "18+. T&Cs apply. Play responsibly. BeGambleAware.org";
            const highlightText = brand.operator_highlights || "● Verified App";
            const ratingStars = brand.rating || "96.45%";
            
            // בניית שורה רחבה ומקורית (מיושרת בול תחת 5 הכותרות המקוריות של האתר שלך)
            tableHTML += `
                <tr style="border-bottom: 1px solid #1a2232; background: #0f1420; transition: background 0.2s;">
                    <td style="padding: 20px 15px; color: #ffffff; font-weight: 700; font-size: 15px; text-align: left; border: none;">👑 ${brand.casino_name || brand.name}</td>
                    <td style="padding: 20px 15px; color: #3b82f6; font-weight: 700; font-size: 14px; text-align: left; border: none;">${brand.bonus_text || brand.bonus}</td>
                    <td style="padding: 20px 15px; color: #10b981; font-size: 13px; font-weight: 600; text-align: left; border: none;">
                        <span style="display: inline-flex; align-items: center; gap: 4px; color: #10b981;">● Verified App</span>
                    </td>
                    <td style="padding: 20px 15px; color: #10b981; font-weight: 700; font-size: 15px; text-align: left; border: none;">${brand.rtp_score || brand.rtp}</td>
                    <td style="padding: 20px 15px; text-align: right; border: none; vertical-align: top;">
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                            <a href="${brand.affiliate_link || '#'}" target="_blank" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; text-transform: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); display: inline-block; text-align: center;">Claim Access</a>
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

document.addEventListener("DOMContentLoaded", runGlobalDataSyncEngine);

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
