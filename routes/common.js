const express = require('express');
const router = express.Router();

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

//获取系统里面前10个课程
router.get('/get_first_ten', (req, res) => {
    Course.findAndCountAll({
        // offset: 10, //跳过实例条数
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

//获取每门课的详细信息，包括知识点和题目
router.post('/get_full_course', redirectLogin, (req, res) => {
    const { courseId } = req.body;
    // var courseId = 7;
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
        res.json({
            success: true,
            full_course: c.get({
                plain: true
            })
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
           'status': 'success'
       });
   });
});


module.exports = router;