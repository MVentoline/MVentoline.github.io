const fetch = require('node-fetch');

// En-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function(event, context) {
  console.log('Fonction appelée avec l\'origine:', event.headers.origin);
  console.log('Headers de la requête:', JSON.stringify(event.headers, null, 2));

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

    console.log('Vérification des variables d\'environnement:');
    console.log('Client ID présent:', !!clientId);
    console.log('Access Token présent:', !!accessToken);

    if (!clientId || !accessToken) {
      console.error('Variables d\'environnement manquantes');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Configuration incorrecte',
          details: 'Variables d\'environnement Twitch manquantes'
        })
      };
    }

    console.log('Tentative de récupération de l\'ID utilisateur');
    const userRes = await fetch('https://api.twitch.tv/helix/users?login=mventoline', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userResText = await userRes.text();
    console.log('Réponse brute de l\'API Twitch (users):', userResText);

    if (!userRes.ok) {
      console.error('Erreur API Twitch (users):', {
        status: userRes.status,
        statusText: userRes.statusText,
        response: userResText
      });
      return {
        statusCode: userRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Erreur API Twitch',
          details: `Status: ${userRes.status}, Response: ${userResText}`
        })
      };
    }

    const userData = JSON.parse(userResText);
    console.log('Données utilisateur parsées:', userData);

    if (!userData.data || userData.data.length === 0) {
      console.error('Utilisateur non trouvé dans la réponse');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Utilisateur non trouvé',
          details: 'L\'utilisateur mventoline n\'existe pas sur Twitch'
        })
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

    const clipResText = await clipRes.text();
    console.log('Réponse brute de l\'API Twitch (clips):', clipResText);

    if (!clipRes.ok) {
      console.error('Erreur API Twitch (clips):', {
        status: clipRes.status,
        statusText: clipRes.statusText,
        response: clipResText
      });
      return {
        statusCode: clipRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Erreur API Twitch',
          details: `Status: ${clipRes.status}, Response: ${clipResText}`
        })
      };
    }

    const clipData = JSON.parse(clipResText);
    console.log('Nombre de clips trouvés:', clipData.data ? clipData.data.length : 0);

    if (!clipData.data || clipData.data.length === 0) {
      console.log('Aucun clip trouvé pour l\'utilisateur');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Aucun clip trouvé',
          details: 'Aucun clip n\'est disponible pour cet utilisateur'
        })
      };
    }

    const randomClip = clipData.data[Math.floor(Math.random() * clipData.data.length)];
    console.log('Clip sélectionné:', {
      id: randomClip.id,
      title: randomClip.title,
      url: randomClip.url
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clipId: randomClip.id,
        clipInfo: {
          title: randomClip.title,
          url: randomClip.url
        }
      })
    };

  } catch (error) {
    console.error('Erreur détaillée:', {
      message: error.message,
      stack: error.stack
    });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 