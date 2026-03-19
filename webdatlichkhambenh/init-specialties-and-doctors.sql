-- ===========================
-- DATABASE INITIALIZATION
-- ===========================

-- Create specialties table (if not exists)
CREATE TABLE
IF NOT EXISTS specialties
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR
(255) NOT NULL UNIQUE,
    description TEXT,
    doctor_count INT DEFAULT 10,
    total_doctors INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP
);

-- Create doctors table (if not exists)
CREATE TABLE
IF NOT EXISTS doctors
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    specialty_id INT NOT NULL,
    full_name VARCHAR
(255) NOT NULL,
    email VARCHAR
(255) UNIQUE,
    phone_number VARCHAR
(20),
    address VARCHAR
(255),
    license_number VARCHAR
(100) UNIQUE,
    experience DOUBLE DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY
(specialty_id) REFERENCES specialties
(id)
);

-- ===========================
-- INSERT 8 SPECIALTIES
-- ===========================
INSERT INTO specialties
    (name, description, doctor_count, total_doctors, is_active)
VALUES
    ('Ngoại Tổng Quát', 'Phòng khám chuyên khoa phẫu thuật ngoài', 10, 10, TRUE),
    ('Nội Tổng Quát', 'Phòng khám chuyên khoa nội độc', 10, 10, TRUE),
    ('Nhi', 'Phòng khám chuyên khoa nhi', 10, 10, TRUE),
    ('Sản Phụ Khoa', 'Phòng khám chuyên khoa sản phụ', 10, 10, TRUE),
    ('Tim Mạch', 'Phòng khám chuyên khoa tim mạch', 10, 10, TRUE),
    ('Xương Khớp', 'Phòng khám chuyên khoa xương khớp', 10, 10, TRUE),
    ('Tai Mũi Họng', 'Phòng khám chuyên khoa tai mũi họng', 10, 10, TRUE),
    ('Chân Răng', 'Phòng khám chuyên khoa chân răng', 10, 10, TRUE);

-- ===========================
-- INSERT 10 DOCTORS FOR EACH SPECIALTY (80 doctors total)
-- ===========================

-- Ngoại Tổng Quát (Specialty ID: 1)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (1, 'TS. BS. Nguyễn Văn An', 'an.nguyen@hospital.com', '0901234001', 'TP. HCM', 'LIC001', 15, TRUE),
    (1, 'TS. BS. Trần Thị Bình', 'binh.tran@hospital.com', '0901234002', 'TP. HCM', 'LIC002', 12, TRUE),
    (1, 'TS. BS. Phạm Văn Cường', 'cuong.pham@hospital.com', '0901234003', 'TP. HCM', 'LIC003', 10, TRUE),
    (1, 'TS. BS. Đặng Thị Dung', 'dung.dang@hospital.com', '0901234004', 'TP. HCM', 'LIC004', 8, TRUE),
    (1, 'TS. BS. Hoàng Văn Em', 'em.hoang@hospital.com', '0901234005', 'TP. HCM', 'LIC005', 7, TRUE),
    (1, 'TS. BS. Lê Thị Phương', 'phuong.le@hospital.com', '0901234006', 'TP. HCM', 'LIC006', 9, TRUE),
    (1, 'TS. BS. Võ Văn Giang', 'giang.vo@hospital.com', '0901234007', 'TP. HCM', 'LIC007', 11, TRUE),
    (1, 'TS. BS. Đinh Thị Hạnh', 'hanh.dinh@hospital.com', '0901234008', 'TP. HCM', 'LIC008', 6, TRUE),
    (1, 'TS. BS. Bùi Văn Khoa', 'khoa.bui@hospital.com', '0901234009', 'TP. HCM', 'LIC009', 5, TRUE),
    (1, 'TS. BS. Chử Thị Linh', 'linh.chu@hospital.com', '0901234010', 'TP. HCM', 'LIC010', 13, TRUE);

