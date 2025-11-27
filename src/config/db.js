const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // DB 사용자명
  password: 'jungji99@@',  // DB 비밀번호
  database: 'board_db'   
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;