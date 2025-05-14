const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log('Fonction appelée');

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const accessToken = process.env.TWITCH_ACCESS_TOKEN;
    
    console.log('Tentative de récupération de l\'ID utilisateur');
    const userRes = await fetch('https://api.twitch.tv/helix/users?login=mventoline', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const userData = await userRes.json();
    console.log('Réponse utilisateur:', userData);

    if (!userData.data || userData.data.length === 0) {
      console.error('Utilisateur non trouvé');
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Utilisateur non trouvé' })
      };
    }

    const userId = userData.data[0].id;
    console.log('ID utilisateur trouvé:', userId);

    console.log('Tentative de récupération des clips');
    const clipRes = await fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=20`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const clipData = await clipRes.json();
    console.log('Nombre de clips trouvés:', clipData.data ? clipData.data.length : 0);

    if (!clipData.data || clipData.data.length === 0) {
      console.log('Aucun clip trouvé');
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Aucun clip trouvé' })
      };
    }

    const randomClip = clipData.data[Math.floor(Math.random() * clipData.data.length)];
    console.log('Clip sélectionné:', randomClip.id);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        clipId: randomClip.id
      })
    };

  } catch (error) {
    console.error('Erreur détaillée:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        details: error.message 
      })
    };
  }
}; 