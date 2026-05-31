import passport from "passport";

export const passportError = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user) => {
      if (error) return next(error);
      if (!user) {
        return res.status(401).json({ error: "No ha iniciado sesión o el token es inválido" });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No ha iniciado sesión" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: "No tiene los permisos necesarios" });
    }
    next();
  };
};
