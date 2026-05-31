import "dotenv/config";
import jwt, { decode } from "jsonwebtoken";
export const generateToken = (user) => {
  try {
    const userToken = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      cart: user.cart,
    };
    const token = jwt.sign({ user: userToken }, process.env.JWT_SECRET, {
      expiresIn: "1d", // 1 día
    });
    return token;
  } catch (error) {
    // Manejar el error aquí (puedes loguearlo o devolver un mensaje de error)
    res.status(404).send({ error: "Error al generar el token" });
    throw error;
  }
};

export const authToken = (req, res, next) => {
  //Consultar al header para obtener el Token
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ error: "Usuario no autenticado" });
  }

  const token = authHeader; //Obtengo el token y descarto el Bearer

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).send({ error: "Token expirado" });
      } else {
        res.status(404).send("Error verificando el token");
      }
      return res.status(401).send({ error: "Token inválido" });
    }

    req.user = decoded.user;
    next();
  });
};