-- Nội Tổng Quát (Specialty ID: 2)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (2, 'TS. BS. Phạm Văn Minh', 'minh.pham@hospital.com', '0901234011', 'TP. HCM', 'LIC011', 14, TRUE),
    (2, 'TS. BS. Đỗ Thị Nhàn', 'nhan.do@hospital.com', '0901234012', 'TP. HCM', 'LIC012', 11, TRUE),
    (2, 'TS. BS. Nguyễn Văn Oánh', 'oanh.nguyen@hospital.com', '0901234013', 'TP. HCM', 'LIC013', 9, TRUE),
    (2, 'TS. BS. Trương Thị Phương', 'phuong.truong@hospital.com', '0901234014', 'TP. HCM', 'LIC014', 8, TRUE),
    (2, 'TS. BS. Huỳnh Văn Quốc', 'quoc.huynh@hospital.com', '0901234015', 'TP. HCM', 'LIC015', 12, TRUE),
    (2, 'TS. BS. Tạ Thị Rực', 'ruc.ta@hospital.com', '0901234016', 'TP. HCM', 'LIC016', 10, TRUE),
    (2, 'TS. BS. Vũ Văn Sơn', 'son.vu@hospital.com', '0901234017', 'TP. HCM', 'LIC017', 7, TRUE),
    (2, 'TS. BS. Lưu Thị Tâm', 'tam.luu@hospital.com', '0901234018', 'TP. HCM', 'LIC018', 6, TRUE),
    (2, 'TS. BS. Dương Văn Ưu', 'uu.duong@hospital.com', '0901234019', 'TP. HCM', 'LIC019', 5, TRUE),
    (2, 'TS. BS. Giang Thị Vân', 'van.giang@hospital.com', '0901234020', 'TP. HCM', 'LIC020', 13, TRUE);

-- Nhi (Specialty ID: 3)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (3, 'TS. BS. Hồ Văn Công', 'cong.ho@hospital.com', '0901234021', 'TP. HCM', 'LIC021', 16, TRUE),
    (3, 'TS. BS. Khuất Thị Dư', 'du.khuat@hospital.com', '0901234022', 'TP. HCM', 'LIC022', 10, TRUE),
    (3, 'TS. BS. Nghiêm Văn Ế', 'e.nghiem@hospital.com', '0901234023', 'TP. HCM', 'LIC023', 8, TRUE),
    (3, 'TS. BS. Phan Thị Phượng', 'phuong.phan@hospital.com', '0901234024', 'TP. HCM', 'LIC024', 9, TRUE),
    (3, 'TS. BS. Quế Văn Giang', 'giang.que@hospital.com', '0901234025', 'TP. HCM', 'LIC025', 7, TRUE),
    (3, 'TS. BS. Sâm Thị Hồng', 'hong.sam@hospital.com', '0901234026', 'TP. HCM', 'LIC026', 11, TRUE),
    (3, 'TS. BS. Tường Văn Ích', 'ich.tuong@hospital.com', '0901234027', 'TP. HCM', 'LIC027', 6, TRUE),
    (3, 'TS. BS. Ưa Thị Kế', 'ke.ua@hospital.com', '0901234028', 'TP. HCM', 'LIC028', 5, TRUE),
    (3, 'TS. BS. Vương Văn Lệ', 'le.vuong@hospital.com', '0901234029', 'TP. HCM', 'LIC029', 12, TRUE),
    (3, 'TS. BS. Yên Thị Mỹ', 'my.yen@hospital.com', '0901234030', 'TP. HCM', 'LIC030', 14, TRUE);

-- Sản Phụ Khoa (Specialty ID: 4)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (4, 'TS. BS. Chân Văn Nộn', 'non.chan@hospital.com', '0901234031', 'TP. HCM', 'LIC031', 20, TRUE),
    (4, 'TS. BS. Hiền Thị Oánh', 'oanh.hien@hospital.com', '0901234032', 'TP. HCM', 'LIC032', 18, TRUE),
    (4, 'TS. BS. Kiên Văn Phương', 'phuong.kien@hospital.com', '0901234033', 'TP. HCM', 'LIC033', 15, TRUE),
    (4, 'TS. BS. Lâm Thị Quế', 'que.lam@hospital.com', '0901234034', 'TP. HCM', 'LIC034', 12, TRUE),
    (4, 'TS. BS. Miêu Văn Rỉa', 'ria.mieu@hospital.com', '0901234035', 'TP. HCM', 'LIC035', 10, TRUE),
    (4, 'TS. BS. Ngại Thị Sình', 'sinh.ngai@hospital.com', '0901234036', 'TP. HCM', 'LIC036', 9, TRUE),
    (4, 'TS. BS. Ôn Văn Thi', 'thi.on@hospital.com', '0901234037', 'TP. HCM', 'LIC037', 8, TRUE),
    (4, 'TS. BS. Puyên Thị Uyên', 'uyen.phuyen@hospital.com', '0901234038', 'TP. HCM', 'LIC038', 11, TRUE),
    (4, 'TS. BS. Quảng Văn Viễn', 'vien.quang@hospital.com', '0901234039', 'TP. HCM', 'LIC039', 7, TRUE),
    (4, 'TS. BS. Rừng Thị Xạ', 'xa.rung@hospital.com', '0901234040', 'TP. HCM', 'LIC040', 13, TRUE);

