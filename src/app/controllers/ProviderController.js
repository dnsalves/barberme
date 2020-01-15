import { Op } from 'sequelize';

import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { isProvider: true, deletedAt: { [Op.eq]: null } },
      attributes: ['id', 'name', 'email'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });
    return res.json(providers);
  }
}

export default new ProviderController();
