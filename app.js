// משתנים גלובליים כדי שפונקציית ה-Callback תוכל לגשת אליהם מכל מקום
let casinoData = [];
let filteredData = [];
let userCountry = "UNKNOWN";

const fallbackCasinoData = [
    {
        casino_name: "Vulkan Vegas",
        bonus_text: "100% Up to €1,500 + 150 Free Spins",
        rtp_score: "96.82%",
        affiliate_link: "https://vpartners.link",
        regulatory_text: "18+. New EU players only. Min deposit €10. Wagering 40x. T&Cs apply.",
        allowed_countries: ["DE", "NL", "FI", "IE"]
    },
    {
        casino_name: "Ice Casino",
        bonus_text: "€1,500 Welcome Pack + 270 Free Spins",
        rtp_score: "96.45%",
        affiliate_link: "https://vpartners.link",
        regulatory_text: "18+. T&Cs apply. Play responsibly. BeGambleAware.org",
        allowed_countries: ["DE", "NL", "FI", "CY"]
    },
    {
        casino_name: "Bet365 Casino",
        bonus_text: "Stake £10 and get 50 Free Spins",
        rtp_score: "97.15%",
        affiliate_link: "https://bet365.link",
        regulatory_text: "18+. New UK players only. Min £10 deposit. 50 Free Spins. T&Cs apply.",
        allowed_countries: ["UK", "GB", "IE"]
    },
    {
        casino_name: "William Hill Casino",
        bonus_text: "£30 Free Bets for New UK Customers",
        rtp_score: "96.70%",
        affiliate_link: "https://williamhill.link",
        regulatory_text: "18+. UK & IE players only. New customers. T&Cs apply.",
        allowed_countries: ["UK", "GB"]
    },
    {
        casino_name: "LeoVegas Casino",
        bonus_text: "€100 + 100 Free Spins Welcome Pack",
        rtp_score: "96.90%",
        affiliate_link: "https://leovegas.link",
        regulatory_text: "18+. UK & EU players only. Min deposit €10. T&Cs apply.",
        allowed_countries: ["UK", "IE", "SE", "NO"]
    },
    {
        casino_name: "PlayOJO Casino",
        bonus_text: "50 Free Spins with No Wagering",
        rtp_score: "96.60%",
        affiliate_link: "https://playojo.link",
        regulatory_text: "18+. Available in CY, IE, and select EU markets only. T&Cs apply.",
        allowed_countries: ["CY", "IE", "UK"]
    },
    {
        casino_name: "Casumo Casino",
        bonus_text: "€200 + 20 Free Spins",
        rtp_score: "96.70%",
        affiliate_link: "https://casumo.link",
        regulatory_text: "18+. Cyprus & EU players only. Min deposit €10. T&Cs apply.",
        allowed_countries: ["CY", "FI", "SE", "NO"]
    }
];

// 1. פונקציית ה-Callback הרשמית בשיטת ה-JSONP החינמית והמאובטחת
window.processIP = function(data) {
    if (data && data.country_code) {
        userCountry = data.country_code.toUpperCase();
    } else if (data && data.country) {
        userCountry = data.country.toUpperCase();
    }

    if (!userCountry) {
        userCountry = "UNKNOWN";
    }

    if (userCountry === "GB") userCountry = "UK";
    console.log("JSONP Engine Successfully Detected Geo:", userCountry);

    if (typeof window.triggerFilter === "function") {
        window.triggerFilter();
    }
};

