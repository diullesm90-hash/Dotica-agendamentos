const Client      = require('../models/Client.model');
const Appointment = require('../models/Appointment.model');

// GET /api/clients
const getClients = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 100 } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clients, total] = await Promise.all([
      Client.find(query).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Client.countDocuments(query),
    ]);
    res.json({ clients, total });
  } catch (err) { next(err); }
};

// GET /api/clients/:id
const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });
    const appointments = await Appointment.find({ client: client._id })
      .populate('attendant', 'name')
      .sort({ date: -1 })
      .limit(50);
    res.json({ client, appointments });
  } catch (err) { next(err); }
};

// POST /api/clients
const createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) { next(err); }
};

// PUT /api/clients/:id
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });
    res.json(client);
  } catch (err) { next(err); }
};

// DELETE /api/clients/:id (soft delete)
const deleteClient = async (req, res, next) => {
  try {
    await Client.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Cliente removido.' });
  } catch (err) { next(err); }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };
