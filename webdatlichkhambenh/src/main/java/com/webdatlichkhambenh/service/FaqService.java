package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.Faq;
import com.webdatlichkhambenh.repository.FaqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FaqService {

    @Autowired
    private FaqRepository faqRepository;

    public List<Faq> getActiveFaqs() {
        return faqRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<Faq> getAllFaqs() {
        return faqRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Optional<Faq> getFaqById(Integer id) {
        return faqRepository.findById(id);
    }

    public Faq createFaq(String question, String answer, String category, Integer displayOrder) {
        Faq faq = new Faq(question, answer, category, displayOrder);
        return faqRepository.save(faq);
    }

    public Faq updateFaq(Integer id, String question, String answer, String category, Integer displayOrder, Boolean isActive) {
        Optional<Faq> existingFaq = faqRepository.findById(id);
        if (existingFaq.isPresent()) {
            Faq faq = existingFaq.get();
            if (question != null) faq.setQuestion(question);
            if (answer != null) faq.setAnswer(answer);
            if (category != null) faq.setCategory(category);
            if (displayOrder != null) faq.setDisplayOrder(displayOrder);
            if (isActive != null) faq.setIsActive(isActive);
            return faqRepository.save(faq);
        }
        throw new RuntimeException("FAQ not found with id: " + id);
    }

    public void deleteFaq(Integer id) {
        faqRepository.deleteById(id);
    }

    public Faq toggleActive(Integer id) {
        Optional<Faq> existingFaq = faqRepository.findById(id);
        if (existingFaq.isPresent()) {
            Faq faq = existingFaq.get();
            faq.setIsActive(!faq.getIsActive());
            return faqRepository.save(faq);
        }
        throw new RuntimeException("FAQ not found with id: " + id);
    }
}
