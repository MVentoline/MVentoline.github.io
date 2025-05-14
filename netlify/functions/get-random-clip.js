const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Vérification de la méthode
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Les clés d'API sont stockées dans les variables d'environnement Netlify
    const clientId = process.env.TWITCH_CLIENT_ID;
    const accessToken = process.env.TWITCH_ACCESS_TOKEN;
    
    // Obtenir l'ID de la chaîne
    const userRes = await fetch('https://api.twitch.tv/helix/users?login=mventoline', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const userData = await userRes.json();
    const userId = userData.data[0].id;

    // Récupérer les clips
    const clipRes = await fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=20`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const clipData = await clipRes.json();

    if (!clipData.data || clipData.data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Aucun clip trouvé' })
      };
    }

    // Sélectionner un clip aléatoire
    const randomClip = clipData.data[Math.floor(Math.random() * clipData.data.length)];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Autoriser les deux domaines
        'Access-Control-Allow-Origin': event.headers.origin,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        clipId: randomClip.id
      })
    };

  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur' })
    };
  }
}; 