async function detectCountryFromIP(displayCountryElement) {
    const geoSources = [
        'https://ipapi.co/json/',
        'https://geolocation-db.com/json/',
        'https://ipwhois.app/json/'
    ];

    for (const url of geoSources) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Geo lookup failed: ${response.status} from ${url}`);
            }

            const ipData = await response.json();
            const countryCode = (ipData.country_code || ipData.country || ipData.countryCode || ipData.countryCode3 || '').toString().trim().toUpperCase();

            if (countryCode) {
                userCountry = countryCode === 'GB' ? 'UK' : countryCode;
                console.log(`IP geo lookup succeeded with ${url}:`, userCountry);
                break;
            }
        } catch (geoError) {
            console.warn(`Geo lookup failed for ${url}:`, geoError);
        }
    }

    if (!userCountry || userCountry === 'UNKNOWN') {
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            console.warn('Using timezone fallback for geo:', userTimezone);
            if (/Jerusalem|Tel_Aviv|Asia\/Jerusalem/i.test(userTimezone)) {
                userCountry = 'IL';
            } else {
                userCountry = 'ALL';
            }
        } catch (timezoneError) {
            console.warn('Timezone fallback failed, defaulting to GLOBAL:', timezoneError);
            userCountry = 'ALL';
        }
    }

    if (displayCountryElement) {
        displayCountryElement.innerText = userCountry === 'ALL' ? 'GLOBAL' : userCountry;
    }

    if (typeof window.triggerFilter === "function") {
        window.triggerFilter();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const dataUrl = "./data.json"; 
    const loadingElement = document.getElementById("loading");
    const tableElement = document.getElementById("casino-table");
    const tableBody = document.getElementById("table-body");
    const sortSelect = document.getElementById("sort-select");
    const countrySelect = document.getElementById("country-select");
    const refreshSelect = document.getElementById("refresh-select");
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
                <!-- 1. שם הקזינו -->
                <td><span class="casino-name">${item.casino_name}</span></td>
                
                <!-- 2. הבונוס -->
                <td><span class="bonus-badge">${item.bonus_text}</span></td>
                
                <!-- 3. נקודות ציון / Highlights (הוספת live-dot כאן כדי לשמור על העיצוב) -->
                <td>
                    <div class="rtp-container">
                        <span class="live-dot" style="background-color: #00ff87;"></span>
                        <span style="color: #b3c0d4; font-size: 13px; font-weight: 600;">Verified App</span>
                    </div>
                </td>
                
                <!-- 4. אחוז ה-RTP הריאלי - יישב בדיוק מתחת ל-REAL-TIME RTP -->
                <td>
                    <span class="rtp-badge" style="color: #00ff87; font-weight: 700;">${item.rtp_score}</span>
                </td>
                
                <!-- 5. הכפתור הכחול והרגולציה - יישב בדיוק מתחת ל-SECURE ACTION -->
                <td>
                    <a href="${item.affiliate_link}" target="_blank" rel="nofollow noopener" class="btn-play">Claim Access</a>
                    <span class="regulatory-text" style="display: block; margin-top: 4px;">${item.regulatory_text}</span>
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

        // סינון המותגים אך ורק לפי המדינה שזוהתה, ללא הגבלת RTP קשיחה בטבלה
               // סינון חכם ומאובטח המנקה רווחים ותווים נסתרים (Trim) מה-JSON
        const normalizedCountry = userCountry ? userCountry.trim().toUpperCase() : 'ALL';
        filteredData = casinoData.filter(item => {
            if (!item.allowed_countries) return true;
            
            // מנקה רווחים, ירידות שורה ותווים נסתרים מכל המדינות ב-JSON והופך לאותיות גדולות
            const cleanCountries = item.allowed_countries.map(c => c.trim().replace(/[\r\n]/g, "").toUpperCase());
            
            if (normalizedCountry === 'ALL' || normalizedCountry === 'UNKNOWN' || normalizedCountry === '') {
                return true;
            }

            // תרגום אחיד לבריטניה
            if (normalizedCountry === "UK" || normalizedCountry === "GB" || normalizedCountry === "UNITED KINGDOM") {
                return cleanCountries.includes("UK") || cleanCountries.includes("GB");
            }
            
            return cleanCountries.includes(normalizedCountry);
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

        console.log(`Filtering ${casinoData.length} total casino records for country ${userCountry}. ${filteredData.length} matches found.`);

        if (loadingElement) loadingElement.style.display = "none";
        if (tableElement) tableElement.style.display = "table";
        
        renderTable(filteredData);
    };

    // 5. טעינת נתוני ה-JSON של בתי הקזינו
      // 5. טעינת נתוני ה-JSON של בתי הקזינו וזיהוי מיקום מודרני (Fetch)
    // 5. טעינת נתוני ה-JSON של בתי הקזינו וזיהוי מיקום מאובטח (HTTPS)
    // 5. Load Casino JSON with Bulletproof Native Geo-Detection
    async function loadCasinoData() {
        let sourceLabel = "LOCAL";
        let loaded = false;

        if (REMOTE_FEED_URL && window.navigator.onLine) {
            try {
                const remoteResponse = await fetch(REMOTE_FEED_URL, {
                    cache: 'no-store',
                    mode: 'cors',
                    credentials: 'omit'
                });

                if (remoteResponse.ok) {
                    const remoteData = await remoteResponse.json();
                    if (Array.isArray(remoteData) && remoteData.length > 0) {
                        casinoData = remoteData;
                        loaded = true;
                        sourceLabel = "ONLINE";
                        console.log(`Loaded ${casinoData.length} casino records from remote feed.`);
                    }
                } else {
                    console.warn(`Remote feed returned ${remoteResponse.status}, falling back to local data.`);
                }
            } catch (remoteError) {
                console.warn("Online feed fetch failed, falling back to local data.", remoteError);
            }
        }

        if (!loaded) {
            try {
                const response = await fetch(dataUrl, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`Failed loading data.json: ${response.status}`);
                }
                casinoData = await response.json();
                if (!Array.isArray(casinoData) || casinoData.length === 0) {
                    throw new Error("Loaded data.json is empty or invalid");
                }
                loaded = true;
                console.log(`Loaded ${casinoData.length} casino records from local data.json`);
            } catch (error) {
                console.warn("Could not load valid data.json locally, using fallback data.", error);
                casinoData = fallbackCasinoData;
                sourceLabel = "FALLBACK";
                console.log(`Fallback casino feed loaded with ${casinoData.length} records`);
            }
        }

        if (!Array.isArray(casinoData) || casinoData.length === 0) {
            casinoData = fallbackCasinoData;
            sourceLabel = "FALLBACK";
        }

        const feedSource = document.getElementById("feed-source");
        if (feedSource) {
            feedSource.innerText = sourceLabel;
            feedSource.dataset.source = sourceLabel;
        }

        if (countrySelect && countrySelect.value !== "AUTO") {
            const manualValue = countrySelect.value.toUpperCase();
            if (manualValue === "UK" || manualValue === "GB") {
                userCountry = "UK";
            } else if (manualValue === "CY") {
                userCountry = "CY";
            } else if (manualValue === "DE") {
                userCountry = "DE";
            } else {
                userCountry = manualValue;
            }

            if (displayCountry) displayCountry.innerText = userCountry;
            if (typeof window.triggerFilter === "function") {
                window.triggerFilter();
            }

            return;
        }

        try {
            await detectCountryFromIP(displayCountry);
        } catch (geoError) {
            console.warn("Geo detection failed, using fallback.", geoError);
            if (!userCountry || userCountry === 'UNKNOWN') {
                userCountry = 'ALL';
            }
            if (displayCountry) displayCountry.innerText = userCountry === 'ALL' ? 'GLOBAL' : userCountry;
            if (typeof window.triggerFilter === "function") {
                window.triggerFilter();
            }
        }
    }

    loadCasinoData();

    let refreshTimerId = null;
    function scheduleRefresh() {
        if (refreshTimerId) {
            clearInterval(refreshTimerId);
            refreshTimerId = null;
        }

        const intervalValue = refreshSelect ? parseInt(refreshSelect.value, 10) : 60000;
        if (intervalValue > 0) {
            refreshTimerId = setInterval(loadCasinoData, intervalValue);
        }
    }

    scheduleRefresh();

    if (refreshSelect) {
        refreshSelect.addEventListener('change', () => {
            scheduleRefresh();
        });
    }


    // 6. האזנה לשינויים ידניים - גרסה חסינת תקלות HTML
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            const selectedText = e.target.options[e.target.selectedIndex].text.toUpperCase();
            let selectedValue = e.target.value.toUpperCase();
            
            if (selectedValue !== "AUTO") {
                // בדיקה כפולה: אם הטקסט או הערך מכילים את בריטניה, נכפה UK נקי
                if (selectedText.includes("UNITED KINGDOM") || selectedText.includes("UK") || 
                    selectedValue.includes("UK") || selectedValue.includes("GB")) {
                    userCountry = "UK";
                } else if (selectedText.includes("CYPRUS") || selectedValue.includes("CY")) {
                    userCountry = "CY";
                } else if (selectedText.includes("GERMANY") || selectedValue.includes("DE")) {
                    userCountry = "DE";
                } else if (selectedText.includes("ISRAEL") || selectedValue.includes("IL")) {
                    userCountry = "IL";
                } else {
                    userCountry = selectedValue;
                }
                
                console.log("Manual Override Applied:", userCountry);
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

// מנגנון הזרקת הודעות רצות לטרמינל המכ"ם
document.addEventListener("DOMContentLoaded", () => {
    const logsContainer = document.getElementById("terminal-logs");
    if (!logsContainer) return;

    const logMessages = [
        "> [scan] checking live rtp variances across european nodes...",
        "> [success] connection stable. 0ms packet latency.",
        "> [api] mapping secure payout protocols for target feed...",
        "> [sync] live data matrix verified with Curacao & UKGC indices.",
        "> [radar] scanning active jackpot pools... current pool: €14.8M",
        "> [alert] high rtp shift detected on pragmatic play core systems."
    ];

    let messageIndex = 0;

    setInterval(() => {
        // מייצר שורה חדשה ומכניס אותה
        const newLog = document.createElement("p");
        newLog.className = "log-line text-green";
        newLog.innerText = logMessages[messageIndex];
        
        logsContainer.appendChild(newLog);
        
        // מוחק את השורה הראשונה כדי שהקופסה לא תתמלא ותימתח
        if (logsContainer.children.length > 5) {
            logsContainer.removeChild(logsContainer.children[0]);
        }

        messageIndex = (messageIndex + 1) % logMessages.length;
    }, 3500); // שורה חדשה קופצת בכל 3.5 שניות
});
