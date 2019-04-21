/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('student', {
    s_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    s_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    s_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pwd: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    join_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'http://ww1.sinaimg.cn/large/007wLihkgy1g0xhh1aa66j309g09gt8q.jpg'
    }
  }, {
    tableName: 'student'
  });
};
