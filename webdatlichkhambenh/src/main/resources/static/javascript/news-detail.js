document.addEventListener("DOMContentLoaded", function () {
  if (typeof checkAuthStatus === "function") checkAuthStatus();

  const params = new URLSearchParams(window.location.search);
  const newsId = params.get("id");

  if (!newsId || isNaN(parseInt(newsId))) {
    showError("Không tìm thấy bài viết.");
    return;
  }

  loadNewsDetail(parseInt(newsId));
});

async function loadNewsDetail(id) {
  try {
    const response = await fetch(`/api/news/public/${id}`);
    if (!response.ok) {
      showError("Không thể tải bài viết. Vui lòng thử lại.");
      return;
    }
    const data = await response.json();
    if (data.success && data.data) {
      renderNewsDetail(data.data);
    } else {
      showError("Không tìm thấy bài viết.");
    }
  } catch (error) {
    console.error("Error loading news detail:", error);
    showError("Lỗi kết nối server.");
  }
}

function renderNewsDetail(news) {
  const publishedAt = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const imageHtml = news.imageUrl
    ? `<img src="${escapeAttr(news.imageUrl)}" alt="${escapeAttr(news.title)}" class="news-detail-image" />`
    : "";

  const summaryHtml = news.summary
    ? `<p class="news-detail-summary">${escapeHtml(news.summary)}</p>`
    : "";

  const categoryHtml = news.category
    ? `<span class="news-detail-category">${escapeHtml(news.category)}</span>`
    : "";

  // Convert plain text newlines to paragraphs if content is not HTML
  let contentHtml = news.content || "";
  if (contentHtml && !/<[a-z][\s\S]*>/i.test(contentHtml)) {
    contentHtml = contentHtml
      .split(/\n\s*\n/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .join("");
  }

  document.title = `${news.title} - HealthCare`;

  document.getElementById("newsDetailContent").innerHTML = `
    ${categoryHtml}
    <h1 class="news-detail-title">${escapeHtml(news.title)}</h1>
    <div class="news-detail-meta">
      ${news.author ? `<span><i class="fas fa-user"></i> ${escapeHtml(news.author)}</span>` : ""}
      ${publishedAt ? `<span><i class="fas fa-calendar-alt"></i> ${publishedAt}</span>` : ""}
      <span class="news-detail-views"><i class="fas fa-eye"></i> ${news.viewCount || 0} lượt xem</span>
    </div>
    ${imageHtml}
    ${summaryHtml}
    <div class="news-detail-content">${contentHtml}</div>
  `;
}

function showError(message) {
  document.getElementById("newsDetailContent").innerHTML = `
    <div class="news-detail-error">
      <i class="fas fa-exclamation-circle" style="font-size:48px;margin-bottom:16px;display:block;"></i>
      <p>${message}</p>
      <a href="news.html" style="color:#2196f3;text-decoration:none;">
        <i class="fas fa-arrow-left"></i> Quay lại danh sách tin tức
      </a>
    </div>`;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  if (!text) return "";
  return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
