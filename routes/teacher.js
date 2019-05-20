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

//查看用户名是否可以注册
router.post('/set_name', (req, res) => {
    const { name } = req.body;
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


//获取老师创建的课程列表 包含知识点和题目信息
router.get('/get_courses', redirectLogin, (req, res) => {
    const { userId } = req.session;
    // const userId = 1;
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
                as: 'Points',
                include: [{
                    model: Question,
                    as: 'Questions'
                }]
            }]
        }]
    }).then(t => {
        let result = JSON.stringify(t).replace(/Points|Questions/g, 'children');//JSON字符串
        let result2 = JSON.parse(result.replace(/c_name|k_info|q_info|o_info/g, 'info'));
        res.json({
            success: true,
            courseList: result2
        });
    }).catch(err => {
        res.json({
            success: false,
            err_message: err
        });
    })
});


//查看选择课程的学生列表
router.get(('/get_student'), redirectLogin, (req, res) => {
    const { userId } = req.session;
    Teacher.findOne({
        where: {
            t_id: userId
        },
        attributes: ['t_id','t_name','t_desc'],
        include: [{
            model: Course,
            as: 'course_list',
            include: [{
                model: Student,
                as: 'follow_list',
                attributes: ['s_id','s_name'],
                through: {
                    attributes: ['select_time']
                }
            }]
        }]
    }).then(t => {        
        var courseList = t.get({plain: true}).course_list;
        const studentList = [];
        
        for(let i = 0; i < courseList.length; i++) {
            // console.log(i,courseList[i]);
            for(let j = 0; j < courseList[i].follow_list.length; j++) {
                // console.log(j,courseList[i].follow_list[j])
                studentList.push({
                    c_id: courseList[i].c_id,
                    c_name: courseList[i].c_name,
                    c_desc: courseList[i].c_desc,
                    creator: courseList[i].creator,
                    s_id: courseList[i].follow_list[j].s_id,
                    s_name: courseList[i].follow_list[j].s_name,
                    select_time: courseList[i].follow_list[j].student_course.select_time
                })
            }
        }
        console.log(studentList)
        res.json({
            success: true,
            studentList: studentList
        })
    }).catch(err => {
        console.log(err);
        res.json({
            success: false
        })
    })
   
});


//查看该学生对该课程的答题情况
router.get('/student_answer', redirectLogin, (req, res) => {
    const { studentId, courseId } = req.body;
    const { userId } = req.session;
    // var studentId = 1;
    // var courseId = 1;
    Course.findOne({
        where: {
            c_id: courseId
        },
        include:[{
            model: Student,
            as: 'follow_list',
            where: {
                s_id: studentId
            },
            attributes: ['s_id', 's_name'],
            required: true
        }, {
            model: Point,
            as: 'Points',
            include: [{
                model: Question,
                as: 'Questions',
                include: [{
                    model: answer_info,
                    as: 'answered_info',
                    required: true
                },{
                    model: Option,
                    as: 'Options'
                }, {
                    model: Tag,
                    as: 'Tags'
                }],
                required: true
            }]
        }]
    }).then(c => {
        //处理数据
     
        res.json(c);
    }).catch(err => {
        console.log(err);
        res.json({
            success: false
        })
    })
});



module.exports = router;