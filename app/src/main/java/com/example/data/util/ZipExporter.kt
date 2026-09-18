package com.example.data.util

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.example.data.model.GeneratedFile
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

object ZipExporter {

    /**
     * Packages generated WordPress files into a physical ZIP file and saves it
     * into the device's public Downloads directory or app-specific storage.
     */
    fun exportToDownloads(context: Context, projectName: String, files: List<GeneratedFile>): Uri? {
        val safeName = projectName.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        val zipFileName = "${safeName}_wordpress.zip"

        val byteStream = ByteArrayOutputStream()
        ZipOutputStream(byteStream).use { zipOut ->
            for (file in files) {
                val entryPath = file.fileName
                val zipEntry = ZipEntry(entryPath)
                zipOut.putNextEntry(zipEntry)
                zipOut.write(file.content.toByteArray(Charsets.UTF_8))
                zipOut.closeEntry()
            }
        }
        val zipData = byteStream.toByteArray()

        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, zipFileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, "application/zip")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/RTW_WordPress")
                }
                val resolver = context.contentResolver
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { os ->
                        os.write(zipData)
                    }
                }
                uri
            } else {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val targetFile = File(downloadsDir, zipFileName)
                FileOutputStream(targetFile).use { os ->
                    os.write(zipData)
                }
                Uri.fromFile(targetFile)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
