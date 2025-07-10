CREATE TABLE users (
    id INT PREIMARY KEY,
    name VARCHAR(100),
    password: VARCHAR(100),
    icon: VARCHAR(100),
    role: BOOLEAN,
    grade: VARCHAR(50)
)

INSERT INTO (id, name, password, icon, role, grade) VALUES (1, 'yana', '$5$rounds=535000$oRqcTLqSSItl/RNC$YnhB9ug5enKsVt1YMyYbuJu/i0Uzv9J/7GZB/n0XMH5', 'user_1.jpg', 1, 'gold');
INSERT INTO (id, name, password, icon, role, grade) VALUES (2, 'やなちゃん', '$5$rounds=535000$cR5xO9UAC9V9eOrh$Z3/u85ZfuD362YZTAF3Y0Bw3mUBWW/U5XtjbteyTckB ', 'user_2_cat.jpg', 0, 'gold');
