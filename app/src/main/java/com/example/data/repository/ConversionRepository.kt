package com.example.data.repository

import android.content.Context
import androidx.room.Room
import com.example.data.firebase.FirebaseAuthManager
import com.example.data.firebase.FirestoreManager
import com.example.data.gemini.GeminiService
import com.example.data.local.AppDatabase
import com.example.data.local.AssetEntity
import com.example.data.local.ConversionEntity
import com.example.data.model.AIModelMode
import com.example.data.model.AssetItem
import com.example.data.model.ConversionItem
import com.example.data.model.GeneratedFile
import com.example.data.model.OutputType
import com.example.data.model.UserProfile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class ConversionRepository(context: Context) {

    private val db = Room.databaseBuilder(
        context.applicationContext,
        AppDatabase::class.java,
        "rtw_converter.db"
    ).build()

    val authManager = FirebaseAuthManager(context)
    val firestoreManager = FirestoreManager()
    val geminiService = GeminiService()

    private val _conversions = MutableStateFlow<List<ConversionItem>>(emptyList())
    val conversions: StateFlow<List<ConversionItem>> = _conversions.asStateFlow()

    private val _assets = MutableStateFlow<List<AssetItem>>(emptyList())
    val assets: StateFlow<List<AssetItem>> = _assets.asStateFlow()

    private val repositoryScope = CoroutineScope(Dispatchers.IO)

    init {
        // Observe Room DB for conversions
        repositoryScope.launch {
            db.conversionDao().getAllConversions().collect { entities ->
                val items = entities.map { it.toConversionItem() }
                if (items.isEmpty()) {
                    seedDefaultSamples()
                } else {
                    _conversions.value = items
                }
            }
        }

        // Observe Room DB for assets
        repositoryScope.launch {
            db.assetDao().getAllAssets().collect { entities ->
                _assets.value = entities.map { it.toAssetItem() }
            }
        }

        // Ensure at least anonymous login
        repositoryScope.launch {
            if (authManager.currentUserProfile.value == null) {
                authManager.signInAnonymously()
            }
        }
    }

    suspend fun runConversion(
        projectName: String,
        outputType: OutputType,
        aiModelMode: AIModelMode,
        reactCode: String
    ): ConversionItem {
        val id = "conv_${System.currentTimeMillis()}_${UUID.randomUUID().toString().take(6)}"
        val user = authManager.currentUserProfile.value
        val userId = user?.uid ?: "anonymous"

        val (thinkingSummary, generatedFiles) = when (aiModelMode) {
            AIModelMode.HIGH_THINKING -> {
                geminiService.convertWithHighThinking(projectName, outputType, reactCode)
            }
            AIModelMode.LOW_LATENCY -> {
                geminiService.convertWithLowLatency(projectName, outputType, reactCode)
            }
        }

        val item = ConversionItem(
            id = id,
            projectName = projectName.ifBlank { "WordPress Tool" },
            outputType = outputType,
            aiModelMode = aiModelMode,
            inputCode = reactCode,
            status = "completed",
            thinkingSummary = thinkingSummary,
            generatedFiles = generatedFiles,
            timestamp = System.currentTimeMillis(),
            userId = userId,
            artifactUrl = "https://github.com/rtw-converter/$id/releases/download/v1.0.0/$projectName.zip"
        )

        // Save to Room local
        db.conversionDao().insertConversion(item.toEntity())

        // Save to Firestore Cloud
        firestoreManager.saveConversion(userId, item)

        return item
    }

    suspend fun generateAsset(prompt: String, editPrompt: String, assetType: String): AssetItem {
        val id = "asset_${System.currentTimeMillis()}_${UUID.randomUUID().toString().take(6)}"
        val user = authManager.currentUserProfile.value
        val userId = user?.uid ?: "anonymous"

        val (base64Img, desc) = geminiService.generateOrEditImage(
            prompt = if (editPrompt.isNotBlank()) "$prompt. Modification: $editPrompt" else prompt,
            aspectRatio = if (assetType == "screenshot.png") "4:3" else "1:1"
        )

        val asset = AssetItem(
            id = id,
            prompt = prompt,
            editPrompt = editPrompt,
            assetType = assetType,
            imageBase64 = base64Img,
            timestamp = System.currentTimeMillis(),
            userId = userId
        )

        // Save locally in Room
        db.assetDao().insertAsset(asset.toEntity())

        // Save in Firestore
        firestoreManager.saveAsset(userId, asset)

        return asset
    }

    suspend fun deleteConversion(id: String) {
        db.conversionDao().deleteById(id)
    }

    private suspend fun seedDefaultSamples() {
        val sample1 = ConversionItem(
            id = "seed_1",
            projectName = "E-Commerce Hero Showcase",
            outputType = OutputType.CLASSIC_THEME,
            aiModelMode = AIModelMode.HIGH_THINKING,
            inputCode = """
                export default function HeroShowcase() {
                  const [activeTab, setActiveTab] = useState('featured');
                  return (
                    <header className="bg-slate-900 text-white py-16 px-6 text-center">
                      <h1 className="text-4xl font-bold">Smart React Commerce</h1>
                      <p className="mt-4 text-slate-300">Modern modular WordPress shop powered by AI.</p>
                      <button className="mt-6 px-6 py-3 bg-sky-500 rounded-lg shadow-lg hover:bg-sky-400">
                        View Products
                      </button>
                    </header>
                  );
                }
            """.trimIndent(),
            status = "completed",
            thinkingSummary = "تحلیل ساختار کامپوننت React، نگاشت به ساختار استانداردهای قالب کلاسیک وردپرس، استخراج استایل‌ها به style.css و rtl.css، پیاده‌سازی هوک‌های پس‌زمینه وردپرس (wp_head و wp_footer).",
            generatedFiles = geminiService.generateFallbackWordPressSuite(
                "E-Commerce Hero Showcase",
                OutputType.CLASSIC_THEME,
                "",
                AIModelMode.HIGH_THINKING
            ).second,
            timestamp = System.currentTimeMillis() - 86400000L,
            userId = "system"
        )

        val sample2 = ConversionItem(
            id = "seed_2",
            projectName = "Interactive Pricing Grid",
            outputType = OutputType.BLOCK_THEME,
            aiModelMode = AIModelMode.LOW_LATENCY,
            inputCode = """
                export function PricingTable() {
                  return (
                    <div className="grid grid-cols-3 gap-6 p-8">
                      <div className="border rounded-xl p-6">Basic: $19/mo</div>
                      <div className="border border-sky-500 rounded-xl p-6">Pro: $49/mo</div>
                      <div className="border rounded-xl p-6">Enterprise: $99/mo</div>
                    </div>
                  );
                }
            """.trimIndent(),
            status = "completed",
            thinkingSummary = "تبدیل فوری به قالب بلوکی وردپرس (FSE) با استفاده از theme.json نسخه ۳ و استانداردهای طراحی مدرن.",
            generatedFiles = geminiService.generateFallbackWordPressSuite(
                "Interactive Pricing Grid",
                OutputType.BLOCK_THEME,
                "",
                AIModelMode.LOW_LATENCY
            ).second,
            timestamp = System.currentTimeMillis() - 43200000L,
            userId = "system"
        )

        db.conversionDao().insertConversion(sample1.toEntity())
        db.conversionDao().insertConversion(sample2.toEntity())
    }

    private fun ConversionItem.toEntity(): ConversionEntity {
        val filesArray = JSONArray()
        generatedFiles.forEach { f ->
            val obj = JSONObject().apply {
                put("fileName", f.fileName)
                put("fileType", f.fileType)
                put("content", f.content)
                put("description", f.description)
            }
            filesArray.put(obj)
        }

        return ConversionEntity(
            id = id,
            projectName = projectName,
            outputTypeId = outputType.id,
            aiModelModeId = aiModelMode.id,
            inputCode = inputCode,
            status = status,
            thinkingSummary = thinkingSummary,
            generatedFilesJson = filesArray.toString(),
            timestamp = timestamp,
            userId = userId,
            artifactUrl = artifactUrl
        )
    }

    private fun ConversionEntity.toConversionItem(): ConversionItem {
        val files = mutableListOf<GeneratedFile>()
        try {
            val arr = JSONArray(generatedFilesJson)
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                files.add(
                    GeneratedFile(
                        fileName = o.getString("fileName"),
                        fileType = o.getString("fileType"),
                        content = o.getString("content"),
                        description = o.optString("description", "")
                    )
                )
            }
        } catch (e: Exception) {
            // ignore
        }

        val outType = OutputType.values().find { it.id == outputTypeId } ?: OutputType.CLASSIC_THEME
        val modelMode = AIModelMode.values().find { it.id == aiModelModeId } ?: AIModelMode.HIGH_THINKING

        return ConversionItem(
            id = id,
            projectName = projectName,
            outputType = outType,
            aiModelMode = modelMode,
            inputCode = inputCode,
            status = status,
            thinkingSummary = thinkingSummary,
            generatedFiles = files,
            timestamp = timestamp,
            userId = userId,
            artifactUrl = artifactUrl
        )
    }

    private fun AssetItem.toEntity(): AssetEntity {
        return AssetEntity(
            id = id,
            prompt = prompt,
            editPrompt = editPrompt,
            assetType = assetType,
            imageBase64 = imageBase64,
            imageUrl = imageUrl,
            timestamp = timestamp,
            userId = userId
        )
    }

    private fun AssetEntity.toAssetItem(): AssetItem {
        return AssetItem(
            id = id,
            prompt = prompt,
            editPrompt = editPrompt,
            assetType = assetType,
            imageBase64 = imageBase64,
            imageUrl = imageUrl,
            timestamp = timestamp,
            userId = userId
        )
    }
}
