package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.News;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class NewsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * RowMapper để map ResultSet thành News object
     */
    private RowMapper<News> newsRowMapper = new RowMapper<News>() {
        @Override
        public News mapRow(ResultSet rs, int rowNum) throws SQLException {
            News news = new News();
            news.setId(rs.getInt("id"));
            news.setTitle(rs.getString("title"));
            news.setSummary(rs.getString("summary"));
            news.setContent(rs.getString("content"));
            news.setImageUrl(rs.getString("image_url"));
            news.setAuthor(rs.getString("author"));
            news.setCategory(rs.getString("category"));
            news.setViewCount(rs.getInt("view_count"));
            news.setFeatured(rs.getBoolean("is_featured"));
            news.setPublished(rs.getBoolean("is_published"));
            
            Timestamp publishedAt = rs.getTimestamp("published_at");
            if (publishedAt != null) {
                news.setPublishedAt(publishedAt.toLocalDateTime());
            }
            
            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                news.setCreatedAt(createdAt.toLocalDateTime());
            }
            
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                news.setUpdatedAt(updatedAt.toLocalDateTime());
            }
            
            return news;
        }
    };

    /**
     * Lấy tất cả tin tức đã publish với phân trang
     */
    public List<News> getAllPublishedNews(int offset, int limit) {
        try {
            String sql = "SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?";
            return jdbcTemplate.query(sql, newsRowMapper, limit, offset);
        } catch (Exception e) {
            System.err.println("Error getting published news: " + e.getMessage());
            throw new RuntimeException("Failed to get published news", e);
        }
    }

    /**
     * Lấy tin tức featured (nổi bật)
     */
    public List<News> getFeaturedNews(int limit) {
        try {
            String sql = "SELECT * FROM news WHERE is_published = 1 AND is_featured = 1 ORDER BY published_at DESC LIMIT ?";
            return jdbcTemplate.query(sql, newsRowMapper, limit);
        } catch (Exception e) {
            System.err.println("Error getting featured news: " + e.getMessage());
            throw new RuntimeException("Failed to get featured news", e);
        }
    }

    /**
     * Lấy tin tức theo category
     */
    public List<News> getNewsByCategory(String category, int offset, int limit) {
        try {
            String sql = "SELECT * FROM news WHERE is_published = 1 AND category = ? ORDER BY published_at DESC LIMIT ? OFFSET ?";
            return jdbcTemplate.query(sql, newsRowMapper, category, limit, offset);
        } catch (Exception e) {
            System.err.println("Error getting news by category: " + e.getMessage());
            throw new RuntimeException("Failed to get news by category", e);
        }
    }

    /**
     * Lấy chi tiết tin tức theo ID
     */
    public News getNewsById(int id) {
        try {
            String sql = "SELECT * FROM news WHERE id = ? AND is_published = 1";
            News news = jdbcTemplate.queryForObject(sql, newsRowMapper, id);
            
            // Tăng view count khi đọc tin
            incrementViewCount(id);
            
            return news;
        } catch (EmptyResultDataAccessException e) {
            return null;
        } catch (Exception e) {
            System.err.println("Error getting news by ID: " + e.getMessage());
            throw new RuntimeException("Failed to get news by ID", e);
        }
    }

    /**
     * Tăng lượt xem cho tin tức
     */
    private void incrementViewCount(int newsId) {
        try {
            String sql = "UPDATE news SET view_count = view_count + 1 WHERE id = ?";
            jdbcTemplate.update(sql, newsId);
        } catch (Exception e) {
            System.err.println("Error incrementing view count: " + e.getMessage());
        }
    }

    /**
     * Tìm kiếm tin tức
     */
    public List<News> searchNews(String keyword, int offset, int limit) {
        try {
            String sql = "SELECT * FROM news WHERE is_published = 1 AND " +
                        "(title LIKE ? OR summary LIKE ? OR content LIKE ?) " +
                        "ORDER BY published_at DESC LIMIT ? OFFSET ?";
            String searchPattern = "%" + keyword + "%";
            return jdbcTemplate.query(sql, newsRowMapper, searchPattern, searchPattern, searchPattern, limit, offset);
        } catch (Exception e) {
            System.err.println("Error searching news: " + e.getMessage());
            throw new RuntimeException("Failed to search news", e);
        }
    }

    /**
     * Đếm tổng số tin tức đã publish
     */
    public int getPublishedNewsCount() {
        try {
            String sql = "SELECT COUNT(*) FROM news WHERE is_published = 1";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            System.err.println("Error counting published news: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Lấy danh sách categories
     */
    public List<String> getCategories() {
        try {
            String sql = "SELECT DISTINCT category FROM news WHERE is_published = 1 ORDER BY category";
            return jdbcTemplate.queryForList(sql, String.class);
        } catch (Exception e) {
            System.err.println("Error getting categories: " + e.getMessage());
            throw new RuntimeException("Failed to get categories", e);
        }
    }

    // ========================= ADMIN METHODS =========================

    /**
     * Lấy tất cả tin tức cho admin (bao gồm unpublished)
     */
    public List<News> getAllNewsForAdmin(int offset, int limit) {
        try {
            String sql = "SELECT * FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?";
            return jdbcTemplate.query(sql, newsRowMapper, limit, offset);
        } catch (Exception e) {
            System.err.println("Error getting all news for admin: " + e.getMessage());
            throw new RuntimeException("Failed to get all news", e);
        }
    }

    /**
     * Tạo tin tức mới
     */
    public News createNews(News news) {
        try {
            String sql = "INSERT INTO news (title, summary, content, image_url, author, category, " +
                        "is_featured, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            KeyHolder keyHolder = new GeneratedKeyHolder();
            
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
                ps.setString(1, news.getTitle());
                ps.setString(2, news.getSummary());
                ps.setString(3, news.getContent());
                ps.setString(4, news.getImageUrl());
                ps.setString(5, news.getAuthor());
                ps.setString(6, news.getCategory());
                ps.setBoolean(7, news.isFeatured());
                ps.setBoolean(8, news.isPublished());
                ps.setTimestamp(9, Timestamp.valueOf(news.getPublishedAt()));
                return ps;
            }, keyHolder);
            
            Number generatedId = keyHolder.getKey();
            if (generatedId != null) {
                news.setId(generatedId.intValue());
            }
            
            return news;
        } catch (Exception e) {
            System.err.println("Error creating news: " + e.getMessage());
            throw new RuntimeException("Failed to create news", e);
        }
    }

    /**
     * Cập nhật tin tức
     */
    public boolean updateNews(News news) {
        try {
            String sql = "UPDATE news SET title = ?, summary = ?, content = ?, image_url = ?, " +
                        "author = ?, category = ?, is_featured = ?, is_published = ?, " +
                        "published_at = ?, updated_at = NOW() WHERE id = ?";
            
            int rowsAffected = jdbcTemplate.update(sql, 
                news.getTitle(), 
                news.getSummary(), 
                news.getContent(), 
                news.getImageUrl(),
                news.getAuthor(), 
                news.getCategory(), 
                news.isFeatured(), 
                news.isPublished(),
                Timestamp.valueOf(news.getPublishedAt()),
                news.getId());
            
            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("Error updating news: " + e.getMessage());
            throw new RuntimeException("Failed to update news", e);
        }
    }

    /**
     * Xóa tin tức
     */
    public boolean deleteNews(int id) {
        try {
            String sql = "DELETE FROM news WHERE id = ?";
            int rowsAffected = jdbcTemplate.update(sql, id);
            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("Error deleting news: " + e.getMessage());
            throw new RuntimeException("Failed to delete news", e);
        }
    }

    /**
     * Lấy tin tức theo ID cho admin (bao gồm unpublished)
     */
    public News getNewsByIdForAdmin(int id) {
        try {
            String sql = "SELECT * FROM news WHERE id = ?";
            return jdbcTemplate.queryForObject(sql, newsRowMapper, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        } catch (Exception e) {
            System.err.println("Error getting news by ID for admin: " + e.getMessage());
            throw new RuntimeException("Failed to get news by ID", e);
        }
    }

    /**
     * Đếm tổng số tin tức cho admin
     */
    public int getAllNewsCount() {
        try {
            String sql = "SELECT COUNT(*) FROM news";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            System.err.println("Error counting all news: " + e.getMessage());
            return 0;
        }
    }
}