-- Tim Mạch (Specialty ID: 5)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (5, 'TS. BS. Sơn Văn Ý', 'y.son@hospital.com', '0901234041', 'TP. HCM', 'LIC041', 22, TRUE),
    (5, 'TS. BS. Thanh Thị Áng', 'ang.thanh@hospital.com', '0901234042', 'TP. HCM', 'LIC042', 19, TRUE),
    (5, 'TS. BS. Thế Văn Bê', 'be.the@hospital.com', '0901234043', 'TP. HCM', 'LIC043', 16, TRUE),
    (5, 'TS. BS. Thịnh Thị Chế', 'che.thinh@hospital.com', '0901234044', 'TP. HCM', 'LIC044', 14, TRUE),
    (5, 'TS. BS. Thuyên Văn Dế', 'de.thuyen@hospital.com', '0901234045', 'TP. HCM', 'LIC045', 11, TRUE),
    (5, 'TS. BS. Tích Thị Ế', 'e.tich@hospital.com', '0901234046', 'TP. HCM', 'LIC046', 10, TRUE),
    (5, 'TS. BS. Tiwu Văn Gế', 'ge.tiwu@hospital.com', '0901234047', 'TP. HCM', 'LIC047', 9, TRUE),
    (5, 'TS. BS. Toàn Thị Hế', 'he.toan@hospital.com', '0901234048', 'TP. HCM', 'LIC048', 8, TRUE),
    (5, 'TS. BS. Tú Văn Ích', 'ich.tu@hospital.com', '0901234049', 'TP. HCM', 'LIC049', 12, TRUE),
    (5, 'TS. BS. Tuấn Thị Kích', 'kich.tuan@hospital.com', '0901234050', 'TP. HCM', 'LIC050', 15, TRUE);

-- Xương Khớp (Specialty ID: 6)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (6, 'TS. BS. Tủi Văn Lặc', 'lac.tui@hospital.com', '0901234051', 'TP. HCM', 'LIC051', 17, TRUE),
    (6, 'TS. BS. Tuyến Thị Mạng', 'mang.tuyen@hospital.com', '0901234052', 'TP. HCM', 'LIC052', 14, TRUE),
    (6, 'TS. BS. Tỳ Văn Nạng', 'nang.ty@hospital.com', '0901234053', 'TP. HCM', 'LIC053', 12, TRUE),
    (6, 'TS. BS. Tỷ Thị Pạng', 'pang.ty@hospital.com', '0901234054', 'TP. HCM', 'LIC054', 10, TRUE),
    (6, 'TS. BS. Ty Văn Quạng', 'quang.ty@hospital.com', '0901234055', 'TP. HCM', 'LIC055', 9, TRUE),
    (6, 'TS. BS. Tỵ Thị Rạng', 'rang.ty@hospital.com', '0901234056', 'TP. HCM', 'LIC056', 11, TRUE),
    (6, 'TS. BS. Tỷ Văn Sạng', 'sang.ty@hospital.com', '0901234057', 'TP. HCM', 'LIC057', 8, TRUE),
    (6, 'TS. BS. Ty Thị Tạo', 'tao.ty@hospital.com', '0901234058', 'TP. HCM', 'LIC058', 7, TRUE),
    (6, 'TS. BS. Tyếu Văn Ứng', 'ung.tyeu@hospital.com', '0901234059', 'TP. HCM', 'LIC059', 13, TRUE),
    (6, 'TS. BS. Tỷnh Thị Vạng', 'vang.tynh@hospital.com', '0901234060', 'TP. HCM', 'LIC060', 15, TRUE);

