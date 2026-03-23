package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.Faq;
import com.webdatlichkhambenh.repository.FaqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VectorStoreService {

    @Autowired
    private AiService aiService;

    @Autowired
    private FaqRepository faqRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // In-memory store
    private static class VectorNode {
        String content;
        float[] vector;

        VectorNode(String content, float[] vector, Map<String, Object> metadata) {
            this.content = content;
            this.vector = vector;
        }
    }

    private final List<VectorNode> vectorStore = new ArrayList<>();

    @PostConstruct
    public void init() {
        // Index data in background to not block startup
        new Thread(this::indexData).start();
    }

    public synchronized void indexData() {
        System.out.println("Manual RAG: Starting data indexing...");
        vectorStore.clear();

        // 1. Index FAQs
        try {
            List<Faq> faqs = faqRepository.findAll();
            for (Faq faq : faqs) {
                if (faq.getIsActive()) {
                    String content = "Hỏi: " + faq.getQuestion() + "\nTrả lời: " + faq.getAnswer();
                    float[] vector = aiService.getEmbedding(content);
                    if (vector != null) {
                        Map<String, Object> meta = new HashMap<>();
                        meta.put("type", "FAQ");
                        vectorStore.add(new VectorNode(content, vector, meta));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("RAG Error (FAQ): " + e.getMessage());
        }

        // 2. Index Specialties
        try {
            String specialtySql = "SELECT specialty_name, description FROM specialties WHERE is_active = 1";
            jdbcTemplate.query(specialtySql, (rs, rowNum) -> {
                String content = "Chuyên khoa: " + rs.getString("specialty_name") + "\nMô tả: " + rs.getString("description");
                float[] vector = aiService.getEmbedding(content);
                if (vector != null) {
                    Map<String, Object> meta = new HashMap<>();
                    meta.put("type", "Specialty");
                    vectorStore.add(new VectorNode(content, vector, meta));
                }
                return null;
            });
        } catch (Exception e) {
            System.err.println("RAG Error (Specialty): " + e.getMessage());
        }

        // 3. Index Doctors
        try {
            String doctorSql = "SELECT d.full_name, s.specialty_name, d.specialization, d.price " +
                              "FROM doctors d JOIN specialties s ON d.specialty_id = s.id WHERE d.is_active = 1";
            jdbcTemplate.query(doctorSql, (rs, rowNum) -> {
                String content = "Bác sĩ: " + rs.getString("full_name") + 
                             "\nChuyên khoa: " + rs.getString("specialty_name") + 
                             "\nChuyên môn chi tiết: " + rs.getString("specialization") + 
                             "\nGiá khám: " + rs.getBigDecimal("price") + " VNĐ";
                float[] vector = aiService.getEmbedding(content);
                if (vector != null) {
                    Map<String, Object> meta = new HashMap<>();
                    meta.put("type", "Doctor");
                    vectorStore.add(new VectorNode(content, vector, meta));
                }
                return null;
            });
        } catch (Exception e) {
            System.err.println("RAG Error (Doctor): " + e.getMessage());
        }

        System.out.println("Manual RAG: Indexing complete. Total nodes: " + vectorStore.size());
    }

    public String findRelevantContext(String query) {
        if (vectorStore.isEmpty()) return "";

        float[] queryVector = aiService.getEmbedding(query);
        if (queryVector == null) return "";

        // Similarity search
        List<ScoredNode> results = new ArrayList<>();
        for (VectorNode node : vectorStore) {
            double similarity = cosineSimilarity(queryVector, node.vector);
            if (similarity > 0.6) { // Threshold
                results.add(new ScoredNode(node.content, similarity));
            }
        }

        // Sort by similarity descending
        results.sort((a, b) -> Double.compare(b.score, a.score));

        // Take top 3
        return results.stream()
            .limit(3)
            .map(n -> n.content)
            .collect(Collectors.joining("\n---\n"));
    }

    private static class ScoredNode {
        String content;
        double score;
        ScoredNode(String content, double score) {
            this.content = content;
            this.score = score;
        }
    }

    private double cosineSimilarity(float[] vectorA, float[] vectorB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
