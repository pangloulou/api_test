/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('knowledge_point', {
    k_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    k_info: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    c_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      references: {
        model: 'course',
        key: 'c_id'
      }
    }
  }, {
    tableName: 'knowledge_point'
  });
};
