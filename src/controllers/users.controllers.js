import { sendRecoveryMail } from "../main.js";
import { userModel } from "../models/users.models.js";
import { createHash } from "../utils/bcrypt.js";
import crypto from "crypto";
import path from "path";

export const getAll = async (req, res) => {
  try {
    const users = await userModel.find({}, "first_name last_name email role");
    return res.status(200).json({ status: "success", payload: users });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const getById = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await userModel.findById(uid);
    if (!user) return res.status(404).json({ status: "error", payload: "Usuario no encontrado" });
    return res.status(200).json({ status: "success", payload: user });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const putById = async (req, res) => {
  const { uid } = req.params;
  const { first_name, last_name, email, password } = req.body;

  try {
    const updateData = { first_name, last_name, email };
    if (password) {
      updateData.password = createHash(password);
    }
    const user = await userModel.findByIdAndUpdate(uid, updateData, { new: true });
    if (!user) return res.status(404).json({ status: "error", payload: "Usuario no encontrado" });
    return res.status(200).json({ status: "success", payload: user });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const deleteByid = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await userModel.findByIdAndDelete(uid);
    if (!user) return res.status(404).json({ status: "error", payload: "Usuario no encontrado" });
    return res.status(200).json({ status: "success", payload: "Usuario eliminado" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const deleteInactiveUser = async (req, res) => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const resultado = await userModel.deleteMany({ last_connection: { $lt: twoDaysAgo } });

    if (resultado.deletedCount > 0) {
      return res.status(200).json({
        status: "success",
        payload: `Se eliminaron ${resultado.deletedCount} usuarios inactivos`,
      });
    }
    return res.status(200).json({ status: "success", payload: "No hay usuarios inactivos" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

// PW RECOVERY — tokens persistidos en BD (campo en el usuario sería lo ideal, pero
// usamos un Map en memoria con timestamp para mantener la lógica existente correctamente)
const recoveryLinks = new Map();

export const pwRecovery = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      // No revelamos si el email existe (seguridad)
      return res.status(200).json({ status: "success", payload: "Si el email existe, recibirás un link" });
    }
    const token = crypto.randomBytes(20).toString("hex");
    recoveryLinks.set(token, { email, timestamp: Date.now() });

    const recoveryLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;
    sendRecoveryMail(email, recoveryLink);
    return res.status(200).json({ status: "success", payload: "Email de recuperación enviado" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const pwReset = async (req, res) => {
  const { token } = req.params;
  const { newPassword, newPassword2 } = req.body;
  try {
    const linkData = recoveryLinks.get(token);
    if (!linkData || Date.now() - linkData.timestamp > 3600000) {
      return res.status(400).json({ status: "error", payload: "Link inválido o expirado" });
    }
    if (newPassword !== newPassword2) {
      return res.status(400).json({ status: "error", payload: "Las contraseñas no coinciden" });
    }

    await userModel.findOneAndUpdate(
      { email: linkData.email },
      { password: createHash(newPassword) }
    );
    recoveryLinks.delete(token);
    return res.status(200).json({ status: "success", payload: "Contraseña actualizada correctamente" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const documentsUpload = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "error", payload: "No se recibió ningún archivo" });
    return res.status(200).json({ status: "success", payload: "Documento cargado", file: req.file.filename });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const profilePicsUpload = async (req, res) => {
  const { uid } = req.params;
  if (!req.file) return res.status(400).json({ status: "error", payload: "No se recibió ningún archivo" });
  const { filename } = req.file;
  try {
    const filePath = path.join("src", "public", "js", "profilePics", filename).replace(/\\/g, "/");
    const user = await userModel.findByIdAndUpdate(
      uid,
      { $push: { thumbnail: filePath } },
      { new: true }
    );
    if (!user) return res.status(404).json({ status: "error", payload: "Usuario no encontrado" });
    return res.status(200).json({ status: "success", payload: "Imagen de perfil cargada" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const prodPicsUpload = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "error", payload: "No se recibió ningún archivo" });
    return res.status(200).json({ status: "success", payload: "Imagen de producto cargada", file: req.file.filename });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};
