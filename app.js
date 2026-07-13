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

    let casinoData = []; 
    let filteredData = []; 
    let userCountry = "UNKNOWN";

    // =========================================================
    // 1. מנגנון אימות גיל (18+) - רץ עצמאי ומיידי ללא תלות בשרת
    // =========================================================
    if (localStorage.getItem("age_verified") === "true") {
        if (ageGate) ageGate.style.display = "none";
    } else {
        if (ageGate) ageGate.style.display = "flex";
    }

    if (ageAccept) {
        ageAccept.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation(); // מונע מהאירוע להיתקע
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

    // =========================================================
    // 2. פונקציות הזרקה וסינון נתונים
    // =========================================================
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

    function filterAndProcessData() {
        if (displayCountry) displayCountry.innerText = userCountry;
        
        // עדכון המשחק החם בכרטיס העליון
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

        // סינון המותגים מתוך ה-JSON
        filteredData = casinoData.filter(item => {
            if (!item.allowed_countries) return false; 
            return item.allowed_countries.includes(userCountry);
        });

        if (loadingElement) loadingElement.style.display = "none";
        if (tableElement) tableElement.style.display = "table";
        
        renderTable(filteredData);
    }

    // =========================================================
    // 3. מנוע טעינת הנתונים מה-JSON וזיהוי ה-IP
    // =========================================================
    fetch("https://ipapi.co")
        .then(res => res.json())
        .then(geo => {
            if (geo && geo.country_code) {
                userCountry = geo.country_code.toUpperCase();
                if (userCountry === "GB") userCountry = "UK";
            }
            return fetch(dataUrl);
        })
        .catch(() => {
            userCountry = "UNKNOWN";
            return fetch(dataUrl);
        })
        .then(response => response.json())
        .then(data => {
            casinoData = data;
            filterAndProcessData();
        })
        .catch(error => {
            console.error("Critical System Error:", error);
            if (loadingElement) {
                loadingElement.innerHTML = `<span style="color: #ef4444;">Failed to sync with live data matrix.</span>`;
            }
        });

    // =========================================================
    // 4. האזנה לשינויים (מיון ומדינה ידנית)
    // =========================================================
    if (countrySelect) {
        countrySelect.addEventListener("change", (e) => {
            const selected = e.target.value;
            if (selected !== "AUTO") {
                userCountry = selected;
                filterAndProcessData();
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
});
