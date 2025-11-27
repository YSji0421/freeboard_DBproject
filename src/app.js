const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./config/db'); // DB 연결 설정

const app = express();
const port = 3000;

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

// 라우터 등록
const authRouter = require('./routes/auth'); // 로그인/회원가입 (구현 생략하거나 기존 todos 코드 재사용)
const boardRouter = require('./routes/board'); // 핵심 게시판 라우터

app.use('/', authRouter);
app.use('/board', boardRouter); // /board 경로로 연결

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});