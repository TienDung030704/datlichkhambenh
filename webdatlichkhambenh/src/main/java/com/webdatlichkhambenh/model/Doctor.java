package com.webdatlichkhambenh.model;

import java.util.Set;

public class Doctor {
    private Integer id;
    private Integer specialtyId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String licenseNumber;
    private Double experience;
    private Set<Integer> workDays; // 2-7 (Thứ 2 - Thứ 7)
    private Boolean isActive;
    private String specialtyName;

    // Constructors
    public Doctor() {
    }

    public Doctor(Integer id, Integer specialtyId, String fullName, String email,
            String phoneNumber, String address, String licenseNumber, Double experience,
            Boolean isActive) {
        this.id = id;
        this.specialtyId = specialtyId;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.licenseNumber = licenseNumber;
        this.experience = experience;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSpecialtyId() {
        return specialtyId;
    }

    public void setSpecialtyId(Integer specialtyId) {
        this.specialtyId = specialtyId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public Double getExperience() {
        return experience;
    }

    public void setExperience(Double experience) {
        this.experience = experience;
    }

    public Set<Integer> getWorkDays() {
        return workDays;
    }

    public void setWorkDays(Set<Integer> workDays) {
        this.workDays = workDays;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getSpecialtyName() {
        return specialtyName;
    }

    public void setSpecialtyName(String specialtyName) {
        this.specialtyName = specialtyName;
    }
}
