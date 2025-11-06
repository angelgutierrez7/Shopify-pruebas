import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Pedido from "../models/Pedido.js";
import sequelize from "../models/database.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(
  express.json({
    type: "application/json",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://admin.shopify.com https://electricavaldez.myshopify.com;"
  );
  next();
});

function verifyShopifyHmac(req) {
  const provided = req.get("X-Shopify-Hmac-Sha256") || "";
  const calc = crypto
    .createHmac("sha256", process.env.SHOPIFY_SECRET)
    .update(req.rawBody) // <— SIEMPRE el body crudo
    .digest("base64");

  console.log("topic:", req.get("X-Shopify-Topic"));
  console.log("shop :", req.get("X-Shopify-Shop-Domain"));
  console.log("wid  :", req.get("X-Shopify-Webhook-Id"));
  console.log("HMAC provided:", provided);
  console.log("HMAC calc    :", calc);
  console.log("Body length  :", req.rawBody?.length, "bytes");

  try {
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(provided));
  } catch {
    return false;
  }
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

app.get("/producto", async (req, res) => {
  res.status(200).send("15");
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Base de datos conectada");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo`);
    });
  } catch (err) {
    console.error("Error al conectar DB:", err);
  }
})();
