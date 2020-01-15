import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import Appointment from '../models/Appointment';

class Schedulecontroller {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, isProvider: true, deletedAt: null },
    });

    if (!isProvider) {
      return res.status(401).json({ error: 'User is not provider' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        providerId: req.userId,
        canceledAt: null,
        date: { [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)] },
      },
    });

    return res.json(appointments);
  }
}

export default new Schedulecontroller();
