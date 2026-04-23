const Settings = require('../models/Settings.model');

const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getOrCreate(req.query.unit || 'Principal');
    res.json(settings);
  } catch (err) { next(err); }
};

const updateSettings = async (req, res, next) => {
  try {
    const unit     = req.body.unit || 'Principal';
    const settings = await Settings.findOneAndUpdate({ unit }, req.body, { new: true, upsert: true, runValidators: true });
    res.json(settings);
  } catch (err) { next(err); }
};

module.exports = { getSettings, updateSettings };
