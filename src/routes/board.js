const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 로그인 체크
const checkLogin = (req, res, next) => {
    if (req.session.user) return next();
    res.send('<script>alert("로그인이 필요합니다."); location.href="/";</script>');
};

// 1. 게시판 목록 (통합)
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const limit = 10;
    const offset = (page - 1) * limit;

    // 검색 조건 (제목 검색)
    let whereClause = '';
    let queryParams = [];

    if (search) {
        whereClause = 'WHERE title LIKE ?';
        queryParams.push(`%${search}%`);
    }

    // 전체 글 개수 조회
    const countQuery = `SELECT COUNT(*) AS count FROM posts ${whereClause}`;
    
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) throw err;
        
        const totalPosts = countResult[0].count;
        const totalPages = Math.ceil(totalPosts / limit);

        // 목록 조회 (중요: 공지사항(notice)을 맨 위로 올리기 위해 ORDER BY 수정)
        // type = 'notice' DESC : notice가 1(true)이므로 먼저 나옴
        const listQuery = `
            SELECT p.*, u.user_name 
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            ${whereClause}
            ORDER BY (p.type = 'notice') DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const listParams = [...queryParams, limit, offset];

        db.query(listQuery, listParams, (err, posts) => {
            if (err) throw err;
            
            res.render('board/list', {
                title: '게시판',
                posts: posts,
                user: req.session.user,
                currentPage: page,
                totalPages: totalPages,
                search: search
            });
        });
    });
});

// 2. 글쓰기 화면
router.get('/write', checkLogin, (req, res) => {
    res.render('board/write', {
        title: '글쓰기',
        user: req.session.user,
        post: null
    });
});

// 3. 글쓰기 처리
router.post('/write', checkLogin, (req, res) => {
    // 폼에서 type(공지/일반)을 받아옴
    const { title, content, type } = req.body;
    const userId = req.session.user.user_id;

    // 일반 사용자가 강제로 공지사항을 선택해도 'free'로 고정 (보안)
    const finalType = (req.session.user.email === 'admin@example.com') ? type : 'free';

    const query = 'INSERT INTO posts (user_id, type, title, content) VALUES (?, ?, ?, ?)';
    db.query(query, [userId, finalType, title, content], (err) => {
        if (err) throw err;
        res.redirect('/board');
    });
});

// 4. 상세 보기
router.get('/view/:id', (req, res) => {
    const { id } = req.params;

    db.query('UPDATE posts SET views = views + 1 WHERE post_id = ?', [id], (err) => {
        if (err) throw err;

        const query = `
            SELECT p.*, u.user_name, u.user_id 
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.post_id = ?
        `;
        
        db.query(query, [id], (err, results) => {
            if (err) throw err;
            if (results.length === 0) return res.status(404).send('게시글이 없습니다.');

            res.render('board/view', {
                title: results[0].title,
                post: results[0],
                user: req.session.user
            });
        });
    });
});

// 5. 수정 화면
router.get('/edit/:id', checkLogin, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM posts WHERE post_id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        const post = results[0];

        if (post.user_id !== req.session.user.user_id && req.session.user.email !== 'admin@example.com') {
             return res.send('<script>alert("권한이 없습니다."); history.back();</script>');
        }

        res.render('board/write', {
            title: '글 수정',
            user: req.session.user,
            post: post
        });
    });
});

// 6. 수정 처리
router.post('/edit/:id', checkLogin, (req, res) => {
    const { id } = req.params;
    const { title, content, type } = req.body; // type 수정 가능

    const query = 'UPDATE posts SET title = ?, content = ?, type = ? WHERE post_id = ?';
    db.query(query, [title, content, type, id], (err) => {
        if (err) throw err;
        res.redirect(`/board/view/${id}`);
    });
});

// 7. 삭제 처리
router.get('/delete/:id', checkLogin, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM posts WHERE post_id = ? AND (user_id = ? OR ? = "admin@example.com")';
    db.query(query, [id, req.session.user.user_id, req.session.user.email], (err) => {
        if (err) throw err;
        res.redirect('/board');
    });
});

module.exports = router;