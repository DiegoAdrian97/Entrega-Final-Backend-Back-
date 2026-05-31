import { CartModel } from "../models/cart.models.js";
import { ticketModel } from "../models/ticket.models.js";
import { productModel } from "../models/products.models.js";
import { userModel } from "../models/users.models.js";
import { v4 as uuidv4 } from "uuid";
import { sendTicketToEmail } from "../main.js";

export const postCompra = async (req, res) => {
  const cartId = req.params.cid;
  const userEmail = req.user ? req.user.email : req.headers["user-email"];

  try {
    const cart = await CartModel.findById(cartId).populate("products._id");
    if (!cart) return res.status(404).json({ status: "error", payload: "Carrito no encontrado" });
    if (cart.products.length === 0) {
      return res.status(400).json({ status: "error", payload: "El carrito está vacío" });
    }

    // Verificar stock
    for (const item of cart.products) {
      if (item._id.stock < item.quantity) {
        return res.status(400).json({
          status: "error",
          payload: `Stock insuficiente para "${item._id.title}"`,
        });
      }
    }

    // Descontar stock con bulkWrite (1 sola operación)
    const bulkOps = cart.products.map((item) => ({
      updateOne: {
        filter: { _id: item._id._id },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await productModel.bulkWrite(bulkOps);

    const total = cart.products.reduce((acc, item) => acc + item.quantity * item._id.price, 0);

    const ticket = await ticketModel.create({
      products: cart.products.map((item) => ({
        _id: item._id._id,
        title: item._id.title,
        quantity: item.quantity,
        price: item._id.price,
      })),
      amount: total,
      email: userEmail,
      purchaser: req.user?._id,
      cart: cart._id,
      code: uuidv4(),
    });

    sendTicketToEmail(ticket);

    // Limpiar el carrito
    cart.products = [];
    cart.total = 0;
    await cart.save();

    return res.status(200).json({ status: "success", payload: "Compra realizada", ticket });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};
