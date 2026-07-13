document.addEventListener("DOMContentLoaded", () => {
    // 1. הגדרות ורכיבי הממשק
    const dataUrl = "./data.json"; 
    const loadingElement = document.getElementById("loading");
    const tableElement = document.getElementById("casino-table");
    const tableBody = document.getElementById("table-body");
    const sortSelect = document.getElementById("sort-select");
    
    // מנגנון אימות גיל רגולטורי
    const ageGate = document.getElementById("age-gate");
    const ageAccept = document.getElementById("age-accept");
    const ageReject = document.getElementById("age-reject");

    let casinoData = []; // משתנה גלובלי לשמירת הנתונים לצורך מיון מהיר

    // 2. הפעלת חלון אימות הגיל (18+) - בדיקה מיידית
    if (localStorage.getItem("age_verified") === "true") {
        if (ageGate) ageGate.style.display = "none";
    } else {
        if (ageGate) ageGate.style.display = "flex"; // מוודא שהחלון נעול ומוצג
    }

    if (ageAccept) {
        ageAccept.addEventListener("click", (e) => {
            e.preventDefault(); // מונע באגים של רענון דף
            localStorage.setItem("age_verified", "true");
            if (ageGate) ageGate.style.display = "none";
        });
    }

    if (ageReject) {
        ageReject.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "https://www.google.com"; // הפניית קטינים החוצה מהאתר
        });
    }

    // 3. פונקציה לבנייה והזרקה של הטבלה המקצועית ל-HTML
    function renderTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <span class="casino-name">${item.casino_name}</span>
                </td>
                <td>
                    <span class="bonus-badge">${item.bonus_text}</span>
                </td>
                <td>
                    <div class="rtp-container">
                        <span class="live-dot"></span>
                        <span class="rtp-badge">${item.rtp_score}</span>
                    </div>
                </td>
                <td>
                    <a href="${item.affiliate_link}" target="_blank" rel="nofollow noopener" class="btn-play">
                        Claim Access
                    </a>
                    <span class="regulatory-text">${item.regulatory_text}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 4. mשיכת הנתונים האמיתיים מקובץ ה-JSON
    fetch(dataUrl)
        .then(response => {
            if (!response.ok) throw new Error("Database offline");
            return response.json();
        })
        .then(data => {
            casinoData = data;
            if (loadingElement) loadingElement.style.display = "none";
            if (tableElement) tableElement.style.display = "table";
            renderTable(casinoData);
        })
        .catch(error => {
            console.error("Critical System Error:", error);
            if (loadingElement) {
                loadingElement.innerHTML = `<span style="color: #ef4444;">Failed to sync with live data matrix. Please retry.</span>`;
            }
        });

    // 5. מנגנון האזנה לשינויים בסרגל המיון
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            const value = e.target.value;
            let sortedData = [...casinoData];

            if (value === "rtp-desc") {
                sortedData.sort((a, b) => parseFloat(b.rtp_score) - parseFloat(a.rtp_score));
            } else if (value === "name-asc") {
                sortedData.sort((a, b) => a.casino_name.localeCompare(b.casino_name));
            } else {
                sortedData = casinoData;
            }
            
            renderTable(sortedData);
        });
    }
});
