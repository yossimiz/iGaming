document.addEventListener("DOMContentLoaded", () => {
    const dataUrl = "./data.json"; 
    const loadingElement = document.getElementById("loading");
    const tableElement = document.getElementById("casino-table");
    const tableBody = document.getElementById("table-body");

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
