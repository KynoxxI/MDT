// server.js
import express from "express";
import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config(); // Charge les variables depuis .env

const app = express();

// OAuth2 Discord
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Bot Discord
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
bot.login(BOT_TOKEN);

// Route de callback OAuth2
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
      return res.status(400).json({ error: "Token non reçu", details: tokenData });
    }

    // Récupération du profil utilisateur
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResponse.json();

    // Envoi du suivi dans le salon Discord
    try {
      const channel = await bot.channels.fetch(CHANNEL_ID);
      if (channel) {
        channel.send(`👮 Connexion MDT : **${userData.username}** (ID: ${userData.id}) à ${new Date().toLocaleString()}`);
      }
    } catch (err) {
      console.error("Erreur envoi Discord :", err);
    }

    // Réponse au frontend
    res.json(userData);

  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).send("Erreur interne");
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur MDT lancé sur http://localhost:${PORT}`));
