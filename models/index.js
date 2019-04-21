const db = require('../config/db');
const path = require('path');
const model_path = path.join(__dirname) + '/';

//实例化模型
const Student = db.import(model_path +'student.js');
const Teacher = db.import(model_path + 'teacher.js');
const Course = db.import(model_path + 'course.js');
const Point = db.import(model_path + 'knowledge_point.js');
const Question = db.import(model_path + 'question.js');
const Option = db.import(model_path + 'options.js');
const student_course = db.import(model_path + 'student_course.js');
const answer_info = db.import(model_path + 'answer_info.js');
const Tag = db.import(model_path + 'tag.js');

const models = {
   Student: Student,
   Teacher: Teacher,
   Course: Course,
   Point: Point,
   Question: Question,
   Option: Option,
   student_course: student_course,
   answer_info: answer_info,
   Tag: Tag
};


//老师-课程：1-m
//Course有一个外键creator指向Teacher的t_id
Course.belongsTo(Teacher,{
    foreignKey: 'creator'
});
//Course有一个外键creator指向Teacher的t_id
Teacher.hasMany(Course, {
    as: 'course_list',
    foreignKey: 'creator'
});

//学生-课程：m-n
//一个学生对应多个课程
Student.belongsToMany(Course, {
    as: 'learned_list',
    through: student_course,
    foreignKey: 's_id',
    otherKey: 'c_id'
});
//一个课程对应多个学生
Course.belongsToMany(Student, {
    as: 'follow_list',
    through: student_course,
    foreignKey: 'c_id',
    otherKey: 's_id'
});

//课程-知识点：1-m
Course.hasMany(Point, {
    as: 'Points',
    foreignKey: 'c_id'
});
Point.belongsTo(Course, {
    foreignKey: 'c_id'
});
//知识点-题目：1-m
Point.hasMany(Question, {
    as: 'Questions',
    foreignKey: 'k_id'
});
Question.belongsTo(Point, {
    foreignKey: 'k_id'
});
//题目-选项：1-m
Question.hasMany(Option, {
    as: 'Options',
    foreignKey: 'q_id'
});
Option.belongsTo(Question, {
    foreignKey: 'q_id'
});

//学生-答题信息：1-m
Student.hasMany(answer_info, {
    as: 'answer_log',
    foreignKey: 's_id'
});
answer_info.belongsTo(Student, {
    foreignKey: 's_id'
});

//题目-答题信息：1-m
Question.hasMany(answer_info, {
    as: 'answered_info',
    foreignKey: 'q_id'
})
//答题信息-题目：1-1

//
//题目-标签：1-m
Question.hasMany(Tag, {
    as: 'Tags',
    foreignKey: 'q_id'
});
Tag.belongsTo(Question, {
    foreignKey: 'q_id'
});
//学生-标签：1-m
Student.hasMany(Tag, {
    as: 'add_tag_list',
    foreignKey: 's_id'
});
Tag.belongsTo(Student, {
    foreignKey: 's_id'
});
//学生-题目：m:n
Student.belongsToMany(Question, {
    as: 'answered_questions',
    through: answer_info,
    foreignKey: 's_id',
    otherKey: 'q_id'
});
Question.belongsToMany(Student, {
    as: 'answered_students',
    through: answer_info,
    foreignKey: 'q_id',
    otherKey: 's_id'
});

module.exports = models;
