// user.controller.js
const User = require('../models/User.model');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { password, ...data } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) { next(err); }
};

const toggleUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Não é possível desativar seu próprio usuário.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { getUsers, createUser, updateUser, toggleUser };
