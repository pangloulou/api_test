/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('options', {
    o_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    o_info: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    o_status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    },
    q_id: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      references: {
        model: 'question',
        key: 'q_id'
      }
    }
  }, {
    tableName: 'options'
  });
};
