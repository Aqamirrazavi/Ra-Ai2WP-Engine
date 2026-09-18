package com.example.data.firebase

import android.util.Log
import com.example.data.model.AIModelMode
import com.example.data.model.AssetItem
import com.example.data.model.ConversionItem
import com.example.data.model.GeneratedFile
import com.example.data.model.OutputType
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

class FirestoreManager {

    private val firestore: FirebaseFirestore by lazy {
        FirebaseFirestore.getInstance()
    }

    suspend fun saveConversion(userId: String, item: ConversionItem): Boolean {
        if (userId.isBlank()) return false
        return try {
            val map = hashMapOf(
                "id" to item.id,
                "projectName" to item.projectName,
                "outputType" to item.outputType.name,
                "aiModelMode" to item.aiModelMode.name,
                "inputCode" to item.inputCode,
                "status" to item.status,
                "thinkingSummary" to item.thinkingSummary,
                "timestamp" to item.timestamp,
                "userId" to userId,
                "artifactUrl" to item.artifactUrl,
                "files" to item.generatedFiles.map {
                    mapOf(
                        "fileName" to it.fileName,
                        "fileType" to it.fileType,
                        "content" to it.content,
                        "description" to it.description
                    )
                }
            )

            firestore.collection("users")
                .document(userId)
                .collection("conversions")
                .document(item.id)
                .set(map)
                .await()
            true
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Failed to save conversion to Firestore", e)
            false
        }
    }

    suspend fun loadConversions(userId: String): List<ConversionItem> {
        if (userId.isBlank()) return emptyList()
        return try {
            val snapshot = firestore.collection("users")
                .document(userId)
                .collection("conversions")
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .limit(25)
                .get()
                .await()

            snapshot.documents.mapNotNull { doc ->
                val id = doc.getString("id") ?: doc.id
                val projectName = doc.getString("projectName") ?: "بدون نام"
                val outputTypeName = doc.getString("outputType") ?: OutputType.CLASSIC_THEME.name
                val aiModelModeName = doc.getString("aiModelMode") ?: AIModelMode.HIGH_THINKING.name
                val inputCode = doc.getString("inputCode").orEmpty()
                val status = doc.getString("status") ?: "completed"
                val thinkingSummary = doc.getString("thinkingSummary").orEmpty()
                val timestamp = doc.getLong("timestamp") ?: System.currentTimeMillis()
                val artifactUrl = doc.getString("artifactUrl").orEmpty()

                @Suppress("UNCHECKED_CAST")
                val filesListRaw = doc.get("files") as? List<Map<String, Any>>
                val files = filesListRaw?.map {
                    GeneratedFile(
                        fileName = it["fileName"] as? String ?: "file.txt",
                        fileType = it["fileType"] as? String ?: "txt",
                        content = it["content"] as? String ?: "",
                        description = it["description"] as? String ?: ""
                    )
                } ?: emptyList()

                ConversionItem(
                    id = id,
                    projectName = projectName,
                    outputType = runCatching { OutputType.valueOf(outputTypeName) }.getOrDefault(OutputType.CLASSIC_THEME),
                    aiModelMode = runCatching { AIModelMode.valueOf(aiModelModeName) }.getOrDefault(AIModelMode.HIGH_THINKING),
                    inputCode = inputCode,
                    status = status,
                    thinkingSummary = thinkingSummary,
                    generatedFiles = files,
                    timestamp = timestamp,
                    userId = userId,
                    artifactUrl = artifactUrl
                )
            }
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Failed to load conversions from Firestore", e)
            emptyList()
        }
    }

    suspend fun saveAsset(userId: String, asset: AssetItem): Boolean {
        if (userId.isBlank()) return false
        return try {
            val map = hashMapOf(
                "id" to asset.id,
                "prompt" to asset.prompt,
                "editPrompt" to asset.editPrompt,
                "assetType" to asset.assetType,
                "imageBase64" to (asset.imageBase64 ?: ""),
                "imageUrl" to (asset.imageUrl ?: ""),
                "timestamp" to asset.timestamp,
                "userId" to userId
            )

            firestore.collection("users")
                .document(userId)
                .collection("assets")
                .document(asset.id)
                .set(map)
                .await()
            true
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Failed to save asset to Firestore", e)
            false
        }
    }

    suspend fun loadAssets(userId: String): List<AssetItem> {
        if (userId.isBlank()) return emptyList()
        return try {
            val snapshot = firestore.collection("users")
                .document(userId)
                .collection("assets")
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .limit(20)
                .get()
                .await()

            snapshot.documents.mapNotNull { doc ->
                AssetItem(
                    id = doc.getString("id") ?: doc.id,
                    prompt = doc.getString("prompt").orEmpty(),
                    editPrompt = doc.getString("editPrompt").orEmpty(),
                    assetType = doc.getString("assetType") ?: "screenshot.png",
                    imageBase64 = doc.getString("imageBase64"),
                    imageUrl = doc.getString("imageUrl"),
                    timestamp = doc.getLong("timestamp") ?: System.currentTimeMillis(),
                    userId = userId
                )
            }
        } catch (e: Exception) {
            Log.e("FirestoreManager", "Failed to load assets from Firestore", e)
            emptyList()
        }
    }
}
