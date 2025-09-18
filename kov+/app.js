let currentLang = 'fr';
emailjs.init("Et3ZSIseKRuttWEi-"); // Replace with your EmailJS user ID

function setLang(lang) {
  currentLang = lang;
  fetch('lang.json')
    .then(res => res.json())
    .then(data => {
      document.getElementById('title').innerText = data[lang].title;
      document.getElementById('labelStart').innerText = data[lang].labelStart;
      document.getElementById('labelCycle').innerText = data[lang].labelCycle;
      document.getElementById('labelAge').innerText = data[lang].labelAge;
      document.getElementById('btnCalc').innerText = data[lang].btnCalc;
    });
}

function formatDate(date) {
  return date.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function calculerCycl() {
  const startDate = new Date(document.getElementById("startDate").value);
  const cycleLength = parseInt(document.getElementById("cycleLength").value);
  const age = parseInt(document.getElementById("userAge").value);
  const resultDiv = document.getElementById("result");

  if (!startDate || isNaN(cycleLength)) {
    resultDiv.innerHTML = "<p>Veuillez entrer une date et une durée valide.</p>";
    return;
  }

  const jours = [];
  for (let i = 0; i < cycleLength; i++) {
    const jour = new Date(startDate);
    jour.setDate(jour.getDate() + i);
    jours.push(jour);
  }

  const ovulation = jours[cycleLength - 14];
  const fertileStart = jours[cycleLength - 16];
  const fertileEnd = jours[cycleLength - 11];

  let conseil = "";
  if (age < 18) conseil = "Cycle souvent irrégulier à cet âge.";
  else if (age > 45) conseil = "Cycle potentiellement irrégulier en pré-ménopause.";
  else conseil = "Cycle régulier estimé.";

  resultDiv.innerHTML = `
    <p><strong>Cycle :</strong> du ${formatDate(jours[0])} au ${formatDate(jours[jours.length - 1])}</p>
    <p><strong>Ovulation estimée :</strong> ${formatDate(ovulation)}</p>
    <p><strong>Période fertile :</strong> du ${formatDate(fertileStart)} au ${formatDate(fertileEnd)}</p>
    <p><strong>Conseil :</strong> ${conseil}</p>
  `;

  drawChart(jours, fertileStart, fertileEnd, ovulation);
}

function calculerCycle() {
  const startDate = new Date(document.getElementById("startDate").value);
  const cycleLength = parseInt(document.getElementById("cycleLength").value);
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const days = [];
  for (let i = 0; i < cycleLength; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  days.forEach((day, i) => {
    const div = document.createElement("div");
    div.className = "calendar-day";

    // Règles : jours 1 à 5
    if (i < 5) div.classList.add("day-period");

    // Ovulation : jour 14
    if (i === 14) div.classList.add("day-ovulation");

    // Fertilité : jours 12 à 16
    if (i >= 12 && i <= 16) div.classList.add("day-fertile");

    div.textContent = day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    calendar.appendChild(div);
  });

  document.getElementById("result").innerHTML = `<p>Cycle calculé du ${days[0].toLocaleDateString()} au ${days[cycleLength - 1].toLocaleDateString()}</p>`;
  const age = parseInt(document.getElementById("userAge").value);
  const resultDiv = document.getElementById("result");

  if (!startDate || isNaN(cycleLength)) {
    resultDiv.innerHTML = "<p>Veuillez entrer une date et une durée valide.</p>";
    return;
  }

  const jours = [];
  for (let i = 0; i < cycleLength; i++) {
    const jour = new Date(startDate);
    jour.setDate(jour.getDate() + i);
    jours.push(jour);
  }

  const ovulation = jours[cycleLength - 14];
  const fertileStart = jours[cycleLength - 16];
  const fertileEnd = jours[cycleLength - 11];

  let conseil = "";
  if (age < 18) conseil = "Cycle souvent irrégulier à cet âge.";
  else if (age > 45) conseil = "Cycle potentiellement irrégulier en pré-ménopause.";
  else conseil = "Cycle régulier estimé.";

  resultDiv.innerHTML = `
    <p><strong>Cycle :</strong> du ${formatDate(jours[0])} au ${formatDate(jours[jours.length - 1])}</p>
    <p><strong>Ovulation estimée :</strong> ${formatDate(ovulation)}</p>
    <p><strong>Période fertile :</strong> du ${formatDate(fertileStart)} au ${formatDate(fertileEnd)}</p>
    <p><strong>Conseil :</strong> ${conseil}</p>
  `;

  drawChart(jours, fertileStart, fertileEnd, ovulation);

}


function drawChart(jours, fertileStart, fertileEnd, ovulation) {
  const ctx = document.getElementById('cycleChart').getContext('2d');
  const labels = jours.map(j => formatDate(j));
  const data = jours.map(j => {
    if (j >= fertileStart && j <= fertileEnd) return 2;
    if (j.toDateString() === ovulation.toDateString()) return 3;
    return 1;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cycle',
        data: data,
        backgroundColor: data.map(v =>
          v === 3 ? 'red' : v === 2 ? 'orange' : '#8e44ad'
        )
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { display: false }
      }
    }
  });
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("KOV+ - Suivi du Cycle", 10, 10);
  doc.text(document.getElementById("result").innerText, 10, 20);
  doc.save("cycle.pdf");
}


  
function sendEmail() {
  const userEmail = document.getElementById("userEmail").value;
  const message = document.getElementById("result").innerText;

  if (!userEmail) {
    alert("Veuillez entrer une adresse email valide.");
    return;
  }

  const params = {
    to_name: "Utilisatrice de KOV+",
    from_name: "KOVplus Entreprise",
    message: message,
    user_email: userEmail // ← ce champ doit exister dans ton template EmailJS
  };

  emailjs.send("service_q6row0w", "template_u1ixycb", params)
    .then(() => {
      document.getElementById("emailSuccessModal").style.display = "flex";
      // 📤 Enregistrement dans Google Sheets via Apps Script
      fetch("https://script.google.com/macros/s/AKfycbxd13mLIvtbenBqJ_dnJjegOm78XaVJEks114aID1UPC08LyoLIXUwaoaGvbwn_B_Cpfw/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, message: message })
    });
      .then(res => {
        if (res.ok) {
          console.log("✅ Email enregistré dans Google Sheets");
        } else {
          console.warn("⚠️ Échec d'enregistrement dans Sheets");
        }
      });
    }, (err) => {
      console.error("Erreur EmailJS :", err);
      alert("❌ Échec de l'envoi : " + err.text);
    });
}
fetch("save_email.php", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: `email=${encodeURIComponent(user_email)}&message=${encodeURIComponent(message)}`
});

function closeModal() {
  document.getElementById("emailSuccessModal").style.display = "none";
}


























