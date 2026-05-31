import { userModel } from "../models/users.models.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "error", payload: "Credenciales incorrectas" });
    }
    if (req.cookies.jwtCookie) {
      return res.status(400).json({ status: "error", payload: "Ya ha iniciado sesión" });
    }

    const token = generateToken(req.user);
    res.cookie("jwtCookie", token, {
      maxAge: 86400000,
      httpOnly: true,
      sameSite: "Lax",
    });

    const userData = {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
      cart: req.user.cart,
    };

    return res.status(200).json({ status: "success", payload: "Sesión iniciada", userData, token });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: `Error al iniciar sesión: ${error.message}` });
  }
};

export const register = async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({ status: "success", payload: "Usuario registrado exitosamente" });
    }
    return res.status(400).json({ status: "error", payload: "Error en el registro" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: "Error al registrar usuario" });
  }
};

export const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.clearCookie("jwtCookie");
    return res.status(200).json({ status: "success", payload: "Sesión cerrada" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: "Error al cerrar sesión" });
  }
};

export const current = async (req, res) => {
  if (req.user) {
    return res.status(200).json(req.user);
  }
  return res.status(404).json({ status: "error", payload: "Usuario no encontrado" });
};

export const GithubLogin = async (req, res) => {
  req.session.user = req.user;
  return res.status(200).json({ status: "success", payload: "Usuario logeado con Github" });
};
