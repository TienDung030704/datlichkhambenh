// Auth Utility Functions
class AuthManager {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  // Get stored tokens
  getTokens() {
    return {
      accessToken:
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken"),
      refreshToken:
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken"),
      user: JSON.parse(
        localStorage.getItem("currentUser") ||
          sessionStorage.getItem("currentUser") ||
          "{}",
      ),
    };
  }

  // Save tokens
  saveTokens(accessToken, refreshToken, username, remember = false) {
    const userData = { username, accessToken, refreshToken };

    if (remember) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("currentUser", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
    }
  }

  // Clear all auth data
  clearAuth() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");
  }

  // Check if token is expired or expires soon
  isTokenExpiringSoon(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();

      // Return true if token expires in next 2 minutes
      return exp - now < 2 * 60 * 1000;
    } catch (error) {
      return true;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const { refreshToken, user } = this.getTokens();

      if (!refreshToken || !user.username) {
        throw new Error("No refresh token available");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
          username: user.username,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save new tokens
        const remember = !!localStorage.getItem("accessToken");
        this.saveTokens(
          result.accessToken,
          result.refreshToken,
          result.username,
          remember,
        );

        // Notify all waiting subscribers
        this.refreshSubscribers.forEach((callback) =>
          callback(result.accessToken),
        );
        this.refreshSubscribers = [];

        console.log("🔄 Token refreshed successfully");
        return result.accessToken;
      } else {
        throw new Error(result.message || "Failed to refresh token");
      }
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // Clear auth and redirect to login
      this.clearAuth();
      this.redirectToLogin();

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Make authenticated API calls with automatic token refresh
  async authenticatedFetch(url, options = {}) {
    const { accessToken } = this.getTokens();

    // Check if token needs refresh
    if (this.isTokenExpiringSoon(accessToken)) {
      try {
        const newToken = await this.refreshAccessToken();
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        };
      } catch (error) {
        throw new Error("Authentication failed");
      }
    } else {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return fetch(url, options);
  }

  // Logout user
  async logout() {
    try {
      const { user } = this.getTokens();

      if (user.username) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user.username,
          }),
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      this.clearAuth();

      // Set logout success flag for login page to show notification
      sessionStorage.setItem("justLoggedOut", "true");
      console.log("Logout: Set justLoggedOut flag");

      // Redirect immediately
      this.redirectToLogin();
    }
  }

  // Show logout notification
  showLogoutNotification() {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification notification-success";
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>Đăng xuất thành công!</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add styles if not already added
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease-out;
        }
        
        .notification-success {
          background: #4CAF50;
          color: white;
        }
        
        .notification-content {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          gap: 10px;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          margin-left: auto;
          padding: 5px;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  // Redirect to login page
  redirectToLogin() {
    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath);
    if (!currentPath.includes("login.html")) {
      // Try different redirect approaches based on current location
      if (currentPath === "/" || currentPath.endsWith("index.html")) {
        window.location.href = "html/login.html";
      } else {
        window.location.href = "/html/login.html";
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const { accessToken, refreshToken } = this.getTokens();
    return !!(accessToken && refreshToken);
  }

  // Initialize auth manager
  init() {
    // DON'T auto-redirect to login on page load
    // Let users see the homepage first
    // Only redirect when they actually need authentication

    // Set up periodic token refresh check for authenticated users
    setInterval(() => {
      const { accessToken } = this.getTokens();
      if (accessToken && this.isTokenExpiringSoon(accessToken)) {
        this.refreshAccessToken().catch(() => {
          // Handle refresh failure silently
        });
      }
    }, 60000); // Check every minute
  }

  // Check if user is authenticated (without redirecting)
  requireAuth() {
    return this.isAuthenticated();
  }

  // Require authentication and redirect if needed
  requireAuthWithRedirect() {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }
    return true;
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.authManager.init();
});
