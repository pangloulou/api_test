/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('student_course', {
    s_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'student',
        key: 's_id'
      }
    },
    c_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'course',
        key: 'c_id'
      }
    },
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    select_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'student_course'
  });
};
