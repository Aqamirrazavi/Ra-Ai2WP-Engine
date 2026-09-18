package com.example.data.model

enum class OutputType(val id: String, val titleFa: String, val titleEn: String, val descriptionFa: String) {
    CLASSIC_THEME(
        id = "classic_theme",
        titleFa = "قالب کلاسیک وردپرس (Classic Theme)",
        titleEn = "Classic WordPress Theme",
        descriptionFa = "تولید فایل‌های style.css, functions.php, header.php, footer.php, index.php با پیشوند استاندارد rtw_ و پشتیبانی کامل از RTL"
    ),
    BLOCK_THEME(
        id = "block_theme",
        titleFa = "قالب بلوکی FSE (Block Theme v3)",
        titleEn = "Full Site Editing Theme",
        descriptionFa = "پیکربندی کامل theme.json نسخه ۳، قالب‌های HTML، پالت‌های رنگی و تنظیمات هماهنگ با ویرایشگر گوتنبرگ"
    ),
    WP_PLUGIN(
        id = "wp_plugin",
        titleFa = "افزونه مستقل وردپرس (Plugin)",
        titleEn = "WordPress Plugin",
        descriptionFa = "پلاگین ساختاریافته همراه با نقطه پایانی REST API سفارشی، پاک‌سازی امنیتی، Nonce و پنل تنظیمات"
    ),
    GUTENBERG_BLOCK(
        id = "gutenberg_block",
        titleFa = "بلاک سفارشی گوتنبرگ (Custom Block)",
        titleEn = "Gutenberg Block",
        descriptionFa = "ساختار کامل block.json, edit.js, save.js و تابع رندر سمت سرور PHP"
    ),
    SINGLE_TEMPLATE(
        id = "single_template",
        titleFa = "قالب تک‌برگه (Single Page Template)",
        titleEn = "Single Page Template",
        descriptionFa = "برگه سفارشی مستقل با محفظه اختصاصی rtw-root و اسکریپت‌های بهینه‌شده"
    )
}

enum class AIModelMode(val id: String, val titleFa: String, val titleEn: String, val modelName: String, val badge: String) {
    HIGH_THINKING(
        id = "high_thinking",
        titleFa = "تحلیل معماری عمیق (High Thinking Mode)",
        titleEn = "Deep Architecture (Thinking: HIGH)",
        modelName = "gemini-3.1-pro-preview",
        badge = "gemini-3.1-pro-preview • HIGH"
    ),
    LOW_LATENCY(
        id = "low_latency",
        titleFa = "پاسخ سریع و سبک (Low Latency Mode)",
        titleEn = "Fast Transpiler (Low Latency)",
        modelName = "gemini-3.1-flash-lite",
        badge = "gemini-3.1-flash-lite • FAST"
    )
}

data class GeneratedFile(
    val fileName: String,
    val fileType: String, // "php", "css", "json", "js", "txt"
    val content: String,
    val description: String = ""
)

data class ConversionItem(
    val id: String,
    val projectName: String,
    val outputType: OutputType,
    val aiModelMode: AIModelMode,
    val inputCode: String,
    val status: String, // "completed", "processing", "failed"
    val thinkingSummary: String = "",
    val generatedFiles: List<GeneratedFile> = emptyList(),
    val timestamp: Long = System.currentTimeMillis(),
    val userId: String = "",
    val artifactUrl: String = ""
)

data class AssetItem(
    val id: String,
    val prompt: String,
    val editPrompt: String = "",
    val assetType: String, // "screenshot.png", "block_icon", "hero_banner", "featured_image"
    val imageBase64: String? = null,
    val imageUrl: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val userId: String = ""
)

data class UserProfile(
    val uid: String,
    val displayName: String,
    val email: String,
    val photoUrl: String? = null,
    val isAnonymous: Boolean = true
)
