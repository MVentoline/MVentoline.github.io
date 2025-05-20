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

// Fonction pour tronquer le texte
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  
  // Trouver le dernier espace avant maxLength pour couper proprement
  const truncated = text.substr(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substr(0, lastSpace) + '...';
}

fetch("https://api.rss2json.com/v1/api.json?rss_url=https://letterboxd.com/Ventoline_Yohan/rss/")
  .then(response => response.json())
  .then(data => {
    console.log("Données reçues :", data);

    const reviewContainer = document.getElementById("letterboxd-review");

    if (!data.items || data.items.length === 0) {
      reviewContainer.textContent = "Flux vide ou erreur dans les données.";
      return;
    }

    const latestReview = data.items[0];
    const maxLength = 500; // Augmentation de la limite de caractères pour correspondre au bot Letterboxd

    // Crée un conteneur temporaire pour modifier le HTML de la description
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = latestReview.description;

    // Sélectionne toutes les images dans la description et applique des styles
    const images = tempDiv.querySelectorAll("img");
    images.forEach(img => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "8px";
      img.style.display = "block";
      img.style.margin = "0 auto";
    });

    // Trouve la première image et la sépare
    const img = tempDiv.querySelector("img");
    const imgHTML = img ? `<img src="${img.src}" alt="Affiche du film">` : "";

    // Supprime l'image du contenu textuel
    if (img) {
      img.remove();
    }

    // Récupère le texte et le tronque
    const text = tempDiv.innerHTML;
    const isTruncated = text.length > maxLength;
    const truncatedText = truncateText(text, maxLength);

    // Structure texte dans un conteneur séparé
    const textHTML = `
      <div class="review-text">
        <strong>${latestReview.title}</strong><br>
        <a href="${latestReview.link}" target="_blank">${isTruncated ? 'Voir la critique complète sur Letterboxd' : 'Voir la critique sur Letterboxd'}</a><br>
        <div class="review-content">
          <div class="truncated-text">${truncatedText}</div>
        </div>
        <em>Publié le ${new Date(latestReview.pubDate).toLocaleDateString()}</em>
      </div>
    `;

    // Injecte image + texte côte à côte
    reviewContainer.innerHTML = `
      ${imgHTML}
      ${textHTML}
    `;
  })
  .catch(error => {
    console.error("Erreur lors du chargement de la critique :", error);
    document.getElementById("letterboxd-review").textContent = "Impossible de charger la critique.";
  });
