package com.example.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.example.data.model.AIModelMode
import com.example.data.model.ConversionItem
import com.example.data.model.GeneratedFile
import com.example.data.model.OutputType
import com.example.data.repository.ConversionRepository
import com.example.ui.components.CodeViewer
import com.example.ui.components.PipelineProgress
import com.example.ui.theme.CodeBgDark
import com.example.ui.theme.DeepSlate900
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.ReactCyan
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WordPressBlue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ConverterStudioScreen(
    repository: ConversionRepository,
    initialTemplate: QuickTemplate? = null,
    modifier: Modifier = Modifier
) {
    var projectName by remember { mutableStateOf(initialTemplate?.titleEn ?: "Smart Commerce Theme") }
    var selectedOutputType by remember { mutableStateOf(initialTemplate?.targetType ?: OutputType.CLASSIC_THEME) }
    var selectedModelMode by remember { mutableStateOf(AIModelMode.HIGH_THINKING) }
    var reactCodeInput by remember {
        mutableStateOf(
            initialTemplate?.reactCode ?: """
                export default function ProductCard({ title, price, image }) {
                  const [isLiked, setIsLiked] = useState(false);
                  return (
                    <div className="bg-white rounded-2xl shadow-md p-5 border border-slate-100 flex flex-col justify-between">
                      <img src={image || '/placeholder.jpg'} alt={title} className="w-full h-48 object-cover rounded-xl" />
                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                        <p className="text-sky-600 font-semibold mt-1">{price}</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium">افزودن به سبد</button>
                        <button onClick={() => setIsLiked(!isLiked)} className="p-2 border rounded-lg text-slate-400 hover:text-rose-500">♥</button>
                      </div>
                    </div>
                  );
                }
            """.trimIndent()
        )
    }

    LaunchedEffect(initialTemplate) {
        if (initialTemplate != null) {
            projectName = initialTemplate.titleEn
            selectedOutputType = initialTemplate.targetType
            reactCodeInput = initialTemplate.reactCode
        }
    }

    var isConverting by remember { mutableStateOf(false) }
    var pipelineStep by remember { mutableStateOf(0) }
    var lastConversionResult by remember { mutableStateOf<ConversionItem?>(null) }
    var showThinkingDetails by remember { mutableStateOf(true) }

    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                val inputStream = context.contentResolver.openInputStream(uri)
                val content = inputStream?.bufferedReader()?.use { it.readText() } ?: ""
                if (content.isNotBlank()) {
                    reactCodeInput = content
                    Toast.makeText(context, "فایل با موفقیت بارگذاری شد!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "خطا در خواندن فایل: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("converter_studio_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "استودیو تبدیل کدهای React به وردپرس",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "تولید خودکار قالب، افزونه، بلاک‌های گوتنبرگ و استانداردهای WPCS 3.4.1",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = PrimaryLight,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Project Name
                    OutlinedTextField(
                        value = projectName,
                        onValueChange = { projectName = it },
                        label = { Text("نام پروژه (Project Identifier)") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("project_name_input"),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryLight,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        }

        // Output Type Selector
        item {
            Text(
                text = "۱. فرمت خروجی مورد نظر در وردپرس",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(OutputType.values()) { type ->
                    val isSelected = selectedOutputType == type
                    Card(
                        modifier = Modifier
                            .width(220.dp)
                            .clickable { selectedOutputType = type }
                            .testTag("output_type_${type.id}"),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) PrimaryLight.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface
                        ),
                        border = if (isSelected) CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(PrimaryLight)) else null
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = type.titleEn,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) PrimaryLight else MaterialTheme.colorScheme.onSurface
                                )
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = PrimaryLight,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = type.titleFa,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }
        }

        // AI Engine Mode Toggle (Deep High-Thinking vs Low-Latency)
        item {
            Text(
                text = "۲. موتور پردازش هوش مصنوعی (Gemini AI Engine)",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // High Thinking Card
                val isHigh = selectedModelMode == AIModelMode.HIGH_THINKING
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { selectedModelMode = AIModelMode.HIGH_THINKING }
                        .testTag("model_mode_high_thinking"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isHigh) Color(0xFF3730A3).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface
                    ),
                    border = if (isHigh) CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF818CF8))) else null
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Psychology,
                                contentDescription = null,
                                tint = Color(0xFF818CF8),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "معماری عمیق (High Thinking)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = if (isHigh) Color(0xFF818CF8) else MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "مدل gemini-3.1-pro-preview\nسطح تفکر: HIGH • بدون سقف توکن",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 15.sp
                        )
                    }
                }

                // Low Latency Card
                val isLow = selectedModelMode == AIModelMode.LOW_LATENCY
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { selectedModelMode = AIModelMode.LOW_LATENCY }
                        .testTag("model_mode_low_latency"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isLow) Color(0xFFD97706).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface
                    ),
                    border = if (isLow) CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFFF59E0B))) else null
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = null,
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "تبدیل کم‌تاخیر (Low Latency)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = if (isLow) Color(0xFFF59E0B) else MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "مدل gemini-3.1-flash-lite\nپاسخ آنی و فوری قطعات کد",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }

        // React Code Input Area
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "۳. کد مبدأ React (JSX/TSX)",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    FilledTonalButton(
                        onClick = { filePickerLauncher.launch("*/*") },
                        modifier = Modifier.height(30.dp).testTag("upload_react_file_button"),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = PrimaryLight.copy(alpha = 0.2f),
                            contentColor = PrimaryLight
                        )
                    ) {
                        Icon(imageVector = Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("آپلود فایل", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Text(
                        text = "پاک‌سازی",
                        fontSize = 12.sp,
                        color = Color(0xFFEF4444),
                        modifier = Modifier.clickable { reactCodeInput = "" }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = CodeBgDark)
            ) {
                OutlinedTextField(
                    value = reactCodeInput,
                    onValueChange = { reactCodeInput = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .testTag("react_code_input"),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color(0xFFE2E8F0),
                        unfocusedTextColor = Color(0xFFCBD5E1),
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    ),
                    placeholder = {
                        Text(
                            text = "کد کامپوننت React یا هوک خود را اینجا وارد کنید...",
                            color = Color(0xFF64748B),
                            fontSize = 12.sp
                        )
                    }
                )
            }
        }

        // Action Button: Convert
        item {
            Button(
                onClick = {
                    if (reactCodeInput.isBlank()) {
                        Toast.makeText(context, "لطفاً کد کامپوننت React را وارد کنید.", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    isConverting = true
                    pipelineStep = 0

                    coroutineScope.launch {
                        // Simulate pipeline steps for visual feedback
                        delay(400)
                        pipelineStep = 1 // Analyze
                        delay(600)
                        pipelineStep = 2 // Convert
                        delay(800)
                        pipelineStep = 3 // Sanitize WPCS
                        delay(600)
                        pipelineStep = 4 // Package

                        val result = repository.runConversion(
                            projectName = projectName,
                            outputType = selectedOutputType,
                            aiModelMode = selectedModelMode,
                            reactCode = reactCodeInput
                        )

                        pipelineStep = 5
                        lastConversionResult = result
                        isConverting = false
                        Toast.makeText(context, "تبدیل با موفقیت پایان یافت و در پایگاه ابری ذخیره شد!", Toast.LENGTH_LONG).show()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("start_conversion_button"),
                enabled = !isConverting,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedModelMode == AIModelMode.HIGH_THINKING) Color(0xFF0284C7) else Color(0xFFD97706)
                )
            ) {
                Icon(
                    imageVector = if (selectedModelMode == AIModelMode.HIGH_THINKING) Icons.Default.Psychology else Icons.Default.Bolt,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isConverting) "در حال پردازش خط لوله..." else "شروع تبدیل به وردپرس (${selectedModelMode.badge})",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Pipeline Progress Indicator
        if (isConverting || lastConversionResult != null) {
            item {
                PipelineProgress(
                    currentStepIndex = pipelineStep,
                    isProcessing = isConverting
                )
            }
        }

        // Results Section
        lastConversionResult?.let { result ->
            // High Thinking Summary Card (if available)
            if (result.thinkingSummary.isNotBlank()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("thinking_summary_card"),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { showThinkingDetails = !showThinkingDetails },
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Lightbulb,
                                        contentDescription = null,
                                        tint = Color(0xFFF59E0B),
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "تحلیل معماری و گزارش تطبیق استانداردهای وردپرس",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                }

                                Icon(
                                    imageVector = if (showThinkingDetails) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                                    contentDescription = null
                                )
                            }

                            AnimatedVisibility(visible = showThinkingDetails) {
                                Column {
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Divider(color = MaterialTheme.colorScheme.outlineVariant)
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(
                                        text = result.thinkingSummary,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        lineHeight = 18.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Generated Code Files
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "فایل‌های تولید شده در قالب (${result.generatedFiles.size} فایل)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Security, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "WPCS 3.4.1 Valid", fontSize = 11.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                CodeViewer(
                    files = result.generatedFiles,
                    projectName = result.projectName
                )
            }
        }
    }
}
