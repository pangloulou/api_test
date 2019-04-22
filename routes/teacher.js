const express = require('express');
const router = express.Router();

const Teacher = require('../models/index').Teacher;
const Course = require('../models/index').Course;
const Point = require('../models/index').Point;
const Question = require('../models/index').Question;
const Option = require('../models/index').Option;
const Student = require('../models/index').Student;
const answer_info = require('../models/index').answer_info;
const Tag = require('../models/index').Tag;

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


//教师注册
router.post('/sign_up', (req, res) => {
    const { name, password } = req.body;
    // var name = 't_test';
    // var password = 123;

    if(name && password) {
        Teacher.findOrCreate({
            where: {
                t_name: name
            },
            defaults: {
                pwd: password,
                join_time: new Date()
            }
        }).spread((t, created) => {
            if(created) {
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false,
                    err_message: '账号已注册'
                });
            }
        }).catch(err => {
            console.log(err);
            res.json({
                success: false
            });
        });
    } else {
        res.json({
            success: false,
            err_message: '参数错误'
        })
    } 
});

//教师登录
router.post('/sign_in', (req, res) => {
    const { name, password } = req.body;
    const { userId } = req.session;
    // var name = 't_test';
    // var password = 123;
    if(userId) {
        res.json({
            success: false,
            message: '不能重复登录'
        })
    } else {
        Teacher.findOne({
            where: {
                t_name: name,
                pwd: password
            }
        }).then(t => {
            if(t) {
                req.session.userId = t.t_id;
                res.json({
                    success: true,
                    user: {
                        id: t.t_id,
                        name: t.t_name
                    }
                });
            } else {
                res.json({
                    success: false,
                    err_message: '还未注册'
                });
            }
        }).catch(err => {
            console.log(err);
            res.json({
                success: false,
                err_message: '参数错误'
            });
        });
    }
});

//查看用户名是否可以注册
router.post('/set_name', (req, res) => {
    const { name } = req.body;
    // var name = 't_test';
    Teacher.findOne({
        where: {
            t_name: name
        }
    }).then(t => {
        if(t) {
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
    // var name = 'Handy';
    // var introduction = '这是一个用于测试的老师账号';
    // var email = '123@qq.com';
   
    Teacher.findOne({
        where: {
            t_id: userId
        }
    }).then(t => {
        t.update({
            t_name: name,
            t_desc: introduction,
            email: email
        }).then(t => {
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
    Teacher.findOne({
        where: {
            t_id: userId
        }
    }).then(t => {
        res.json({
            success: true,
            user: {
                name: t.t_name,
                email: t.email,
                avatar: t.avatar,
                introduction: t.t_desc
            }
        });
    })
});

//创建课程
router.post('/add_course', redirectLogin, (req, res) => {
    const { courseName, courseInfo } = req.body;
    const { userId } = req.session;
    // var courseName = '课程2';
    // var courseInfo = '课程2的简介';
    console.log(new Date());
    Course.create({
        c_name: courseName,
        c_desc: courseInfo,
        create_time: new Date(),
        creator: userId
    }).then(c => {
        res.json({
            success: true,
            course: c.get({
                plain: true
            })
        });
    }).catch(err => {
        res.json({
            success: false,
            err_message: '参数错误'
        });
    });
});

//为课程创建知识点
router.post('/add_point', redirectLogin, (req, res) => {
    const { courseId, pointInfo } = req.body;
    const { userId } = req.session;
    // var courseId = 7;
    // var pointInfo = '形状';

    Point.create({
        k_info: pointInfo,
        c_id: courseId
    }).then(p => {
        res.json({
            success: true,
            point: p.get({
                plain: true
            })
        });
    }).catch(err => {
        res.json({
            success: false,
            err_message: '参数错误'
        });
    });
});

//为知识点创建一个题目
router.post('/add_question', redirectLogin, (req, res) => {
    const question  = req.body;
    
    Question.create({
        q_info: question.q_info,
        q_answer: question.q_answer,
        k_id: question.k_id,
        Options: question.options
    },{
        include: [{
            model: Option,
            as: 'Options'
        }]
    }).then(q => {
       res.json({
           success: true
       });
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: '参数错误'
        });
    });
});


//获取老师创建的课程列表 包含知识点信息
router.get('/get_courses', redirectLogin, (req, res) => {
    const { userId } = req.session;
    Teacher.findOne({
        where: {
            t_id: userId
        },
        attributes:['t_id','t_name', 't_desc'],
        include: [{
            model: Course,
            as: 'course_list',
            include: [{
                model: Point,
                as: 'Points'
            }]
        }]
    }).then(t => {
        res.json({
            success: true,
            courseList: t.get({
                plain: true
            })
        });
    }).catch(err => {
        res.json({
            success: false,
            err_message: err
        });
    })
});



//修改题目
router.post('/update_question', redirectLogin, (req, res) => {
   
});

//修改知识点
router.post('/update_point', redirectLogin, (req, res) => {
    
});
//修改选项
router.post('/update_option', redirectLogin, (req, res) => {

});

//删除选项
router.post('/delete_option', redirectLogin, (req, res) => {

});

//删除知识点
router.post('/delete_point', redirectLogin, (req, res) => {

});

//删除课程
router.post('/delete_course', redirectLogin, (req, res) => {
    //无人选课可以删除，有人选择不可删除
   
});


//上面是教师和课程之间的接口

//以下是教师和学生之间的接口

//查看选择课程的学生列表
router.post('/get_student', redirectLogin, (req, res) => {
    const { userId } = req.session;
    const { courseId } = req.body;
    Course.findOne({
        where: {
            c_id: courseId
        },
        include: [{
            model: Student,
            as: 'follow_list',
            attributes: ['s_id', 's_name', 'join_time'],
            through: {
                attributes: []
            }
        }]
    }).then(c => {
        res.json({
            success: true,
            course: c.get({
                plain: true
            })
        })
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: err
        });
    });
});


//查看该学生对该课程的答题情况
router.post('/student_answer', redirectLogin, (req, res) => {
    const { studentId, courseId } = req.body;
    const { userId } = req.session;
    // var studentId = 6;
    // var courseId = 7;
    Student.findOne({
        where: {
            s_id: studentId
        },
        attributes: ['s_id', 's_name'],
        include: [{
            model: Question,
            as: 'answered_questions',
            through: {
                attributes: []
            },
            include: [{
                model: Point,
                attributes: [],
                include: [{
                    model: Course,
                    where: {
                        c_id: courseId
                    },
                    required: true
                }],
                required: true
            }, {
                model: Option,
                as: 'Options'
            },{
                model: Tag,
                as: 'Tags'
            },{
                model: answer_info,
                as: 'answered_info',
                attributes: ['a_time', 'a_date', 'a_option']
            }]
        }]
    }).then(r => {
        res.json({
            success: true,
            answered_detail: r
        });
    }).catch(err => {
        console.log(err)
        res.json({
            success: false,
            err_message: err
        })
    })
});

module.exports = router;