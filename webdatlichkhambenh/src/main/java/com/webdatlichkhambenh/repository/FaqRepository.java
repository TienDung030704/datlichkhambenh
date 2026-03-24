package com.webdatlichkhambenh.repository;

import com.webdatlichkhambenh.model.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Integer> {

    List<Faq> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<Faq> findAllByOrderByDisplayOrderAsc();
}
