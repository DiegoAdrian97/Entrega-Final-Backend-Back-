import router from "./Routes/index.routes.js";
import "dotenv/config.js";
import express from "express";
import session from "express-session";
import cors from "cors";
import { __dirname } from "./path.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.js";
import nodemailer from "nodemailer";
import { addlogger } from "./utils/logger.js";
import { BACKEND_URL, FRONTEND_URL, MY_EMAIL, PORT } from "./config.js";

// CORS
const whiteList = [
  FRONTEND_URL,
  BACKEND_URL,
  "http://localhost:5174",
  "http://localhost:5173",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Acceso denegado por CORS"));
    }
  },
  credentials: true,
};

const app = express();

// Middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser(process.env.SIGNED_COOKIE));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 60 * 60 * 24, // 24 horas
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Servir imágenes estáticas
app.use("/images", express.static(`${__dirname}/public/js`));

// Logger debe ir ANTES de las rutas
app.use(addlogger);

// Routes
app.use("/", router);

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Documentación del E-Commerce",
      description: "Api Coder Backend",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// MAILING
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: MY_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
    authMethod: "LOGIN",
  },
});

export const sendRecoveryMail = (email, recoveryLink) => {
  const mailOptions = {
    from: MY_EMAIL,
    to: email,
    subject: "Link para restablecer su contraseña",
    html: `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#333;">Restablecer contraseña</h2>
      <p style="color:#555;">Haga click en el siguiente botón para restablecer su contraseña. El link expira en 1 hora.</p>
      <a href="${recoveryLink}" style="display:inline-block;padding:12px 24px;background:#e53e3e;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
        Restablecer contraseña
      </a>
      <p style="color:#999;font-size:12px;margin-top:16px;">Si no solicitaste esto, ignorá este email.</p>
    </div>`,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) console.error("Error al enviar email de recuperación:", error);
    else console.log("Email de recuperación enviado a:", email);
  });
};

export const sendTicketToEmail = (ticket) => {
  const email = ticket && ticket.email;
  if (!email) {
    console.error("sendTicketToEmail: sin dirección de email válida");
    return;
  }

  const { products, amount, code } = ticket;

  const productsHtml = products
    .map(
      (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${p.title}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${p.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${p.price}</td>
      </tr>`
    )
    .join("");

  const mailOptions = {
    from: MY_EMAIL,
    to: email,
    subject: "¡Gracias por su compra!",
    html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#333;text-align:center;">✅ Compra confirmada</h2>
      <p style="color:#555;text-align:center;">Código de compra: <strong>${code}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="padding:8px;text-align:left;">Producto</th>
            <th style="padding:8px;text-align:center;">Cantidad</th>
            <th style="padding:8px;text-align:right;">Precio unit.</th>
          </tr>
        </thead>
        <tbody>${productsHtml}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;margin-top:12px;">Total: $${amount}</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="https://wa.me/5491159148462?text=Hola!%20Me%20comunico%20por%20mi%20compra%20${code}"
           style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
          Coordinar entrega por WhatsApp
        </a>
      </div>
    </div>`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) console.error("Error al enviar ticket por email:", error);
    else console.log("Ticket enviado a:", email);
  });
};

// BDD
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("BDD conectada"))
  .catch((err) => {
    console.error("Error al conectarse a la BDD:", err.message);
    process.exit(1);
  });

// Global error handler (debe ir al final)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  req.logger?.error(`${err.message} — ${req.method} ${req.url}`);
  res.status(status).json({ status: "error", payload: err.message || "Error interno del servidor" });
});

// Server
app.listen(PORT, () => {
  console.log(`Server on Port ${PORT}`);
});
