import os
import json
import requests
from datetime import datetime

def get_twitch_token(client_id, client_secret):
    auth_url = "https://id.twitch.tv/oauth2/token"
    auth_params = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials"
    }
    
    response = requests.post(auth_url, params=auth_params)
    return response.json()["access_token"]

def get_user_id(client_id, access_token, username="mventoline"):
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"https://api.twitch.tv/helix/users?login={username}",
        headers=headers
    )
    data = response.json()
    return data["data"][0]["id"]

def get_clips(client_id, access_token, broadcaster_id, limit=100):
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(
        f"https://api.twitch.tv/helix/clips?broadcaster_id={broadcaster_id}&first={limit}",
        headers=headers
    )
    return response.json()["data"]

def update_clips_json(clips_data):
    clips_list = []
    for clip in clips_data:
        clips_list.append({
            "id": clip["id"],
            "title": clip["title"],
            "created_at": clip["created_at"],
            "url": clip["url"]
        })
    
    # Trier les clips par date de création (plus récent en premier)
    clips_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Créer le dictionnaire final
    output = {
        "last_updated": datetime.now().isoformat(),
        "clips": clips_list
    }
    
    # Sauvegarder dans le fichier
    with open("clips.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

def main():
    # Récupérer les credentials depuis les variables d'environnement
    client_id = os.getenv("TWITCH_CLIENT_ID")
    client_secret = os.getenv("TWITCH_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("Erreur: TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET doivent être définis")
        return
    
    try:
        print("Obtention du token d'accès...")
        access_token = get_twitch_token(client_id, client_secret)
        
        print("Récupération de l'ID utilisateur...")
        user_id = get_user_id(client_id, access_token)
        
        print("Récupération des clips...")
        clips = get_clips(client_id, access_token, user_id)
        
        print(f"Mise à jour du fichier clips.json avec {len(clips)} clips...")
        update_clips_json(clips)
        
        print("Mise à jour terminée avec succès!")
        
    except Exception as e:
        print(f"Une erreur est survenue: {str(e)}")

if __name__ == "__main__":
    main() 