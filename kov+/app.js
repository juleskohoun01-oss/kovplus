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
  openCarouselModal(); // à la fin de calculerCycle()
  updateCycleImages(jours, ovulation, fertileStart, fertileEnd)
    // ✅ Export automatique du fichier XML
  exporterCycleXML();

}


function updateCycleImages(jours, ovulation, fertileStart, fertileEnd) {
  const track = document.getElementById('carouselTrack');
  track.innerHTML = '';

  jours.forEach((jour, i) => {
    const img = document.createElement('img');
    img.alt = `Jour ${i + 1}`;

    if (jour.toDateString() === ovulation.toDateString()) {
      img.src = "ovulation.jpg";
      img.alt += " - Ovulation";
    } else if (jour >= fertileStart && jour <= fertileEnd) {
      img.src = "fertile.jpg";
      img.alt += " - Fertilité";
    } else {
      img.src = "normal.jpg";
      img.alt += " - Jour normal";
    }

    track.appendChild(img);
    const caption = document.createElement('p');
    caption.textContent = img.alt;
    caption.className = "carousel-caption"; // pour le styliser
    track.appendChild(caption);
  });

  currentIndex = 0;
  updateCarousel();
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
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Cycle menstruel',
      data: data,
      borderColor: '#3498db', // Bleu doux pour la ligne
      backgroundColor: 'rgba(52, 152, 219, 0.2)', // Bleu clair transparent
      pointBackgroundColor: data.map(v =>
        v === 3 ? '#e74c3c' : v === 2 ? '#f39c12' : '#3498db'
      ),
      pointRadius: 5,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            if (value === 3) return 'Ovulation';
            if (value === 2) return 'Période fertile';
            return 'Jour du cycle';
          }
        }
      }
    },
    scales: {
      y: { display: false },
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
          color: '#2c3e50' // Couleur foncée pour les dates
        }
      }
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
    user_email: userEmail
  };

  emailjs.send("service_q6row0w", "template_u1ixycb", params)
    .then(() => {
      document.getElementById("emailSuccessModal").style.display = "flex";

      // ✅ Enregistrement dans Google Sheets via Apps Script
      const formData = new URLSearchParams();
      formData.append("email", userEmail);
      formData.append("message", message);

      fetch("https://script.google.com/macros/s/AKfycbyvBoWSvo4eNFkouPWm7W0nKOwm7KsI6UzSybtjejATJ2Oyfgal1UwtwpMrYl0na86_VA/exec", {
        method: "POST",
        body: formData
      })
      .then(res => res.text())
      .then(data => console.log("✅ Réponse du script :", data))
      .catch(err => console.error("❌ Erreur :", err));
    })
    .catch(err => {
      console.error("❌ Erreur EmailJS :", err);
      alert("Échec de l'envoi : " + err.text);
    });
}

window.onload = function () {
  const now = new Date().toUTCString();
  document.cookie = "lastVisit=" + now + "; path=/";
};

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const lastVisit = getCookie("lastVisit");
if (lastVisit) {
  document.getElementById("visitInfo").textContent = "Dernière visite : " + lastVisit;
}


function closeModal() {
  document.getElementById("emailSuccessModal").style.display = "none";
}

function exporterCycleXML() {
  // 1️⃣ Données de l'utilisatrice
const utilisateur = {
  age: parseInt(document.getElementById("userAge").value),
  cycle: {
    dateDebut: parseInt(document.getElementById("startDate").value),
    duree: parseInt(document.getElementById("cycleLength").value),
    ovulation: calculerDate(startDateStr, 14),
    fertile: {
      debut: calculerDate(startDateStr, 12),
      fin: calculerDate(startDateStr, 16)
    }
  }
};

  // 2️⃣ Générer le contenu XML
const xmlContent = `
<utilisatrice>
  <age>${utilisateur.age}</age>
  <cycle>
    <dateDebut>${utilisateur.cycle.dateDebut}</dateDebut>
    <duree>${utilisateur.cycle.duree}</duree>
    <ovulation>${utilisateur.cycle.ovulation}</ovulation>
    <fertile>
      <debut>${utilisateur.cycle.fertile.debut}</debut>
      <fin>${utilisateur.cycle.fertile.fin}</fin>
    </fertile>
  </cycle>
</utilisatrice>
`.trim();

  // 3️⃣ Créer et télécharger le fichier XML
  const blob = new Blob([xmlContent], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cycle.xml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 🔧 Fonction utilitaire pour calculer une date + décalage
function calculerDate(dateStr, offset) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0]; // format YYYY-MM-DD
}


















































