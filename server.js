// server.js
import express from "express";
import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();

// =========================
// Config OAuth2 Discord
// =========================
const CLIENT_ID = "1445998594955022408";
const CLIENT_SECRET = "c_Z7CYZBRVSF0QfjJftbbIhzTXupMfUS";
const REDIRECT_URI = "https://kynoxxi.github.io/MDT/";

// =========================
// Config Bot Discord
// =========================
const BOT_TOKEN = "MTQ0NTk5ODU5NDk1NTAyMjQwOA.G3NfP8.c8tXfbfPJfWBy1vjnxrY_IQmKUB315xnWEBcnQ";
const CHANNEL_ID = "1446588001193955388";

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
bot.login(BOT_TOKEN);

// =========================
// Route callback OAuth2
// =========================
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

    // Envoi du suivi sur Discord
    try {
      const channel = await bot.channels.fetch(CHANNEL_ID);
      if (channel) {
        channel.send(`👮 Connexion MDT : **${userData.username}** (ID: ${userData.id}) à ${new Date().toLocaleString()}`);
      }
    } catch (err) {
      console.error("Erreur envoi message Discord:", err);
    }

    // Retourne les infos au frontend
    res.json(userData);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// =========================
// Lancer le serveur
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur OAuth2 lancé sur http://localhost:${PORT}`));
