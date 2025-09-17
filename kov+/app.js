let currentLang = 'fr';

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

function calculerCycle() {
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
  const doc = new jsPDF();
  doc.text(document.getElementById("result").innerText, 10, 10);
  doc.save("cycle_kovplus.pdf");
}

function sendEmail() {
  emailjs.init("YOUR_EMAILJS_USER_ID"); // Replace with your EmailJS user ID
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    message: document.getElementById("result").innerText
  }).then(() => {
    alert("Email envoyé !");
  }, (err) => {
    alert("Erreur d'envoi : " + JSON.stringify(err));
  });
}
