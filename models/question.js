/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('question', {
    q_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    q_info: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    q_answer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    k_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      references: {
        model: 'knowledge_point',
        key: 'k_id'
      }
    }
  }, {
    tableName: 'question'
  });
};
