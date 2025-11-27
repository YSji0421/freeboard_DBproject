const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 로그인 페이지
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/board'); // 수정됨: /board/notice -> /board
    }
    res.render('login');
});

// 회원가입 페이지
router.get('/signup', (req, res) => {
    res.render('signup');
});

// 로그인 처리
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    db.query(query, [email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            req.session.user = user;
            
            // [중요] 로그인 성공 시 통합 게시판(/board)으로 이동
            res.redirect('/board'); 
        } else {
            res.render('login', { error: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }
    });
});

// 회원가입 처리
router.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)';
    
    db.query(query, [username, email, password], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.render('signup', { error: '이미 등록된 이메일입니다.' });
            }
            throw err;
        }
        res.redirect('/');
    });
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        // 로그아웃 에러 시에도 /board로 이동하거나 에러 처리
        if (err) return res.redirect('/board'); 
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;