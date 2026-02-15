package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ChatBotService {

    private final Map<String, String> symptomMap = new HashMap<>();
    private final Map<String, String> knowledgeBase = new HashMap<>();

    @org.springframework.beans.factory.annotation.Autowired
    private DoctorService doctorService;

    public ChatBotService() {
        // Khởi tạo kiến thức cơ bản (FAQ)
        knowledgeBase.put("giá",
                "<b>Bảng giá khám bệnh cơ bản:</b><br>- Khám thường: 200.000đ<br>- Khám Giáo sư: 500.000đ<br>- Khám chuyên gia: 350.000đ");
        knowledgeBase.put("giờ", "<b>Giờ làm việc:</b><br>Thứ 2 - Thứ 7<br>Sáng: 7:30 - 11:30<br>Chiều: 13:30 - 17:30");
        knowledgeBase.put("địa chỉ", "<b>Địa chỉ phòng khám:</b><br>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội.");
        knowledgeBase.put("đặt lịch",
                "Bạn có thể đặt lịch ngay tại trang chủ hoặc bấm vào nút <b>'Đặt lịch khám'</b> phía trên.");
        knowledgeBase.put("hotline", "<b>Hotline hỗ trợ:</b> 1900.1234 (Miễn phí cước gọi).");

        // Ánh xạ Triệu chứng -> Chuyên khoa
        symptomMap.put("đau đầu", "Thần Kinh");
        symptomMap.put("chóng mặt", "Thần Kinh");
        symptomMap.put("mất ngủ", "Thần Kinh");
        symptomMap.put("đau tim", "Tim Mạch");
        symptomMap.put("tức ngực", "Tim Mạch");
        symptomMap.put("huyết áp", "Tim Mạch");
        symptomMap.put("ho", "Nhi Khoa");
        symptomMap.put("sốt", "Nhi Khoa");
        symptomMap.put("đau bụng", "Nhi Khoa");
        symptomMap.put("ngứa", "Da Liễu");
        symptomMap.put("nổi mẩn", "Da Liễu");
        symptomMap.put("mụn", "Da Liễu");
    }

    /**
     * Phân tích tin nhắn và trả lời tự động
     */
    public ChatMessage analyzeAndReply(ChatMessage userMessage) {
        if (userMessage == null || userMessage.getContent() == null)
            return null;

        String content = userMessage.getContent().toLowerCase();

        // 1. Kiểm tra Triệu chứng (Gợi ý thông minh)
        for (Map.Entry<String, String> entry : symptomMap.entrySet()) {
            if (content.contains(entry.getKey())) {
                String symptom = entry.getKey();
                String specialty = entry.getValue();

                // Tìm bác sĩ
                java.util.List<java.util.Map<String, Object>> doctors = doctorService
                        .findDoctorsBySpecialtyKeyword(specialty);

                StringBuilder responseHtml = new StringBuilder();
                responseHtml.append("Tôi thấy bạn nhắc đến triệu chứng <b>'").append(symptom).append("'</b>.");
                responseHtml.append("<br>Theo kinh nghiệm y khoa, bạn có thể cần khám chuyên khoa <b>")
                        .append(specialty).append("</b>.");

                if (!doctors.isEmpty()) {
                    responseHtml
                            .append("<br>Dưới đây là một số bác sĩ phù hợp:<br><div class='doctor-cards-container'>");

                    for (java.util.Map<String, Object> doc : doctors) {
                        String name = (String) doc.get("fullName");
                        String price = doc.get("price") != null
                                ? String.format("%,.0fđ", ((Number) doc.get("price")).doubleValue())
                                : "Liên hệ";

                        responseHtml.append("<div class='mini-doctor-card'>");
                        // Icon mặc định
                        responseHtml.append("<div class='doc-icon'><i class='fas fa-user-md'></i></div>");
                        responseHtml.append("<div class='doc-info'>");
                        responseHtml.append("<div class='doc-name'>").append(name).append("</div>");
                        responseHtml.append("<div class='doc-price'>").append(price).append("</div>");
                        responseHtml.append("</div>");
                        responseHtml.append(
                                "<button class='doc-book-btn' onclick=\"window.location.href='/html/booking.html'\">Đặt ngay</button>");
                        responseHtml.append("</div>");
                    }
                    responseHtml.append("</div>");
                } else {
                    responseHtml
                            .append("<br>Hiện tại tôi chưa tìm thấy bác sĩ nào thuộc chuyên khoa này đang trực tuyến.");
                    responseHtml.append(
                            "<br>Bạn vui lòng liên hệ Hotline <b>1900.1607</b> để được hỗ trợ đặt lịch nhanh nhất.");
                }

                return createBotReply(responseHtml.toString(), userMessage.getSender());
            }
        }

        // 2. Kiểm tra từ khóa (FAQ)
        for (Map.Entry<String, String> entry : knowledgeBase.entrySet()) {
            if (content.contains(entry.getKey())) {
                return createBotReply(entry.getValue(), userMessage.getSender());
            }
        }

        // 3. Chào hỏi
        if (content.contains("chào") || content.contains("hi") || content.contains("hello")
                || content.contains("alo")) {
            return createBotReply(
                    "Chào bạn! Tôi là <b>Trợ lý ảo Y tế</b>.<br>Bạn đang gặp vấn đề gì về sức khỏe? <br><i>(Ví dụ: Đau đầu, nổi mẩn ngứa,...)</i>",
                    userMessage.getSender());
        }

        // 4. Mặc định (Không hiểu)
        return createBotReply(
                "Xin lỗi, tôi chưa hiểu rõ ý bạn. <br>Bạn có thể thử các từ khóa: <b>Giá khám</b>, <b>Giờ làm việc</b>, hoặc mô tả triệu chứng như <b>Đau đầu</b>, <b>Sốt</b>...",
                userMessage.getSender());
    }

    private ChatMessage createBotReply(String content, String recipient) {
        ChatMessage reply = new ChatMessage();
        reply.setType(ChatMessage.MessageType.CHAT);
        reply.setSender("Medical Bot");
        reply.setRecipient(recipient);
        reply.setContent(content);
        reply.setTimestamp(System.currentTimeMillis());
        return reply;
    }
}
