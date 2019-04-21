/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course', {
    c_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    c_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    c_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    creator: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      references: {
        model: 'teacher',
        key: 't_id'
      }
    }
  }, {
    tableName: 'course'
  });
};
