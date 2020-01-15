import Sequelize, { Model } from 'sequelize';
import bcript from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        passwordHash: Sequelize.STRING,
        isProvider: Sequelize.BOOLEAN,
        deletedAt: Sequelize.DATE,
      },
      { sequelize }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.passwordHash = await bcript.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(pwd) {
    return bcript.compare(pwd, this.passwordHash);
  }
}

export default User;
