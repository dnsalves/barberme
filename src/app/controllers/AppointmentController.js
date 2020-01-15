import { Op } from 'sequelize';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const appointments = await Appointment.findAll({
      where: { userId: req.userId, canceledAt: null },
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'url', 'path'] },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      providerId: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { providerId, date } = req.body;

    const checkIsProvider = await User.findOne({
      where: {
        id: providerId,
        isProvider: true,
        deletedAt: { [Op.eq]: null },
      },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    // Check for past dates
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    const checkAvailability = await Appointment.findOne({
      where: { providerId, canceledAt: null, date: hourStart },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    if (req.userId === providerId) {
      return res
        .status(400)
        .json({ error: 'Provider cannot be the same of user' });
    }

    const appointment = await Appointment.create({
      userId: req.userId,
      providerId,
      date,
    });

    // Notify appointment provider
    const user = await User.findByPk(req.userId);
    const formatedDate = format(hourStart, "dd 'de' MMMM', às ' H:mm'hrs'", {
      locale: ptBR,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para dia ${formatedDate}`,
      user: providerId,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'] },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    if (appointment.userId !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment",
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointments 2 hours in advance' });
    }

    appointment.canceledAt = new Date();
    appointment.save();

    await Queue.add(CancellationMail.key, { appointment });

    return res.json(appointment);
  }
}

export default new AppointmentController();
