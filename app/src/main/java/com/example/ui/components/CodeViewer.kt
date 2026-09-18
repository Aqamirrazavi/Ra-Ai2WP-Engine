package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Download
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.GeneratedFile
import com.example.ui.theme.CodeBgDark

@Composable
fun CodeViewer(
    files: List<GeneratedFile>,
    modifier: Modifier = Modifier,
    projectName: String = "WordPress Project"
) {
    if (files.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .height(200.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "فایلی برای نمایش موجود نیست.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }

    var selectedIndex by remember { mutableStateOf(0) }
    val currentFile = files.getOrNull(selectedIndex) ?: files.first()
    val context = LocalContext.current

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("code_viewer_card"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Header Tabs
            ScrollableTabRow(
                selectedTabIndex = selectedIndex,
                edgePadding = 12.dp,
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                contentColor = MaterialTheme.colorScheme.primary,
                divider = {}
            ) {
                files.forEachIndexed { index, file ->
                    Tab(
                        selected = selectedIndex == index,
                        onClick = { selectedIndex = index },
                        modifier = Modifier.testTag("tab_${file.fileName}"),
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Description,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = if (selectedIndex == index) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = file.fileName,
                                    fontSize = 13.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = if (selectedIndex == index) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    )
                }
            }

            // Action Toolbar (Copy, File stats)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0F172A))
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(0xFF0284C7).copy(alpha = 0.3f))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = currentFile.fileType.uppercase(),
                            color = Color(0xFF38BDF8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = currentFile.fileName,
                        color = Color(0xFFE2E8F0),
                        fontSize = 13.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("WordPress Code", currentFile.content)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "کد فایل ${currentFile.fileName} کپی شد!", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(36.dp).testTag("copy_code_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy code",
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    FilledTonalButton(
                        onClick = {
                            val uri = com.example.data.util.ZipExporter.exportToDownloads(context, projectName, files)
                            if (uri != null) {
                                Toast.makeText(context, "بسته‌ی ZIP در پوشه دانلودها ذخیره شد: $projectName.zip", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(context, "بسته‌ی ZIP آماده شد: $projectName.zip", Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier.height(32.dp).testTag("download_zip_button"),
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = Color(0xFF1E293B),
                            contentColor = Color(0xFF38BDF8)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Download,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "دانلود ZIP", fontSize = 12.sp)
                    }
                }
            }

            // Code Body Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .background(CodeBgDark)
                    .padding(12.dp)
            ) {
                val lines = remember(currentFile.content) { currentFile.content.lines() }
                val verticalScroll = rememberScrollState()
                val horizontalScroll = rememberScrollState()

                Row(
                    modifier = Modifier
                        .verticalScroll(verticalScroll)
                        .horizontalScroll(horizontalScroll)
                ) {
                    // Line numbers column
                    Column(
                        modifier = Modifier.padding(end = 12.dp),
                        horizontalAlignment = Alignment.End
                    ) {
                        lines.indices.forEach { index ->
                            Text(
                                text = "${index + 1}",
                                color = Color(0xFF475569),
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                lineHeight = 18.sp
                            )
                        }
                    }

                    // Divider line
                    Box(
                        modifier = Modifier
                            .width(1.dp)
                            .height((lines.size * 18).dp)
                            .background(Color(0xFF1E293B))
                    )
                    Spacer(modifier = Modifier.width(12.dp))

                    // Code text column
                    Column {
                        lines.forEach { line ->
                            val textColor = when {
                                line.trim().startsWith("<?php") || line.trim().startsWith("?>") -> Color(0xFFF43F5E)
                                line.trim().startsWith("/*") || line.trim().startsWith("*") || line.trim().startsWith("//") -> Color(0xFF64748B)
                                line.contains("function ") || line.contains("add_action") || line.contains("add_filter") -> Color(0xFF38BDF8)
                                line.contains("esc_") || line.contains("sanitize_") || line.contains("wp_") -> Color(0xFF34D399)
                                line.contains("return ") || line.contains("if ") || line.contains("else") -> Color(0xFFA855F7)
                                line.contains("var(--wp--") || line.contains("${"$"}schema") -> Color(0xFFFBBF24)
                                else -> Color(0xFFE2E8F0)
                            }
                            Text(
                                text = if (line.isEmpty()) " " else line,
                                color = textColor,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
