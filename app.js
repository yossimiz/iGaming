    
document.addEventListener("DOMContentLoaded", () => {
    const dataUrl = "./data.json"; 
    const loadingElement = document.getElementById("loading");
    const tableElement = document.getElementById("casino-table");
    const tableBody = document.getElementById("table-body");

    // מנגנון אימות גיל רגולטורי
    const ageGate = document.getElementById("age-gate");
    const ageAccept = document.getElementById("age-accept");
    const ageReject = document.getElementById("age-reject");

    // בדיקה האם הגולש כבר אישר בעבר שהוא בן 18+
    if (localStorage.getItem("age_verified") === "true") {
        ageGate.style.display = "none";
    }

    ageAccept.addEventListener("click", () => {
        localStorage.setItem("age_verified", "true");
        ageGate.style.display = "none";
    });

    ageReject.addEventListener("click", () => {
        window.location.href = "https://google.com"; // זריקת משתמש קטין מחוץ לאתר
    });

        // ... כאן ממשיך שאר קוד ה-fetch והמיון שכבר כתבנו בשלב הקודם ...
    fetch(dataUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = "none";
            tableElement.style.display = "table";
            tableBody.innerHTML = "";

            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><strong>${item.casino_name}</strong></td>
                    <td>${item.bonus_text}</td>
                    <td><span class="rtp-badge">${item.rtp_score}</span></td>
                    <td>
                        <a href="${item.affiliate_link}" target="_blank" rel="nofollow noopener" class="btn-play">Claim Bonus</a>
                        <span class="regulatory-text">${item.regulatory_text}</span>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading casino data:", error);
            loadingElement.innerText = "Failed to load live data. Please try refreshing the page.";
        });
});
