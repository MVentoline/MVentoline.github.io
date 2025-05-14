document.getElementById("name").textContent = profileData.name;
document.getElementById("bio").textContent = profileData.bio;
document.getElementById("profile-img").src = profileData.avatarUrl;
document.getElementById("footer-name").textContent = profileData.name;
document.getElementById("year").textContent = new Date().getFullYear();

const linksContainer = document.getElementById("links-container");

profileData.links.forEach(link => {
  const a = document.createElement("a");
  a.href = link.url;
  a.textContent = link.label;
  a.target = "_blank";

  // Ajoute une classe si elle est spécifiée dans les données
  if (link.className) {
    a.classList.add(link.className);
  }

  linksContainer.appendChild(a);
});
fetch("https://api.rss2json.com/v1/api.json?rss_url=https://letterboxd.com/Ventoline_Yohan/rss/")
  .then(response => response.json())
  .then(data => {
    console.log("Données reçues :", data); // 🔍 debug ici

    const reviewContainer = document.getElementById("letterboxd-review");

    if (!data.items || data.items.length === 0) {
      reviewContainer.textContent = "Flux vide ou erreur dans les données.";
      return;
    }

    const latestReview = data.items[0];
    reviewContainer.innerHTML = `
      <strong>${latestReview.title}</strong><br>
      <a href="${latestReview.link}" target="_blank">Voir la critique sur Letterboxd</a><br>
      <p>${latestReview.description}</p>
      <em>Publié le ${new Date(latestReview.pubDate).toLocaleDateString()}</em>
    `;
  })
  .catch(error => {
    console.error("Erreur lors du chargement de la critique :", error);
    document.getElementById("letterboxd-review").textContent = "Impossible de charger la critique.";
  });

