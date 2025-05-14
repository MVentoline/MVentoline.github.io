const fetch = require('node-fetch');

// En-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function(event, context) {
  // Gérer les requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const accessToken = process.env.TWITCH_ACCESS_TOKEN;

    if (!clientId || !accessToken) {
      console.error('Variables d\'environnement manquantes');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Configuration incorrecte' })
      };
    }

    console.log('Tentative de récupération de l\'ID utilisateur');
    const userRes = await fetch('https://api.twitch.tv/helix/users?login=mventoline', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userRes.ok) {
      const error = await userRes.text();
      console.error('Erreur Twitch API (users):', error);
      return {
        statusCode: userRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Erreur API Twitch',
          details: error
        })
      };
    }

    const userData = await userRes.json();
    console.log('Réponse utilisateur:', userData);

    if (!userData.data || userData.data.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
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

    if (!clipRes.ok) {
      const error = await clipRes.text();
      console.error('Erreur Twitch API (clips):', error);
      return {
        statusCode: clipRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Erreur API Twitch',
          details: error
        })
      };
    }

    const clipData = await clipRes.json();
    console.log('Nombre de clips trouvés:', clipData.data ? clipData.data.length : 0);

    if (!clipData.data || clipData.data.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Aucun clip trouvé' })
      };
    }

    const randomClip = clipData.data[Math.floor(Math.random() * clipData.data.length)];
    console.log('Clip sélectionné:', randomClip.id);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clipId: randomClip.id
      })
    };

  } catch (error) {
    console.error('Erreur détaillée:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        details: error.message 
      })
    };
  }
}; 