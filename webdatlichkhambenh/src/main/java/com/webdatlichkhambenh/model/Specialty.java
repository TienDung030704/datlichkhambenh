package com.webdatlichkhambenh.model;

public class Specialty {
    private Integer id;
    private String name;
    private String description;
    private Integer doctorCount;
    private Integer totalDoctors;
    private Boolean isActive;

    // Constructors
    public Specialty() {
    }

    public Specialty(Integer id, String name, String description, Integer doctorCount, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.doctorCount = doctorCount;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDoctorCount() {
        return doctorCount;
    }

    public void setDoctorCount(Integer doctorCount) {
        this.doctorCount = doctorCount;
    }

    public Integer getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(Integer totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
