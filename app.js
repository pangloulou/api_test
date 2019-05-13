const express = require('express');

const bodyParser = require('body-parser');
const session = require('express-session');

const db= require('./config/db');

const app = express();
const studentRouter = require('./routes/student');
const tearcherRouer = require('./routes/teacher');
const commonRouter = require('./routes/common');
//测试连接数据库
db.authenticate()
    .then(() => console.log('database connected...'))
    .catch(err => console.log('error:' + err));


//创建json解析
app.use(bodyParser.json())
//创建application/x-www-form-urlencoded解析
app.use(bodyParser.urlencoded({
    extended: false
}));
    
app.get('/', (req, res) => {
    res.send('测试数据库');
});

app.use(session({
    secret: 'again answer_api', //用来对session id相关的cookie进行签名
    resave: false, //是否每次都重新保存未初始化的会话,建议false
    saveUninitialized: true,//是否自动保存未初始化的会话
    cookie: {
        maxAge: 3 * 60 * 60 * 1000// 有效期，单位是毫秒
    }
}));

app.use('/student', studentRouter);
app.use('/teacher', tearcherRouer);
app.use('/api', commonRouter);

app.listen(8006, () => {
    console.log('site started at port 8006');
});