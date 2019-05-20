const express = require('express');
const router = express.Router();

const sequelize = require('sequelize');

const Student = require('../models/index').Student;
const Teacher = require('../models/index').Teacher;
const student_course = require('../models/index').student_course;
const Course = require('../models/index').Course;
const answer_info = require('../models/index').answer_info;
const Tag = require('../models/index').Tag;
const Option = require('../models/index').Option;
const Question = require('../models/index').Question;
const Point = require('../models/index').Point;



const redirectLogin = (req, res, next) => {
    if(!req.session.userId) {
        res.json({
            success: false,
            err_message: '请先登录'
        })
    } else {
        next();
    }
};


//查看用户名是否可以注册
router.post('/set_name', (req, res) => {
    const { name } = req.body;
    Student.findOne({
        where: {
            s_name: name
        }
    }).then(s => {
        if(s) {
            res.json({
                success: false
            });
        } else {
            res.json({
                success: true
            });
        }
    });
});

//修改个人资料
router.post('/profile', redirectLogin, (req, res) => {
    const { userId } = req.session;
    const { name, introduction, email } = req.body;
    // var name = 's_test';
    // var introduction = '这是一个用于测试的学生账号';
    // var email = 'student@qq.com';
   
    Student.findOne({
        where: {
            s_id: userId
        }
    }).then(s => {
        s.update({
            s_name: name,
            s_desc: introduction,
            email: email
        }).then(s => {
            res.json({
                success: true
            });
        }).catch(err => {
            console.log(err);
            res.json({
                success: false,
                err_message: '该用户名已被注册'
            });
        })
    });
});

//获取个人基本资料
router.get('/profile', redirectLogin, (req, res) => {
    const { userId } = req.session;
    Student.findOne({
        where: {
            s_id: userId
        }
    }).then(s => {
        res.json({
            success: true,
            user: {
                name: s.s_name,
                email: s.email,
                avatar: s.avatar,
                introduction: s.s_desc
            }
        });
    })
});

//学生选课
router.post('/select_course', redirectLogin, (req, res) => {
    const { courseId } = req.body;
    const { userId } = req.session;
    student_course.findOrCreate({
        where: {
            s_id: userId,
            c_id: courseId
        },
        defaults: {
            select_time: new Date()
        }
    }).spread((result, created) => {
        if(created) {
            res.json({
                success: true
            })
        } else {
            res.json({
                success: false,
                err_message: '不能重复选课'
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: '参数错误'
        })
    })
});

//查看学生选课列表
router.get('/course_list', redirectLogin, (req, res) => {
    const { userId } = req.session;
    Student.findOne({
        where: {
            s_id: userId
        },
        attributes: {
            exclude: ['pwd']
        },
        include: [{
            model: Course,
            as: 'learned_list',
            through: {
                attributes: ['select_time']
            }
        }]
    }).then(s => {
        res.json({
            success: true,
            student: s.get({
                plain: true
            })
        })
    }).catch(err => {
        res.json({
            success: false,
            err_message: err
        })
    })
});

//学生答题 返回答题结果（包括你的选项是否正确 以及正确选项是什么）
router.post('/answer_question', redirectLogin,(req, res) => {
    const { userId } = req.session;
    // const userId = 17;
    const answerInfo = req.body;  
    console.log(answerInfo);
    answer_info.create({
        q_id: answerInfo.questionId,//题目ID
        a_time: answerInfo.answerTime,//答题耗时 单位毫秒
        a_date: answerInfo.answerDate,//答题日期
        a_option: answerInfo.answerOption,//选项ID
        s_id: userId//学生编号
    }).then(a => {
        Question.findOne({
            where: {
                q_id: answerInfo.questionId
            },
            include: [{
                model: Option,
                as: 'Options',
                where: {
                    o_status: 1
                }
            }]
        }).then(q => {
            let result = q.get({plain: true});
            // result.studentOption = a.a_option;
            res.json({
                success: true,
                rightOption: result.Options[0],
                studentOption: a.a_option
            });
        }).catch(err => {
            console.log(err);
            res.json({
                success: false
            });
        })
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: '参数错误'
        })
    })
});

//学生给题贴标签
router.post('/add_tag', redirectLogin, (req, res) => {
    const { userId } = req.session;
    const  tagData  = req.body;
    Tag.create({
        t_info: tagData.tagInfo,
        t_data: tagData.tagDate,
        q_id: tagData.questionId,
        s_id: userId
    }).then(tag => {
        res.json({
            success: true
        })
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: '参数错误'
        })
    })
});

//查看问题解析
router.post('/get_answer', (req, res) => {
    const questionId = req.body.questionId;
    Question.findOne({
        where: {
            q_id: questionId
        }
    }).then(q =>{
        res.json({
            success: true,
            q_answer: q.q_answer
        })
    }).catch(err => {
        res.json({
            success: false,
            err_message: '参数错误'
        })
    })
});

//返回该学生所有的答题信息 课程名称、教师名、题目编号、答题用时、答题日期、答题选项
router.get('/answer_logs', redirectLogin, (req, res) => {
    const { userId } = req.session;
    // const userId = 17;
    answer_info.findAll({
        where: {
            s_id: userId
        },
        include: [{
            model: Question,
            include: [{
                model: Option,
                as: 'Options'       
            },{
                model: Point,
                include: [{
                    model: Course,
                    include: [{
                        model: Teacher
                    }]
                }]
            }]
        }]
    }).then(a => {
        let data = JSON.parse(JSON.stringify(a));
        let result = [];
        for(let i = 0; i < data.length; i++) {
            console.log(data[i].a_id);
            let log = {
                a_id:data[i].a_id,
                a_time: data[i].a_time,
                a_date: data[i].a_date,
                q_info: data[i].question.q_info,
                a_option: data[i].a_option,
                options:data[i].question.Options,
                c_name: data[i].question.knowledge_point.course.c_name,
                t_name: data[i].question.knowledge_point.course.teacher.t_name,
            }
            result.push(log);
        }
        res.json({
            success: true,
            logs: result
        });
    }).catch(err => {
        console.log(err);
        res.json({
            success: false
        })
    })
});


module.exports = router;