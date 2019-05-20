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

//学生答题
router.post('/answer_question', redirectLogin, (req, res) => {
    const { userId } = req.session;
    const answerInfo = req.body;   
    answer_info.create({
        q_id: answerInfo.questionId,//题目ID
        a_time: answerInfo.answerTime,
        a_date: answerInfo.answerDate,
        a_option: answerInfo.answerOption,//选项ID
        s_id: userId
    }).then(a => {
        Option.findOne({
            where: {
                o_id: answerInfo.answerOption
            }
        }).then(o => {
            if(o.o_status == 1) {
                res.json({
                    success: true,
                    status: true //答案正确
                })
            } else if(o.o_status == 0) {
                res.json({
                    success: true,
                    status: false//答案错误
                })
            }
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

//返回该学生所有的答题信息
//选了哪些课，做了哪些题，做题情况如何
//课程名
router.get('/answer_logs', redirectLogin, (req, res) => {
    // const { userId } = req.session;
    const userId = 1;
    Student.findOne({
        where: {
            s_id: userId
        },
        include: [{
            model: answer_info,
            as: 'answer_log'
        }]
    }).then(s => {
        res.json(s.get({plain: true}))
    }).catch(err => {
        res.json({
            err_message: 'error'
        })
    })
});


module.exports = router;