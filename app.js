// משתנים גלובליים כדי שפונקציית ה-Callback תוכל לגשת אליהם מכל מקום
let casinoData = []; 
let filteredData = []; 
let userCountry = "UNKNOWN";

// 1. פונקציית ה-Callback הרשמית בשיטת ה-JSONP החינמית והמאובטחת
window.processIP = function(data) {
    // השירות מחזיר שדה בשם country_code או country
    if (data && data.country_code) {
        userCountry = data.country_code.toUpperCase();
    } else if (data && data.country) {
        userCountry = data.country.toUpperCase();
    } else {
        userCountry = "UNKNOWN";
    }
    
    if (userCountry === "GB") userCountry = "UK";
    console.log("JSONP Engine Successfully Detected Geo:", userCountry);
    
    // הפעלת סינון האתר מיד עם קבלת המדינה מה-IP
    if (typeof window.triggerFilter === "function") {
        window.triggerFilter();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const dataUrl = "data.json"; 
    const loadingElement = document.getElementById("loading");
    const tableElement = document.getElementById("casino-table");
    const tableBody = document.getElementById("table-body");
    const sortSelect = document.getElementById("sort-select");
    const countrySelect = document.getElementById("country-select");
    const displayCountry = document.getElementById("display-country");
    
    const ageGate = document.getElementById("age-gate");
    const ageAccept = document.getElementById("age-accept");
    const ageReject = document.getElementById("age-reject");

    // 2. מנגנון אימות גיל (18+)
    if (localStorage.getItem("age_verified") === "true") {
        if (ageGate) ageGate.style.display = "none";
    } else {
        if (ageGate) ageGate.style.display = "flex";
    }

    if (ageAccept) {
        ageAccept.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.setItem("age_verified", "true");
            if (ageGate) ageGate.style.display = "none";
        });
    }

    if (ageReject) {
        ageReject.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "https://google.com";
        });
    }

    // 3. פונקציה להזרקת הטבלה ל-HTML
    function renderTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color:#94a3b8;">No regulated brands available in ${userCountry} yet.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><span class="casino-name">${item.casino_name}</span></td>
                <td><span class="bonus-badge">${item.bonus_text}</span></td>
                <td>
                    <div class="rtp-container">
                        <span class="live-dot"></span>
                        <span class="rtp-badge">${item.rtp_score}</span>
                    </div>
                </td>
                <td>
                    <a href="${item.affiliate_link}" target="_blank" rel="nofollow noopener" class="btn-play">Claim Access</a>
                    <span class="regulatory-text">${item.regulatory_text}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 4. פונקציית סינון הנתונים והמבזקים העליונים
    window.triggerFilter = function() {
        if (displayCountry) displayCountry.innerText = userCountry;
        
        // הגדרת המשחק החם לפי המדינה מה-IP
        let hotGameText = "Sweet Bonanza (Pragmatic Play) 🍬";
        if (userCountry === "UK") {
            hotGameText = "Big Bass Bonanza (Pragmatic Play) 🎣";
        } else if (userCountry === "CY") {
            hotGameText = "Gates of Olympus (Pragmatic Play) ⚡";
        } else if (userCountry === "DE") {
            hotGameText = "Book of Dead (Play'n GO) 📜";
        }

        const hotGameElement = document.getElementById("hot-game-title");
        if (hotGameElement) {
            hotGameElement.innerText = hotGameText;
        }

        // סינון המותגים מתוך ה-JSON לפי המדינה שזוהתה
        filteredData = casinoData.filter(item => {
            if (!item.allowed_countries) return false; 
            return item.allowed_countries.includes(userCountry);
        });

        // כפתור משחק חם (שמאלי)
        const hotGameAction = document.getElementById("hot-game-action");
        const hotGameLink = document.getElementById("hot-game-link");
        if (hotGameAction && hotGameLink) {
            if (filteredData.length > 0 && filteredData[0]) {
                hotGameLink.href = filteredData[0].affiliate_link;
                hotGameAction.style.display = "block";
            } else {
                hotGameAction.style.display = "none";
            }
        }

        // כפתור בונוס מוביל (ימני)
        const bestCasinoElement = document.getElementById("best-bonus-casino");
        const bestBonusElement = document.getElementById("best-bonus-text");
        const bestBonusAction = document.getElementById("best-bonus-action");
        const bestBonusLink = document.getElementById("best-bonus-link");
        
        if (bestCasinoElement && bestBonusElement && bestBonusAction && bestBonusLink) {
            if (filteredData.length > 0) {
                const topCasino = [...filteredData].sort((a, b) => parseFloat(b.rtp_score) - parseFloat(a.rtp_score));
                if (topCasino && topCasino[0]) {
                    bestCasinoElement.innerText = topCasino[0].casino_name + " 🏆";
                    bestBonusElement.innerText = topCasino[0].bonus_text;
                    bestBonusLink.href = topCasino[0].affiliate_link;
                    bestBonusAction.style.display = "block";
                }
            } else {
                bestCasinoElement.innerText = "No Offers Available";
                bestBonusElement.innerText = "Switch region to view legal bonuses.";
                bestBonusAction.style.display = "none";
            }
        }

        if (loadingElement) loadingElement.style.display = "none";
        if (tableElement) tableElement.style.display = "table";
        
        renderTable(filteredData);
    };

    // 5. טעינת נתוני ה-JSON של בתי הקזינו
      // 5. טעינת נתוני ה-JSON של בתי הקזינו וזיהוי מיקום מודרני (Fetch)
    // 5. טעינת נתוני ה-JSON של בתי הקזינו וזיהוי מיקום מאובטח (HTTPS)
    // 5. Load Casino JSON with Bulletproof Native Geo-Detection
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            casinoData = data;
            
            try {
                // Instantly reads the exact timezone configured in the user's operating system
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log("Native Browser Timezone Detected:", userTimezone);
                
                // If the user is in Israel, set the code to IL. Otherwise, default to CY.
                if (userTimezone.includes("Jerusalem") || userTimezone.includes("Tel_Aviv")) {
                    userCountry = "IL";
                } else {
                    userCountry = "CY"; // Universal reliable European default
                }
                
                window.triggerFilter();
            } catch (geoError) {
                console.warn("Native detection failed, defaulting to CY:", geoError);
                userCountry = "CY";
                window.triggerFilter();
            }
        })
        .catch(error => {
            console.error("Critical System Error Loading JSON:", error);
            if (loadingElement) {
                loadingElement.innerHTML = `<span style="color: #ef4444;">Failed to sync with live data matrix.</span>`;
            }
        });



    // 6. האזנה לשינויים ידניים
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            const selected = e.target.value;
            if (selected !== "AUTO") {
                userCountry = selected;
                window.triggerFilter();
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            const value = e.target.value;
            let sortedData = [...filteredData];

            if (value === "rtp-desc") {
                sortedData.sort((a, b) => parseFloat(b.rtp_score) - parseFloat(a.rtp_score));
            } else if (value === "name-asc") {
                sortedData.sort((a, b) => a.casino_name.localeCompare(b.casino_name));
            }
            
            renderTable(sortedData);
        });
    }
        // =========================================================
    // 7. לוגיקה עבור המחשבון האינטראקטיבי
    // =========================================================
    const calcBudget = document.getElementById("calc-budget");
    const calcRtp = document.getElementById("calc-rtp");
    const calcResult = document.getElementById("calc-result");

    function calculateReturns() {
        if (!calcBudget || !calcRtp || !calcResult) return;
        
        const budget = parseFloat(calcBudget.value) || 0;
        const rtp = parseFloat(calcRtp.value) || 0;
        
        // חישוב מתמטי של ההחזר התיאורטי
        const estimatedReturn = (budget * (rtp / 100)).toFixed(2);
        
        // עדכון התוצאה על המסך עם אנימציית מספרים קלה
        calcResult.innerText = "€" + estimatedReturn;
    }

    if (calcBudget) calcBudget.addEventListener("input", calculateReturns);
    if (calcRtp) calcRtp.addEventListener("input", calculateReturns);

    // נחבר את המחשבון ללוגיקת הסינון הקיימת שלנו
    // בכל פעם שמדינה משתנה, נזין אוטומטית למחשבון את ה-RTP הגבוה ביותר שיש באותה מדינה
    const originalFilter = window.triggerFilter;
    window.triggerFilter = function() {
        // מריץ קודם את פונקציית הסינון המקורית שבנינו
        originalFilter();
        
        // מוצא את ה-RTP הכי גבוה במדינה הנוכחית ומציב אותו במחשבון
        if (filteredData && filteredData.length > 0 && calcRtp) {
            const topCasino = [...filteredData].sort((a, b) => parseFloat(b.rtp_score) - parseFloat(a.rtp_score))[0];
            if (topCasino && topCasino.rtp_score) {
                calcRtp.value = parseFloat(topCasino.rtp_score);
                calculateReturns();
            }
        }
    };
});
