package com.webdatlichkhambenh.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /**
     * Trang chủ - Landing page
     */
    @GetMapping("/")
    public String home() {
        // Trả về file index.html trong thư mục static
        return "forward:/index.html";
    }

    /**
     * Trang chủ với path /home
     */
    @GetMapping("/home")
    public String homePage() {
        return "forward:/index.html";
    }

    /**
     * Trang đăng nhập
     */
    @GetMapping("/login")
    public String login() {
        return "forward:/html/login.html";
    }

    /**
     * Trang đăng ký
     */
    @GetMapping("/register")
    public String register() {
        return "forward:/html/register.html";
    }

    /**
     * Trang quên mật khẩu
     */
    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "forward:/html/forgot-password.html";
    }
}