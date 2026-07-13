document.addEventListener("DOMContentLoaded", () => {
    const dataUrl = "data.json"; 
    const loadingElement = document.getElementById("loading");
    const tableElement = document.getElementById("casino-table");
    const tableBody = document.getElementById("table-body");
    const sortSelect = document.getElementById("sort-select");
    
    const ageGate = document.getElementById("age-gate");
    const ageAccept = document.getElementById("age-accept");
    const ageReject = document.getElementById("age-reject");

    let casinoData = []; 
    let filteredData = []; 
    let userCountry = "UNKNOWN";

    // 1. מנגנון אימות גיל (18+)
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

    // 2. פונקציה להזרקת הטבלה ל-HTML
    function renderTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color:#94a3b8;">No regulated brands available in your region (${userCountry}) yet.</td></tr>`;
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

    // 3. מנוע זיהוי ה-IP המקצועי באמצעות ה-JSON הרשמי של Cloudflare (ללא פירוק טקסט)
    fetch("https://cloudflare.com")
        .then(res => {
            if (!res.ok) throw new Error("Cloudflare Trace Offline");
            return res.text();
        })
        .then(text => {
            // הפיכת הטקסט של קלאודפלייר לאובייקט בצורה בטוחה
            const lines = text.split("\n");
            for (let line of lines) {
                const parts = line.split("=");
                if (parts[0] === "loc") {
                    userCountry = parts[1].trim().toUpperCase();
                    break;
                }
            }
            
            if (userCountry === "GB") userCountry = "UK";
            console.log("Cloudflare Geo-IP detected:", userCountry);
            
            return fetch(dataUrl);
        })
        .catch(err => {
            console.error("Geo Matrix Error, falling back to default.", err);
            userCountry = "UNKNOWN"; 
            return fetch(dataUrl);
        })
        .then(response => {
            if (!response.ok) throw new Error("Database offline");
            return response.json();
        })
        .then(data => {
            casinoData = data;
            
            // סינון קפדני לפי המדינה של הגולש
            filteredData = casinoData.filter(item => {
                if (!item.allowed_countries) return false; 
                return item.allowed_countries.includes(userCountry);
            });

            if (loadingElement) loadingElement.style.display = "none";
            if (tableElement) tableElement.style.display = "table";
            
            renderTable(filteredData);
        })
        .catch(error => {
            console.error("Critical System Error:", error);
            if (loadingElement) {
                loadingElement.innerHTML = `<span style="color: #ef4444;">Failed to sync with live data matrix. Please retry.</span>`;
            }
        });

    // 4. מנגנון מיון
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
