import { productModel } from "../models/products.models.js";

export const getProducts = async (req, res) => {
  const { limit, page, filter, sort } = req.query;

  const pag = parseInt(page) || 1;
  const lim = parseInt(limit) || 30;
  const ord = sort === "asc" ? 1 : -1;
  const query = filter ? { category: filter } : {};

  try {
    const prods = await productModel.paginate(query, {
      limit: lim,
      page: pag,
      sort: { price: ord },
    });
    return res.status(200).json({ status: "success", payload: prods });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const prod = await productModel.findById(id);
    if (!prod) return res.status(404).json({ status: "error", payload: "Producto no encontrado" });
    return res.status(200).json({ status: "success", payload: prod });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const postProduct = async (req, res) => {
  const { title, description, code, price, stock, category, quantity } = req.body;
  try {
    const prod = await productModel.create({ title, description, code, price, stock, category, quantity });
    return res.status(201).json({ status: "success", payload: prod });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: "error", payload: "Ya existe un producto con ese código" });
    }
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const postProductWImage = async (req, res) => {
  const { title, description, code, price, stock, category, quantity, thumbnail } = req.body;
  try {
    const prod = await productModel.create({ title, description, code, price, stock, category, quantity, thumbnail });
    return res.status(201).json({ status: "success", payload: prod });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: "error", payload: "Ya existe un producto con ese código" });
    }
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const putProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, code, price, stock, category } = req.body;
  try {
    const prod = await productModel.findByIdAndUpdate(
      id,
      { title, description, code, price, stock, category },
      { new: true }
    );
    if (!prod) return res.status(404).json({ status: "error", payload: "Producto no encontrado" });
    return res.status(200).json({ status: "success", payload: prod });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const prod = await productModel.findByIdAndDelete(id);
    if (!prod) return res.status(404).json({ status: "error", payload: "Producto no encontrado" });
    return res.status(200).json({ status: "success", payload: "Producto eliminado" });
  } catch (error) {
    return res.status(500).json({ status: "error", payload: error.message });
  }
};
