package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PatientProfileService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private void ensureTableExists() {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS patient_profiles (
                id          INT PRIMARY KEY AUTO_INCREMENT,
                user_id     BIGINT NOT NULL,
                ho_ten      VARCHAR(100) NOT NULL,
                ngay_sinh   DATE,
                gioi_tinh   VARCHAR(10),
                so_dien_thoai VARCHAR(20),
                dia_chi     VARCHAR(255),
                bao_hiem    VARCHAR(100),
                allergy_status VARCHAR(20) DEFAULT 'unknown',
                allergy_notes TEXT,
                is_default  TINYINT(1) DEFAULT 0,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_pp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """);
    }

    private Long findUserId(String usernameOrEmail) {
        String sql = "SELECT id FROM users WHERE (username = ? OR email = ?) AND is_active = 1 LIMIT 1";
        List<Long> ids = jdbcTemplate.query(sql, (rs, r) -> rs.getLong("id"), usernameOrEmail, usernameOrEmail);
        return ids.isEmpty() ? null : ids.get(0);
    }

    public List<Map<String, Object>> getDanhSachHoSo(String usernameOrEmail) {
        ensureTableExists();
        Long userId = findUserId(usernameOrEmail);
        if (userId == null) return List.of();

        String sql = """
            SELECT id, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi, bao_hiem, 
                   allergy_status, allergy_notes, is_default, created_at
            FROM patient_profiles
            WHERE user_id = ?
            ORDER BY is_default DESC, created_at ASC
            """;
        List<Map<String, Object>> profiles = jdbcTemplate.queryForList(sql, userId);

        for (Map<String, Object> p : profiles) {
            p.put("hoTen", p.get("ho_ten"));
            p.put("ngaySinh", p.get("ngay_sinh"));
            p.put("gioiTinh", p.get("gioi_tinh"));
            p.put("soDienThoai", p.get("so_dien_thoai"));
            p.put("diaChi", p.get("dia_chi"));
            p.put("baoHiem", p.get("bao_hiem"));
            p.put("allergyStatus", p.get("allergy_status"));
            p.put("allergyNotes", p.get("allergy_notes"));
            p.put("isDefault", p.get("is_default"));
            p.put("createdAt", p.get("created_at"));
            p.remove("ho_ten"); p.remove("ngay_sinh"); p.remove("gioi_tinh");
            p.remove("so_dien_thoai"); p.remove("dia_chi"); p.remove("bao_hiem");
            p.remove("allergy_status"); p.remove("allergy_notes");
            p.remove("is_default"); p.remove("created_at");
        }
        return profiles;
    }

    public Map<String, Object> themHoSo(String usernameOrEmail, Map<String, Object> data) {
        ensureTableExists();
        Map<String, Object> response = new HashMap<>();
        Long userId = findUserId(usernameOrEmail);
        if (userId == null) {
            response.put("success", false);
            response.put("message", "Không tìm thấy tài khoản");
            return response;
        }

        String hoTen = asString(data.get("hoTen"));
        if (hoTen == null || hoTen.isBlank()) {
            response.put("success", false);
            response.put("message", "Họ tên không được để trống");
            return response;
        }

        // Kiểm tra giới hạn 5 hồ sơ/tài khoản
        int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patient_profiles WHERE user_id = ?", Integer.class, userId);
        if (count >= 5) {
            response.put("success", false);
            response.put("message", "Mỗi tài khoản chỉ được tạo tối đa 5 hồ sơ");
            return response;
        }

        // Nếu đây là hồ sơ đầu tiên thì set is_default = 1
        boolean isDefault = (count == 0);

        String sql = """
            INSERT INTO patient_profiles (user_id, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi, bao_hiem, 
                                        allergy_status, allergy_notes, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, userId);
            ps.setString(2, hoTen.trim());
            ps.setObject(3, data.get("ngaySinh"));
            ps.setString(4, asString(data.get("gioiTinh")));
            ps.setString(5, asString(data.get("soDienThoai")));
            ps.setString(6, asString(data.get("diaChi")));
            ps.setString(7, asString(data.get("baoHiem")));
            ps.setString(8, data.get("allergyStatus") != null ? asString(data.get("allergyStatus")) : "unknown");
            ps.setString(9, asString(data.get("allergyNotes")));
            ps.setInt(10, isDefault ? 1 : 0);
            return ps;
        }, keyHolder);

        response.put("success", true);
        response.put("message", "Thêm hồ sơ thành công");
        response.put("id", keyHolder.getKey().intValue());
        return response;
    }

    public Map<String, Object> capNhatHoSo(String usernameOrEmail, int profileId, Map<String, Object> data) {
        ensureTableExists();
        Map<String, Object> response = new HashMap<>();
        Long userId = findUserId(usernameOrEmail);
        if (userId == null) {
            response.put("success", false);
            response.put("message", "Không tìm thấy tài khoản");
            return response;
        }

        // Kiểm tra profile thuộc user
        int owns = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM patient_profiles WHERE id = ? AND user_id = ?", Integer.class, profileId, userId);
        if (owns == 0) {
            response.put("success", false);
            response.put("message", "Không tìm thấy hồ sơ");
            return response;
        }

        String hoTen = asString(data.get("hoTen"));
        if (hoTen == null || hoTen.isBlank()) {
            response.put("success", false);
            response.put("message", "Họ tên không được để trống");
            return response;
        }

        jdbcTemplate.update("""
            UPDATE patient_profiles
            SET ho_ten = ?, ngay_sinh = ?, gioi_tinh = ?, so_dien_thoai = ?, dia_chi = ?, bao_hiem = ?, 
                allergy_status = ?, allergy_notes = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
            """,
            hoTen.trim(), data.get("ngaySinh"), asString(data.get("gioiTinh")),
            asString(data.get("soDienThoai")), asString(data.get("diaChi")),
            asString(data.get("baoHiem")), 
            asString(data.get("allergyStatus")), asString(data.get("allergyNotes")),
            profileId, userId);

        response.put("success", true);
        response.put("message", "Cập nhật hồ sơ thành công");
        return response;
    }

    public Map<String, Object> xoaHoSo(String usernameOrEmail, int profileId) {
        Map<String, Object> response = new HashMap<>();
        Long userId = findUserId(usernameOrEmail);
        if (userId == null) {
            response.put("success", false);
            response.put("message", "Không tìm thấy tài khoản");
            return response;
        }

        int rows = jdbcTemplate.update(
            "DELETE FROM patient_profiles WHERE id = ? AND user_id = ?", profileId, userId);

        if (rows == 0) {
            response.put("success", false);
            response.put("message", "Không tìm thấy hồ sơ");
            return response;
        }

        // Nếu xóa hồ sơ mặc định, set hồ sơ còn lại đầu tiên làm mặc định
        jdbcTemplate.update("""
            UPDATE patient_profiles SET is_default = 1
            WHERE user_id = ? AND id = (SELECT id FROM (
                SELECT id FROM patient_profiles WHERE user_id = ? ORDER BY created_at ASC LIMIT 1
            ) t)
            """, userId, userId);

        response.put("success", true);
        response.put("message", "Xóa hồ sơ thành công");
        return response;
    }

    public Map<String, Object> datLamMacDinh(String usernameOrEmail, int profileId) {
        Map<String, Object> response = new HashMap<>();
        Long userId = findUserId(usernameOrEmail);
        if (userId == null) {
            response.put("success", false);
            response.put("message", "Không tìm thấy tài khoản");
            return response;
        }

        int owns = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM patient_profiles WHERE id = ? AND user_id = ?", Integer.class, profileId, userId);
        if (owns == 0) {
            response.put("success", false);
            response.put("message", "Không tìm thấy hồ sơ");
            return response;
        }

        jdbcTemplate.update("UPDATE patient_profiles SET is_default = 0 WHERE user_id = ?", userId);
        jdbcTemplate.update("UPDATE patient_profiles SET is_default = 1 WHERE id = ? AND user_id = ?", profileId, userId);

        response.put("success", true);
        response.put("message", "Đã đặt làm hồ sơ mặc định");
        return response;
    }

    private String asString(Object obj) {
        if (obj == null) return null;
        String s = obj.toString().trim();
        return s.isEmpty() ? null : s;
    }
}
