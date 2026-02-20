-- =============================================
-- Seed Data: Schedules & Checklist Items
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual auth.users UUID
-- =============================================

-- Update user profile with student data
UPDATE profiles SET
  full_name = 'MUHAMMAD NAILUL GHUFRON MAJID',
  nim = '240605110160',
  major = 'TEKNIK INFORMATIKA',
  semester = 'GENAP 2025/2026'
WHERE id = '61b0692e-6fc5-4bd5-9bd6-c7e424b777a7';

-- =============================================
-- JADWAL KULIAH MINGGUAN
-- day_of_week: 0=Sen, 1=Sel, 2=Rab, 3=Kam, 4=Jum, 5=Sab, 6=Min
-- type: 'campus'
-- =============================================

INSERT INTO schedules (user_id, title, day_of_week, start_time, end_time, type, location, lecturer, sks, class_group) VALUES
-- SENIN (0)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'WEB PROGRAMMING PRACTICUM', 0, '06:30', '08:10', 'campus', 'LAB. MULTIMEDIA', 'TRI MUKTI LESTARI, M.Kom', 1, 'E'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'DATABASE', 0, '08:10', '09:50', 'campus', 'B.306', 'Dr. AGUNG TEGUH WIBOWO ALMAIS, S.Kom, M.T.', 2, 'A'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'DATABASE PRACTICUM', 0, '09:50', '11:30', 'campus', 'LAB. DATABASE', 'ASHRI SHABRINA AFRAH, M.T.', 1, 'H1'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Bahasa Inggris Intensif', 0, '15:30', NULL, 'campus', 'Gedung D', NULL, NULL, NULL),

-- SELASA (1)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'COMPUTER NETWORK', 1, '06:30', '09:00', 'campus', 'B.317', 'JOHAN ERICKA WAHYU PRAKASA, M.Kom', 3, 'C'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'COMPUTER NETWORK PRACTICUM', 1, '09:00', '10:40', 'campus', 'LAB. COMPUTER NETWORK', 'JOHAN ERICKA WAHYU PRAKASA, M.Kom', 1, 'C'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'ALGORITHM COMPLEXITY', 1, '10:40', '12:20', 'campus', 'B.314', 'Dr. IRWAN BUDI SANTOSO, S.Si., M.Kom', 2, 'A'),

-- RABU (2)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'SOFTWARE ENGINEERING PRACTICUM', 2, '06:30', '08:10', 'campus', 'LAB. MOBILE PROGRAMMING', 'Dr. AGUNG TEGUH WIBOWO ALMAIS, S.Kom, M.T.', 1, 'B'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'SOFTWARE ENGINEERING', 2, '09:00', '11:30', 'campus', 'B.316', 'H. FATCHURROCHMAN, M.Kom', 3, 'H'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'DATA SCIENCE', 2, '11:30', '14:00', 'campus', 'B.307', 'Dr. RIRIEN KUSUMAWATI, S.Si., M.Kom', 3, 'A'),

-- KAMIS (3)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'WEB PROGRAMMING', 3, '06:30', '08:10', 'campus', 'B.306', 'A''LA SYAUQI, M.Kom', 2, 'D'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'STUDI AL-QURAN DAN AL-HADITS', 3, '12:20', '14:00', 'campus', 'B.307', 'Dr. H. MOCHAMAD IMAMUDIN, Lc., M.A', 2, 'E'),

-- JUMAT (4)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'BAHASA INGGRIS AKADEMIK', 4, '09:00', '11:30', 'campus', 'D.222', 'RUQOYYAH YULIA HASANAH DHOMIRI, S.Pd., M.Pd', 3, 'H');


-- =============================================
-- JADWAL MA'HAD MINGGUAN
-- type: 'mahad'
-- =============================================

INSERT INTO schedules (user_id, title, day_of_week, start_time, end_time, type, location, class_group, description) VALUES
-- SENIN (0)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Sobahul Lughoh', 0, '05:30', '06:00', 'mahad', 'Aula', 'Dampingan', NULL),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Ta''lim Afkar', 0, '19:30', '21:00', 'mahad', 'Halaqoh', 'Kelas Mutawasith', 'Membawa Absensi, Kitab Tahzib'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Rapat Evaluasi', 0, '22:00', '22:30', 'mahad', 'Aula', NULL, NULL),

-- SELASA (1)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Ta''lim Qur''an', 1, '19:30', '21:00', 'mahad', 'Gedung C (211)', 'Kelas Asasi D', 'Membawa Absensi'),

-- RABU (2)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Sosialisasi Keagamaan', 2, '05:30', '06:00', 'mahad', 'Lantai 1', 'Kelas B.1', 'Mengingatkan Dampingan Jadwal Soskeg Dimalamnya'),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Ta''lim Afkar', 2, '19:30', '21:00', 'mahad', 'Halaqoh', 'Kelas Mutawasith', 'Membawa Absensi, Kitab Qomi'''),

-- KAMIS (3)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Sobahul Lughoh', 3, '05:30', '06:00', 'mahad', 'Aula', 'Dampingan', NULL),

-- JUMAT (4)
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Sobahul Qur''an', 4, '05:30', '06:00', 'mahad', 'Dikamar (Fleksibel)', 'Dampingan', NULL),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Ta''lim Qur''an', 4, '19:30', '21:00', 'mahad', 'Gedung C (211)', 'Kelas Asasi D', 'Membawa Absensi');


-- =============================================
-- CHECKLIST ITEMS (Daily Prayers / Solat Jama'ah)
-- category: 'daily'
-- =============================================

INSERT INTO checklist_items (user_id, title, category, sort_order) VALUES
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Subuh', 'daily', 1),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Dhuhur', 'daily', 2),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Ashar', 'daily', 3),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Maghrib', 'daily', 4),
('61b0692e-6fc5-4bd5-9bd6-c7e424b777a7', 'Isya', 'daily', 5);
