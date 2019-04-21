/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('answer_info', {
    a_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    q_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      references: {
        model: 'question',
        key: 'q_id'
      }
    },
    a_time: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    a_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    s_id: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      references: {
        model: 'student',
        key: 's_id'
      }
    },
    a_option: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'answer_info'
  });
};
