package com.webdatlichkhambenh.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking database for required tables...");

        createUsersTable();
        createSpecialtiesTable();
        createDoctorsTable();
        createAppointmentsTable();
        createContactTable();

        // Seed initial data if needed
        seedInitialData();
    }

    private void createUsersTable() {
        try {
            String sql = "CREATE TABLE IF NOT EXISTS users (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "username VARCHAR(50) NOT NULL UNIQUE," +
                    "password VARCHAR(255) NOT NULL," +
                    "email VARCHAR(100) NOT NULL UNIQUE," +
                    "full_name VARCHAR(100) NOT NULL," +
                    "phone_number VARCHAR(20)," +
                    "role VARCHAR(20) DEFAULT 'PATIENT'," + // PATIENT, ADMIN, DOCTOR
                    "date_of_birth DATE," +
                    "gender VARCHAR(20)," + // MALE, FEMALE, OTHER
                    "is_active TINYINT(1) DEFAULT 1," +
                    "refresh_token VARCHAR(255)," +
                    "token_expires_at TIMESTAMP NULL," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ")";
            jdbcTemplate.execute(sql);
            System.out.println("Table 'users' checked/created successfully.");
        } catch (Exception e) {
            System.err.println("Error creating 'users' table: " + e.getMessage());
        }
    }

    private void createSpecialtiesTable() {
        try {
            String sql = "CREATE TABLE IF NOT EXISTS specialties (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "specialty_name VARCHAR(100) NOT NULL UNIQUE," +
                    "description TEXT," +
                    "image VARCHAR(255)," +
                    "is_active TINYINT(1) DEFAULT 1," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ")";
            jdbcTemplate.execute(sql);
            System.out.println("Table 'specialties' checked/created successfully.");
        } catch (Exception e) {
            System.err.println("Error creating 'specialties' table: " + e.getMessage());
        }
    }

    private void createDoctorsTable() {
        try {
            String sql = "CREATE TABLE IF NOT EXISTS doctors (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "specialty_id INT," +
                    "full_name VARCHAR(100) NOT NULL," +
                    "email VARCHAR(100) NOT NULL UNIQUE," +
                    "phone VARCHAR(20)," +
                    "specialization VARCHAR(100)," + // Detailed specialization
                    "description TEXT," +
                    "price DECIMAL(10, 2)," +
                    "image VARCHAR(255)," +
                    "is_active TINYINT(1) DEFAULT 1," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL" +
                    ")";
            jdbcTemplate.execute(sql);
            System.out.println("Table 'doctors' checked/created successfully.");
        } catch (Exception e) {
            System.err.println("Error creating 'doctors' table: " + e.getMessage());
        }
    }

    private void createAppointmentsTable() {
        try {
            String sql = "CREATE TABLE IF NOT EXISTS appointments (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "patient_id INT," +
                    "doctor_id INT," +
                    "specialty_id INT," +
                    "appointment_date DATE NOT NULL," +
                    "appointment_time TIME NOT NULL," +
                    "status VARCHAR(20) DEFAULT 'booked'," + // booked, examined, cancelled
                    "symptoms TEXT," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE," +
                    "FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL," +
                    "FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL" +
                    ")";
            jdbcTemplate.execute(sql);
            System.out.println("Table 'appointments' checked/created successfully.");
        } catch (Exception e) {
            System.err.println("Error creating 'appointments' table: " + e.getMessage());
        }
    }

    private void createContactTable() {
        try {
            String sql = "CREATE TABLE IF NOT EXISTS contacts (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "full_name VARCHAR(100) NOT NULL," +
                    "email VARCHAR(100) NOT NULL," +
                    "phone_number VARCHAR(20)," +
                    "subject VARCHAR(200)," +
                    "message TEXT NOT NULL," +
                    "status VARCHAR(20) DEFAULT 'NEW'," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ")";
            jdbcTemplate.execute(sql);
            System.out.println("Table 'contacts' checked/created successfully.");
        } catch (Exception e) {
            System.err.println("Error creating 'contacts' table: " + e.getMessage());
        }

        // Upgrade table if exists (for existing databases)
        try {
            jdbcTemplate.execute("ALTER TABLE contacts ADD COLUMN reply_content TEXT");
            System.out.println("Added reply_content column to contacts.");
        } catch (Exception e) {
            // Check if column already exists or other error (ignore for now as checking
            // existence is verbose in plain JDBC)
            // In a real migration tool like Flyway this is handled better.
        }

        try {
            jdbcTemplate.execute("ALTER TABLE contacts ADD COLUMN reply_time TIMESTAMP NULL");
            System.out.println("Added reply_time column to contacts.");
        } catch (Exception e) {
            // Ignore
        }

        try {
            jdbcTemplate.execute("ALTER TABLE contacts ADD COLUMN image_url VARCHAR(255)");
            System.out.println("Added image_url column to contacts.");
        } catch (Exception e) {
            // Ignore
        }
    }

    private void seedInitialData() {
        try {
            // Check if users table is empty
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            if (userCount != null && userCount == 0) {
                // Insert Admin
                // Note: In real app, password should be hashed. Using plain text or simple hash
                // as placeholder if no security config found.
                // Assuming "123456" for demo.
                String adminSql = "INSERT INTO users (username, password, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)";
                jdbcTemplate.update(adminSql, "admin", "123456", "admin@healthcare.vn", "Administrator", "ADMIN");
                System.out.println("Seeded default admin user.");
            }

            // Check if specialties table is empty
            Integer specialtyCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM specialties", Integer.class);
            if (specialtyCount != null && specialtyCount == 0) {
                jdbcTemplate.update("INSERT INTO specialties (specialty_name, description) VALUES (?, ?)", "Tim Mạch",
                        "Chuyên khoa tim mạch");
                jdbcTemplate.update("INSERT INTO specialties (specialty_name, description) VALUES (?, ?)", "Nhi Khoa",
                        "Chuyên khoa nhi");
                jdbcTemplate.update("INSERT INTO specialties (specialty_name, description) VALUES (?, ?)", "Da Liễu",
                        "Chuyên khoa da liễu");
                jdbcTemplate.update("INSERT INTO specialties (specialty_name, description) VALUES (?, ?)", "Thần Kinh",
                        "Chuyên khoa thần kinh");
                System.out.println("Seeded default specialties.");
            }

            // Check if doctors table is empty
            Integer doctorCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctors", Integer.class);
            if (doctorCount != null && doctorCount == 0) {
                // Get a specialty ID
                try {
                    Integer specialtyId = jdbcTemplate.queryForObject("SELECT id FROM specialties LIMIT 1",
                            Integer.class);
                    if (specialtyId != null) {
                        jdbcTemplate.update(
                                "INSERT INTO doctors (specialty_id, full_name, email, phone, specialization, price) VALUES (?, ?, ?, ?, ?, ?)",
                                specialtyId, "GS. TS. Nguyễn Văn A", "dr.nguyenvana@healthcare.vn", "0901234567",
                                "Tim Mạch", 500000);
                        jdbcTemplate.update(
                                "INSERT INTO doctors (specialty_id, full_name, email, phone, specialization, price) VALUES (?, ?, ?, ?, ?, ?)",
                                specialtyId, "PGS. TS. Trần Thị B", "dr.tranthib@healthcare.vn", "0909876543",
                                "Tim Mạch", 450000);
                        System.out.println("Seeded default doctors.");
                    }
                } catch (Exception e) {
                    System.out.println("Skipping doctor seeding: " + e.getMessage());
                }
            }

        } catch (Exception e) {
            System.err.println("Error seeding data: " + e.getMessage());
        }
    }
}
