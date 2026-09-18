package com.example.data.util

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object GitHubBridgeClient {

    data class DispatchResult(
        val success: Boolean,
        val statusCode: Int,
        val message: String
    )

    /**
     * Sends a real repository_dispatch event to GitHub API:
     * POST https://api.github.com/repos/{owner}/{repo}/dispatches
     */
    suspend fun triggerRepositoryDispatch(
        repoFullName: String,
        token: String,
        eventType: String = "wp-bridge-convert",
        clientPayload: Map<String, String> = emptyMap()
    ): DispatchResult = withContext(Dispatchers.IO) {
        val trimmedRepo = repoFullName.trim()
        val trimmedToken = token.trim()

        if (!trimmedRepo.contains("/")) {
            return@withContext DispatchResult(
                success = false,
                statusCode = 400,
                message = "فرمت آدرس ریپازیتوری باید به شکل owner/repository باشد."
            )
        }

        // If no token is provided, return simulated successful dry-run
        if (trimmedToken.isEmpty()) {
            return@withContext DispatchResult(
                success = true,
                statusCode = 204,
                message = "حالت تست محلی بدون توکن: سیگنال $eventType آماده ارسال به $trimmedRepo شد (وضعیت شبیه‌سازی 204)."
            )
        }

        try {
            val url = URL("https://api.github.com/repos/$trimmedRepo/dispatches")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Accept", "application/vnd.github.v3+json")
                setRequestProperty("Authorization", "token $trimmedToken")
                setRequestProperty("Content-Type", "application/json; utf-8")
                setRequestProperty("User-Agent", "RTW-Converter-Android")
                doOutput = true
                connectTimeout = 10000
                readTimeout = 10000
            }

            val payloadJson = JSONObject().apply {
                put("event_type", eventType)
                val clientData = JSONObject()
                clientPayload.forEach { (k, v) -> clientData.put(k, v) }
                put("client_payload", clientData)
            }

            conn.outputStream.use { os ->
                val input = payloadJson.toString().toByteArray(Charsets.UTF_8)
                os.write(input, 0, input.size)
            }

            val code = conn.responseCode
            if (code in 200..299) {
                DispatchResult(
                    success = true,
                    statusCode = code,
                    message = "رویداد $eventType با موفقیت به GitHub ارسال شد (کد پاسخ $code). اکشن‌ها در مخزن $trimmedRepo فعال شدند!"
                )
            } else {
                val errorMsg = conn.errorStream?.bufferedReader()?.use { it.readText() } ?: "Unknown error"
                DispatchResult(
                    success = false,
                    statusCode = code,
                    message = "خطا از سمت گیت‌هاب (کد $code): $errorMsg"
                )
            }
        } catch (e: Exception) {
            DispatchResult(
                success = false,
                statusCode = 500,
                message = "خطا در برقراری ارتباط شبکه با سرورهای گیت‌هاب: ${e.localizedMessage}"
            )
        }
    }
}
