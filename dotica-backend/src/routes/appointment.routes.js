const express = require('express');
const router  = express.Router();
const {
  getAppointments, getAppointment, createAppointment,
  updateAppointment, updateStatus, reschedule,
  getAvailability, cancelAppointment,
} = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');
router.use(protect);
router.get('/availability',    getAvailability);
router.get('/',                getAppointments);
router.get('/:id',             getAppointment);
router.post('/',               createAppointment);
router.put('/:id',             updateAppointment);
router.patch('/:id/status',    updateStatus);
router.post('/:id/reschedule', reschedule);
router.delete('/:id',          cancelAppointment);
module.exports = router;