-- Tai Mũi Họng (Specialty ID: 7)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (7, 'TS. BS. Tầm Văn Xạng', 'xang.tam@hospital.com', '0901234061', 'TP. HCM', 'LIC061', 14, TRUE),
    (7, 'TS. BS. Tâm Thị Yếu', 'yeu.tam@hospital.com', '0901234062', 'TP. HCM', 'LIC062', 12, TRUE),
    (7, 'TS. BS. Tâu Văn Xiêng', 'xieng.tau@hospital.com', '0901234063', 'TP. HCM', 'LIC063', 11, TRUE),
    (7, 'TS. BS. Tẩy Thị Xinh', 'xinh.tay@hospital.com', '0901234064', 'TP. HCM', 'LIC064', 9, TRUE),
    (7, 'TS. BS. Tẳng Văn Xúc', 'xuc.tang@hospital.com', '0901234065', 'TP. HCM', 'LIC065', 8, TRUE),
    (7, 'TS. BS. Tắc Thị Xương', 'xuong.tac@hospital.com', '0901234066', 'TP. HCM', 'LIC066', 10, TRUE),
    (7, 'TS. BS. Tắm Văn Y', 'y.tam@hospital.com', '0901234067', 'TP. HCM', 'LIC067', 7, TRUE),
    (7, 'TS. BS. Tắn Thị Yều', 'yeu.tan@hospital.com', '0901234068', 'TP. HCM', 'LIC068', 13, TRUE),
    (7, 'TS. BS. Tấp Văn Yêu', 'yeu.tap@hospital.com', '0901234069', 'TP. HCM', 'LIC069', 6, TRUE),
    (7, 'TS. BS. Tấr Thị Yêm', 'yem.tar@hospital.com', '0901234070', 'TP. HCM', 'LIC070', 12, TRUE);

-- Chân Răng (Specialty ID: 8)
INSERT INTO doctors
    (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active)
VALUES
    (8, 'TS. BS. Tất Văn Yên', 'yen.tat@hospital.com', '0901234071', 'TP. HCM', 'LIC071', 18, TRUE),
    (8, 'TS. BS. Tâu Thị Yêng', 'yeng.tau@hospital.com', '0901234072', 'TP. HCM', 'LIC072', 15, TRUE),
    (8, 'TS. BS. Tâm Văn Yết', 'yet.tam@hospital.com', '0901234073', 'TP. HCM', 'LIC073', 13, TRUE),
    (8, 'TS. BS. Tất Thị Yêu', 'yeu.tat@hospital.com', '0901234074', 'TP. HCM', 'LIC074', 11, TRUE),
    (8, 'TS. BS. Tấn Văn Yây', 'yay.tan@hospital.com', '0901234075', 'TP. HCM', 'LIC075', 10, TRUE),
    (8, 'TS. BS. Tấp Thị Yêm', 'yem.tap@hospital.com', '0901234076', 'TP. HCM', 'LIC076', 9, TRUE),
    (8, 'TS. BS. Tấu Văn Yếu', 'yeu.tau@hospital.com', '0901234077', 'TP. HCM', 'LIC077', 8, TRUE),
    (8, 'TS. BS. Tầu Thị Yêu', 'yeu.teu@hospital.com', '0901234078', 'TP. HCM', 'LIC078', 12, TRUE),
    (8, 'TS. BS. Tẩu Văn Yê', 'ye.tau@hospital.com', '0901234079', 'TP. HCM', 'LIC079', 7, TRUE),
    (8, 'TS. BS. Tẩn Thị Yảy', 'yay.tan@hospital.com', '0901234080', 'TP. HCM', 'LIC080', 14, TRUE);

-- ===========================
-- VERIFY DATA
-- ===========================
SELECT COUNT(*) as total_specialties
FROM specialties;
SELECT COUNT(*) as total_doctors
FROM doctors;
SELECT s.name, COUNT(d.id) as doctor_count
FROM specialties s LEFT JOIN doctors d ON s.id = d.specialty_id
GROUP BY s.id, s.name;
