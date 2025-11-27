CREATE DATABASE board_db DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE board_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20) NOT NULL, 
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0, -- 조회수
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 초기 관리자 및 사용자 데이터
INSERT INTO users (email, user_name, password) VALUES ('admin@example.com', '관리자', 'admin123');
INSERT INTO users (email, user_name, password) VALUES ('user@example.com', '홍길동', '1234');
select * from users;
