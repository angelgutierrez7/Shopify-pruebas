import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Pedido from "../models/Pedido.js";
import sequelize from "./database.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ type: "application/json" }));

function verifyShopifyHmac(req) {
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return hash === hmacHeader;
}

app.post("/webhooks/orders", async (req, res) => {
  if (!verifyShopifyHmac(req)) {
    return res.status(401).send("Firma inválida");
  }

  const pedido = req.body;

  try {
    await Pedido.create({
      order_id: pedido.id,
      email: pedido.email,
      total_price: pedido.total_price,
      currency: pedido.currency,
      created_at: pedido.created_at,
      data: pedido,
    });

    console.log("Pedido guardado:", pedido.id);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error al guardar:", err);
    res.status(500).send("Error");
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync()
    console.log("Base de datos conectada");

    
  app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});

  } catch (err) {
    console.error("Error al conectar DB:", err);
  }
})();
