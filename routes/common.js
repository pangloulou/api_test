const express = require('express');
const router = express.Router();

const Student = require('../models/index').Student;
const Teacher = require('../models/index').Teacher;
const Course = require('../models/index').Course;
const Point = require('../models/index').Point;
const Question = require('../models/index').Question;
const Option = require('../models/index').Option;

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


//注册
router.post('/sign_up', (req, res) => {
    const { name, password, role} = req.body;
    //role = 1 表示学生 
    //role = 2 表示老师
    
    if(name && password && role) {
        if(role == 1) {
            //学生注册
            Student.findOrCreate({
                where: {
                    s_name: name
                },
                defaults: {
                    pwd: password,
                    join_time: new Date()
                }
            }).spread((s, created) => {
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
        } else if (role == 2) {
            //教师注册
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
    } else {
        res.json({
            success: false,
            err_message: '参数错误'
        })
    }
});


//登录
router.post('/sign_in', (req, res) => {
    const { name, password, role } = req.body;
    const { userId } = req.session;
   
    if(userId) {
        res.json({
            success: true,
            message: '不能重复登录'
        })
    } else {
        //学生登录
        if(role == 1) {
            Student.findOne({
                where: {
                    s_name: name,
                    pwd: password
                }
            }).then(s => {
                if(s) {
                    req.session.userId = s.s_id;
                    req.session.role = 1;//学生
                    res.json({
                        success: true,
                        user: {
                            id: s.s_id,
                            name: s.s_name
                        }
                    });
                } else {
                    res.json({
                        success: false,
                        err_message: '用户名或密码填写错误'
                    });
                }
            }).catch(err => {
                console.log(err);
                res.json({
                    success: false,
                    err_message: '参数错误'
                });
            });
        } else if(role == 2) {
            Teacher.findOne({
                where: {
                    t_name: name,
                    pwd: password
                }
            }).then(t => {
                if(t) {
                    req.session.userId = t.t_id;
                    req.session.role = 2; //教师
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
                        err_message: '用户名或密码填写错误'
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
    }
});



//获取系统里面前10个课程
router.get('/get_first_ten', (req, res) => {
    Course.findAndCountAll({
        limit: 10//限制返回结果条数
    }).then(c => {
        res.json({
            success: true,
            courses: c
        });
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: err
        })
    })
});

//按照页码获取其它课程
router.get('/page_course/:pageId', (req, res) => {
    var pageId = req.params.pageId;
    console.log(pageId);

    Course.findAll({
        limit: 10,
        offset: pageId * 10
    }).then(c => {
        res.json({
            success: true,
            courses: c
        });
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: err
        })
    })
})

//获取每门课的详细信息，包括知识点和题目的详细信息
router.post('/get_full_course', redirectLogin, (req, res) => {
    const { courseId } = req.body;
    // const courseId = 1;
    Course.findOne({
        where: {
            c_id: courseId
        },
        include: [{
            model: Point,
            as: 'Points',
            include: [{
                model: Question,
                as: 'Questions',
                include: [{
                    model: Option,
                    as: 'Options'
                }]
            }]
        }, {
            model: Teacher,
            attributes: ['t_id','t_name','t_desc']
        }]
    }).then(c => {
        let result = JSON.parse(JSON.stringify(c).replace(/Points|Questions|Options/g, 'children'));//JSON字符串
        res.json({
            success: true,
            full_course: result
        })
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: '参数错误'
        })
    })
});


//登出
router.get('/sign_out', (req, res) => {
    //删除session
    req.session.destroy(() => {
       res.clearCookie('userId', {});
       res.json({
           success: true
       });
   });
});

//获取每个知识点的题目信息
router.post('/get_point', redirectLogin, (req, res) => {
    const { userId } = req.session;
    const { pointId } = req.body;
    Point.findOne({
        where: {
            k_id: pointId
        },
        include: [{
            model: Question,
            as: 'Questions',
            include: [{
                model: Option,
                as: 'Options',
                attributes: {
                    exclude: ['q_id']
                }
            }]
        }]
    }).then(p => {
        res.json({
            success: true,
            pointDetail: p.get({
                plain: true
            })
        })
    }).catch(err => {
        console.log(err);
        res.json({
            success: false,
            err_message: '参数错误'
        })
    });
});

module.exports = router;