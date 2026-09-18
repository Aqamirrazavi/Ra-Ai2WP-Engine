package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FolderZip
import androidx.compose.material.icons.filled.Hub
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
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
import com.example.data.model.ConversionItem
import com.example.data.repository.ConversionRepository
import com.example.ui.components.CodeViewer
import com.example.ui.theme.DeepSlate900
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WordPressBlue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HistoryBridgeScreen(
    repository: ConversionRepository,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(0) }
    val conversions by repository.conversions.collectAsState()
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var activeProjectForPreview by remember { mutableStateOf<ConversionItem?>(null) }

    // GitHub Bridge state
    var repoOwnerAndName by remember { mutableStateOf("user/wordpress-rtw-theme") }
    var patToken by remember { mutableStateOf("ghp_************************************") }
    var isDispatching by remember { mutableStateOf(false) }
    var dispatchStatus by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("history_bridge_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Tab switcher: 0 = History & Cloud, 1 = WordPress Bridge, 2 = 13-Part Architecture Handbook
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = PrimaryLight,
                modifier = Modifier.clip(RoundedCornerShape(12.dp))
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    modifier = Modifier.testTag("tab_history"),
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Cloud, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("تاریخچه و پایگاه ابری", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    modifier = Modifier.testTag("tab_bridge"),
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Hub, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("پل گیت‌هاب (Bridge)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    modifier = Modifier.testTag("tab_handbook"),
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.MenuBook, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("دستورالعمل‌ها", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                )
            }
        }

        when (selectedTab) {
            0 -> {
                // History List Tab
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "پروژه‌های تبدیل‌شده در پایگاه داده (${conversions.size} مورد)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "همگام‌سازی دوطرفه Room & Firestore",
                            fontSize = 11.sp,
                            color = SuccessGreen
                        )
                    }
                }

                if (conversions.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                                Text("هیچ پروژه‌ای در تاریخچه یافت نشد.")
                            }
                        }
                    }
                } else {
                    items(conversions) { item ->
                        val isExpanded = activeProjectForPreview?.id == item.id
                        val dateString = remember(item.timestamp) {
                            val sdf = SimpleDateFormat("yyyy/MM/dd HH:mm", Locale.getDefault())
                            sdf.format(Date(item.timestamp))
                        }

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("conversion_history_item_${item.id}"),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.FolderZip,
                                            contentDescription = null,
                                            tint = WordPressBlue,
                                            modifier = Modifier.size(24.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column {
                                            Text(
                                                text = item.projectName,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                            Text(
                                                text = "${item.outputType.titleFa} • $dateString",
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }

                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        IconButton(
                                            onClick = {
                                                activeProjectForPreview = if (isExpanded) null else item
                                            },
                                            modifier = Modifier.size(36.dp)
                                        ) {
                                            Icon(
                                                imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.Visibility,
                                                contentDescription = "View Files",
                                                tint = PrimaryLight
                                            )
                                        }

                                        IconButton(
                                            onClick = {
                                                coroutineScope.launch {
                                                    repository.deleteConversion(item.id)
                                                    if (activeProjectForPreview?.id == item.id) {
                                                        activeProjectForPreview = null
                                                    }
                                                    Toast.makeText(context, "پروژه حذف شد", Toast.LENGTH_SHORT).show()
                                                }
                                            },
                                            modifier = Modifier.size(36.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Delete,
                                                contentDescription = "Delete",
                                                tint = Color(0xFFEF4444)
                                            )
                                        }
                                    }
                                }

                                AnimatedVisibility(visible = isExpanded) {
                                    Column {
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Divider()
                                        Spacer(modifier = Modifier.height(12.dp))
                                        CodeViewer(
                                            files = item.generatedFiles,
                                            projectName = item.projectName
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            1 -> {
                // WordPress GitHub Bridge
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Hub, contentDescription = null, tint = PrimaryLight, modifier = Modifier.size(24.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "پل ارسال خودکار به گیت‌هاب و وردپرس (Repository Dispatch)",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "پس از تولید فایل‌ها در استودیو، می‌توانید مستقیماً رویداد wp-bridge-convert را برای ساخت ZIP و استقرار خودکار به ریپازیتوری گیت‌هاب متصل به هاست وردپرس ارسال کنید.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 18.sp
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            OutlinedTextField(
                                value = repoOwnerAndName,
                                onValueChange = { repoOwnerAndName = it },
                                label = { Text("آدرس مخزن (owner/repository)") },
                                modifier = Modifier.fillMaxWidth().testTag("bridge_repo_input"),
                                shape = RoundedCornerShape(10.dp)
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = patToken,
                                onValueChange = { patToken = it },
                                label = { Text("توکن امنیتی GitHub PAT (رمزنگاری AES-256)") },
                                modifier = Modifier.fillMaxWidth().testTag("bridge_pat_input"),
                                shape = RoundedCornerShape(10.dp)
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            Button(
                                onClick = {
                                    isDispatching = true
                                    dispatchStatus = null
                                    coroutineScope.launch {
                                        val result = com.example.data.util.GitHubBridgeClient.triggerRepositoryDispatch(
                                            repoFullName = repoOwnerAndName,
                                            token = patToken,
                                            eventType = "wp-bridge-convert",
                                            clientPayload = mapOf("source" to "RTW-Mobile-Companion")
                                        )
                                        isDispatching = false
                                        dispatchStatus = result.message
                                        Toast.makeText(context, if (result.success) "سیگنال ارسال شد" else "خطا در ارسال", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("trigger_dispatch_button"),
                                enabled = !isDispatching,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight)
                            ) {
                                if (isDispatching) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("در حال ارتباط با API گیت‌هاب...")
                                } else {
                                    Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("ارسال رویداد (Trigger Repository Dispatch)", fontWeight = FontWeight.Bold)
                                }
                            }

                            dispatchStatus?.let { status ->
                                Spacer(modifier = Modifier.height(14.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(SuccessGreen.copy(alpha = 0.15f))
                                        .padding(12.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(text = status, color = SuccessGreen, fontSize = 12.sp, lineHeight = 17.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            2 -> {
                // 13-Part Project Architecture Handbook
                item {
                    Text(
                        text = "دستورالعمل‌های ۱۳ گانه معماری پروژه (RTW Handbook)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "مرجع کامل ۴۱ بلوک الزامات امنیتی، قواعد WPCS 3.4.1 و سازگاری با وردپرس ۶.۶+",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                val handbookSections = listOf(
                    "بخش ۱: پایه‌ریزی محیط و وابستگی‌ها" to "استفاده از Node.js 20 LTS، کتابخانه‌های @wordpress/scripts، پشتیبانی از Babel و اسکریپت‌های کامپایل خودکار.",
                    "بخش ۲: پروتکل اعتبارسنجی و لایه‌ی امنیتی" to "پیش‌گیری از آسیب‌پذیری‌های امنیتی CVE-2026-45293 و CVE-2026-40313، بررسی هش SHA-256 و اعتبارسنجی ورودی با Zod.",
                    "بخش ۳: خط لوله استخراج و آنالیز AST" to "تحلیل درخت نحو کامپوننت‌های React، استخراج هوک‌های useState و useEffect و تطبیق آن‌ها با مدل داده وردپرس.",
                    "بخش ۴: نگاشت کامپوننت به ۵ فرمت وردپرس" to "قالب کلاسیک (style.css, functions.php)، قالب بلوکی FSE با theme.json نسخه ۳، افزونه مستقل، بلاک گوتنبرگ و قالب تک‌برگه.",
                    "بخش ۵: استانداردهای کدنویسی وردپرس (WPCS 3.4.1)" to "پیشوند اجباری rtw_ برای تمام توابع و شناسه‌ها، دامنه ترجمه rtw-converter، نام‌گذاری snake_case و پاک‌سازی داده‌ها با sanitize_* و esc_*.",
                    "بخش ۶: لایه ذخیره‌سازی، پل گیت‌هاب و CI/CD" to "تولید خودکار بسته‌ی ZIP استاندارد، هدرهای به‌روزرسانی هوشمند Theme URI و GitHub Actions Dispatch.",
                    "بخش ۷: استانداردهای دسترسی‌پذیری و راست‌به‌چپ" to "رعایت الزامات WCAG 2.2 سطح AA، کنتراست رنگی حداقل 4.5:1، ناوبری کامل با کیبورد و تولید فایل rtl.css برای فارسی و عربی."
                )

                items(handbookSections) { (title, desc) ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = PrimaryLight
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = desc,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
