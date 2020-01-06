import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) res.status(401).json({ error: 'User not exists' });

    if (!user.checkPassword(password))
      res.status(401).json({ error: 'Password does not match' });

    const { id, name, isAdmin } = user;
    return res.json({
      user: { id, name, email, isAdmin },
      token: jwt.sign({ id, isAdmin }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
