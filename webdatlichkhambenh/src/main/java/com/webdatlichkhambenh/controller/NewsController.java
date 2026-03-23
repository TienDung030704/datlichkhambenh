package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.News;
import com.webdatlichkhambenh.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsService newsService;

    /**
     * Lấy danh sách tin tức công khai với phân trang
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int offset = page * size;
            List<News> newsList = newsService.getAllPublishedNews(offset, size);
            int totalCount = newsService.getPublishedNewsCount();
            
            response.put("success", true);
            response.put("data", newsList);
            response.put("pagination", Map.of(
                "page", page,
                "size", size,
                "totalElements", totalCount,
                "totalPages", (int) Math.ceil((double) totalCount / size)
            ));
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting news: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tin tức nổi bật
     */
    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeaturedNews(
            @RequestParam(defaultValue = "5") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<News> featuredNews = newsService.getFeaturedNews(limit);
            response.put("success", true);
            response.put("data", featuredNews);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting featured news: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy chi tiết tin tức theo ID
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<Map<String, Object>> getNewsDetail(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            News news = newsService.getNewsById(id);
            if (news != null) {
                response.put("success", true);
                response.put("data", news);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy tin tức");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting news detail: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tin tức theo category
     */
    @GetMapping("/public/category/{category}")
    public ResponseEntity<Map<String, Object>> getNewsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int offset = page * size;
            List<News> newsList = newsService.getNewsByCategory(category, offset, size);
            response.put("success", true);
            response.put("data", newsList);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting news by category: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Tìm kiếm tin tức
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNews(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int offset = page * size;
            List<News> newsList = newsService.searchNews(keyword, offset, size);
            response.put("success", true);
            response.put("data", newsList);
            response.put("keyword", keyword);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching news: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách categories
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> categories = newsService.getCategories();
            response.put("success", true);
            response.put("data", categories);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting categories: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    // ========================= ADMIN ENDPOINTS =========================

    /**
     * [ADMIN] Lấy tất cả tin tức với phân trang
     */
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAllNewsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int offset = page * size;
            List<News> newsList = newsService.getAllNewsForAdmin(offset, size);
            int totalCount = newsService.getAllNewsCount();
            
            response.put("success", true);
            response.put("data", newsList);
            response.put("pagination", Map.of(
                "page", page,
                "size", size,
                "totalElements", totalCount,
                "totalPages", (int) Math.ceil((double) totalCount / size)
            ));
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting news for admin: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * [ADMIN] Lấy chi tiết tin tức theo ID
     */
    @GetMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> getNewsForAdmin(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            News news = newsService.getNewsByIdForAdmin(id);
            if (news != null) {
                response.put("success", true);
                response.put("data", news);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy tin tức");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting news for admin: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * [ADMIN] Tạo tin tức mới
     */
    @PostMapping("/admin")
    public ResponseEntity<Map<String, Object>> createNews(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            News news = new News();
            news.setTitle((String) requestData.get("title"));
            news.setSummary((String) requestData.get("summary"));
            news.setContent((String) requestData.get("content"));
            news.setImageUrl((String) requestData.get("imageUrl"));
            news.setAuthor((String) requestData.get("author"));
            news.setCategory((String) requestData.get("category"));
            
            // Convert Boolean objects safely
            Object featuredObj = requestData.get("isFeatured");
            Object publishedObj = requestData.get("isPublished");
            
            news.setFeatured(featuredObj != null && (Boolean) featuredObj);
            news.setPublished(publishedObj != null ? (Boolean) publishedObj : true);
            news.setPublishedAt(LocalDateTime.now());
            
            News createdNews = newsService.createNews(news);
            
            response.put("success", true);
            response.put("data", createdNews);
            response.put("message", "Tạo tin tức thành công");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating news: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * [ADMIN] Cập nhật tin tức
     */
    @PutMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> updateNews(
            @PathVariable int id, 
            @RequestBody Map<String, Object> requestData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            News existingNews = newsService.getNewsByIdForAdmin(id);
            if (existingNews == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy tin tức để cập nhật");
                return ResponseEntity.ok(response);
            }
            
            // Update fields
            existingNews.setTitle((String) requestData.get("title"));
            existingNews.setSummary((String) requestData.get("summary"));
            existingNews.setContent((String) requestData.get("content"));
            existingNews.setImageUrl((String) requestData.get("imageUrl"));
            existingNews.setAuthor((String) requestData.get("author"));
            existingNews.setCategory((String) requestData.get("category"));
            
            Object featuredObj = requestData.get("isFeatured");
            Object publishedObj = requestData.get("isPublished");
            
            existingNews.setFeatured(featuredObj != null && (Boolean) featuredObj);
            existingNews.setPublished(publishedObj != null ? (Boolean) publishedObj : true);
            
            boolean updated = newsService.updateNews(existingNews);
            
            if (updated) {
                response.put("success", true);
                response.put("message", "Cập nhật tin tức thành công");
            } else {
                response.put("success", false);
                response.put("message", "Không thể cập nhật tin tức");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating news: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * [ADMIN] Xóa tin tức
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> deleteNews(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = newsService.deleteNews(id);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa tin tức thành công");
            } else {
                response.put("success", false);
                response.put("message", "Không thể xóa tin tức hoặc tin tức không tồn tại");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting news: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}