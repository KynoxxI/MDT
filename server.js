// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();

// ⚠️ Ton Client ID et ton Client Secret
const CLIENT_ID = "1445998594955022408";
const CLIENT_SECRET = "c_Z7CYZBRVSF0QfjJftbbIhzTXupMfUS";
const REDIRECT_URI = "https://kynoxxi.github.io/MDT/"; // doit correspondre au Developer Portal

// Route de callback appelée par Discord après la connexion
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Pas de code reçu");

  try {
    // Échange du code contre un token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Impossible d'obtenir un token", details: tokenData });
    }

    // Récupération des infos utilisateur
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResponse.json();

    // Retourne les infos au frontend
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur OAuth2 lancé sur http://localhost:${PORT}`));
