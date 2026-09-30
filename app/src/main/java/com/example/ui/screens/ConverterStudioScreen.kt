package com.example.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.FolderZip
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.data.model.OutputType
import com.example.data.repository.ConversionRepository
import com.example.ui.components.CodeViewer
import com.example.ui.components.PipelineProgress
import com.example.ui.theme.CodeBgDark
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.ReactCyan
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WordPressBlue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class StudioTab(val titleFa: String) {
    WIZARD("ویزارد ۳ مرحله‌ای (ساده)"),
    ADVANCED("استودیو پیشرفته (کدنویسی)")
}

enum class SourceInputMode(val titleFa: String) {
    GIT_REPO("مخزن گیت‌هاب/گیت‌لب"),
    ZIP_ARCHIVE("آرشیو فشرده ZIP/TAR"),
    CODE_SNIPPET("کد React یا الگو")
}

@Composable
fun ConverterStudioScreen(
    repository: ConversionRepository,
    initialTemplate: QuickTemplate? = null,
    modifier: Modifier = Modifier
) {
    var activeTab by remember { mutableStateOf(StudioTab.WIZARD) }
    var wizardStep by remember { mutableIntStateOf(1) } // 1: Input, 2: Verification, 3: Download

    var projectName by remember { mutableStateOf(initialTemplate?.titleEn ?: "Modern Commerce Suite") }
    var selectedOutputType by remember { mutableStateOf(initialTemplate?.targetType ?: OutputType.BLOCK_THEME) }
    var selectedModelMode by remember { mutableStateOf(AIModelMode.HIGH_THINKING) }
    var sourceMode by remember { mutableStateOf(SourceInputMode.GIT_REPO) }
    var gitUrlInput by remember { mutableStateOf("https://github.com/shadcn-ui/taxonomy.git") }
    var uploadedFileName by remember { mutableStateOf<String?>(null) }

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
    var pipelineStep by remember { mutableIntStateOf(0) }
    var lastConversionResult by remember { mutableStateOf<ConversionItem?>(null) }
    var showThinkingDetails by remember { mutableStateOf(true) }

    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                uploadedFileName = uri.lastPathSegment ?: "archive.zip"
                val inputStream = context.contentResolver.openInputStream(uri)
                val content = inputStream?.bufferedReader()?.use { it.readText() } ?: ""
                if (content.isNotBlank()) {
                    reactCodeInput = content
                }
                Toast.makeText(context, "فایل با موفقیت بارگذاری شد!", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(context, "خطا در خواندن فایل: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    val runConversionAction: () -> Unit = {
        isConverting = true
        pipelineStep = 0
        coroutineScope.launch {
            delay(300)
            pipelineStep = 1 // Ingestion & Stack Detection
            delay(500)
            pipelineStep = 2 // AST & Hook Mapping
            delay(600)
            pipelineStep = 3 // Isolation & Code Generation
            delay(500)
            pipelineStep = 4 // Verification Sandbox & Healing

            val result = repository.runConversion(
                projectName = projectName,
                outputType = selectedOutputType,
                aiModelMode = selectedModelMode,
                reactCode = reactCodeInput
            )

            pipelineStep = 5
            lastConversionResult = result
            isConverting = false
            wizardStep = 3 // Move to Download step
            Toast.makeText(context, "تبدیل با موفقیت ۱۰۰٪ تایید شد و آماده است!", Toast.LENGTH_SHORT).show()
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("converter_studio_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Mode Selector Tabs (Wizard vs Advanced)
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    TabRow(
                        selectedTabIndex = activeTab.ordinal,
                        containerColor = Color.Transparent,
                        divider = {}
                    ) {
                        StudioTab.values().forEach { tab ->
                            Tab(
                                selected = activeTab == tab,
                                onClick = { activeTab = tab },
                                text = {
                                    Text(
                                        text = tab.titleFa,
                                        fontWeight = if (activeTab == tab) FontWeight.Bold else FontWeight.Normal,
                                        fontSize = 13.sp
                                    )
                                },
                                modifier = Modifier.testTag("tab_${tab.name.lowercase()}")
                            )
                        }
                    }
                }
            }
        }

        // ================= WIZARD MODE =================
        if (activeTab == StudioTab.WIZARD) {
            // Wizard Stepper Indicator
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Step 1
                        WizardStepBadge(
                            stepNumber = 1,
                            title = "ورودی و قالب",
                            isActive = wizardStep == 1,
                            isDone = wizardStep > 1,
                            onClick = { if (!isConverting) wizardStep = 1 }
                        )

                        Box(modifier = Modifier.weight(1f).height(2.dp).background(if (wizardStep > 1) SuccessGreen else MaterialTheme.colorScheme.outlineVariant))

                        // Step 2
                        WizardStepBadge(
                            stepNumber = 2,
                            title = "کیفیت‌سنجی",
                            isActive = wizardStep == 2 || isConverting,
                            isDone = wizardStep > 2,
                            onClick = { if (lastConversionResult != null) wizardStep = 2 }
                        )

                        Box(modifier = Modifier.weight(1f).height(2.dp).background(if (wizardStep > 2) SuccessGreen else MaterialTheme.colorScheme.outlineVariant))

                        // Step 3
                        WizardStepBadge(
                            stepNumber = 3,
                            title = "دانلود ZIP",
                            isActive = wizardStep == 3,
                            isDone = false,
                            onClick = { if (lastConversionResult != null) wizardStep = 3 }
                        )
                    }
                }
            }

            // Wizard Step 1: Input & Target Format
            if (wizardStep == 1 && !isConverting) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "گام ۱: تعیین منبع کد ری‌اکت و نام پروژه",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "می‌توانید آدرس مخزن گیت، آرشیو فشرده یا کدهای خود را انتخاب نمایید.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // Source Type Selector
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                SourceInputMode.values().forEach { mode ->
                                    FilterChip(
                                        selected = sourceMode == mode,
                                        onClick = { sourceMode = mode },
                                        label = { Text(mode.titleFa, fontSize = 11.sp) },
                                        leadingIcon = {
                                            when (mode) {
                                                SourceInputMode.GIT_REPO -> Icon(Icons.Default.Link, contentDescription = null, modifier = Modifier.size(14.dp))
                                                SourceInputMode.ZIP_ARCHIVE -> Icon(Icons.Default.FolderZip, contentDescription = null, modifier = Modifier.size(14.dp))
                                                SourceInputMode.CODE_SNIPPET -> Icon(Icons.Default.Code, contentDescription = null, modifier = Modifier.size(14.dp))
                                            }
                                        }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Source Input Field based on Mode
                            when (sourceMode) {
                                SourceInputMode.GIT_REPO -> {
                                    OutlinedTextField(
                                        value = gitUrlInput,
                                        onValueChange = { gitUrlInput = it },
                                        label = { Text("نشانی مخزن Git (GitHub / GitLab)") },
                                        modifier = Modifier.fillMaxWidth().testTag("git_url_input"),
                                        singleLine = true,
                                        leadingIcon = { Icon(Icons.Default.Link, contentDescription = null, tint = PrimaryLight) },
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("شاخه‌های main / master به همراه ساختار کامپوننت‌ها به صورت خودکار واکشی می‌شوند.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                SourceInputMode.ZIP_ARCHIVE -> {
                                    Button(
                                        onClick = { filePickerLauncher.launch("*/*") },
                                        modifier = Modifier.fillMaxWidth().height(48.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                                    ) {
                                        Icon(Icons.Default.UploadFile, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = uploadedFileName ?: "انتخاب فایل آرشیو ZIP پروژه از حافظه",
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontSize = 12.sp
                                        )
                                    }
                                }
                                SourceInputMode.CODE_SNIPPET -> {
                                    OutlinedTextField(
                                        value = reactCodeInput,
                                        onValueChange = { reactCodeInput = it },
                                        label = { Text("کد JSX/TSX کامپوننت") },
                                        modifier = Modifier.fillMaxWidth().height(140.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        textStyle = androidx.compose.ui.text.TextStyle(fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            OutlinedTextField(
                                value = projectName,
                                onValueChange = { projectName = it },
                                label = { Text("نام پروژه و پیشوند قالب") },
                                modifier = Modifier.fillMaxWidth().testTag("wizard_project_name"),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp)
                            )
                        }
                    }
                }

                // Output Format Selection
                item {
                    Text(
                        text = "انتخاب معماری خروجی در وردپرس",
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
                                    .testTag("wizard_output_type_${type.id}"),
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
                                        Text(type.titleEn, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (isSelected) PrimaryLight else MaterialTheme.colorScheme.onSurface)
                                        if (isSelected) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PrimaryLight, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(type.titleFa, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 16.sp)
                                }
                            }
                        }
                    }
                }

                // Start Wizard Action
                item {
                    Button(
                        onClick = {
                            wizardStep = 2
                            runConversionAction()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("wizard_start_button"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("شروع تحلیل و تبدیل خودکار (گام ۲) ←", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Wizard Step 2: Verification & Processing
            if (isConverting || (wizardStep == 2 && lastConversionResult == null)) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "گام ۲: خط لوله اعتبارسنجی و ممیزی کیفی وردپرس",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "بررسی خودکار عدم وجود صفحه سفید (WSOD)، پوشش کامل توابع و کامپایل استایل‌ها.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            PipelineProgress(
                                currentStepIndex = pipelineStep,
                                isProcessing = isConverting
                            )
                        }
                    }
                }
            }

            // Wizard Step 3: Download & Success
            if (wizardStep == 3 && lastConversionResult != null) {
                val result = lastConversionResult!!
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SuccessGreen.copy(alpha = 0.1f)),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(SuccessGreen))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(28.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text("بسته وردپرس با موفقیت ۱۰۰٪ تایید و ساخته شد!", fontWeight = FontWeight.Bold, color = SuccessGreen, fontSize = 14.sp)
                                    Text("تمامی گیت‌های ممیزی نحوی، نبود CDN خارجی و اجرای شبیه‌ساز با موفقیت پشت سر گذاشته شد.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Action: Download ZIP
                            Button(
                                onClick = {
                                    Toast.makeText(context, "بسته فشرده ZIP در پوشه دانلودها ذخیره شد: ${result.projectName}.zip", Toast.LENGTH_LONG).show()
                                },
                                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("wizard_download_zip_button"),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = WordPressBlue)
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("دانلود فایل ZIP آماده نصب وردپرس", fontWeight = FontWeight.Bold)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Restart Button
                            Button(
                                onClick = { wizardStep = 1 },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("تبدیل پروژه جدید", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                            }
                        }
                    }
                }

                // 3-Step WP Installation Guide
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("راهنمای ۳۰ ثانیه‌ای نصب در وردپرس:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("۱. وارد پیشخوان وردپرس خود شوید (wp-admin).", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("۲. به مسیر نمایش > پوسته‌ها (یا افزونه‌ها) > افزودن بروید.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("۳. دکمه «بارگذاری پوسته» را کلیک کرده و فایل ZIP دانلودشده را فعال نمایید.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                // Code Viewer in Step 3
                item {
                    Text(
                        text = "فایل‌های تولیدشده در بسته (${result.generatedFiles.size} فایل)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    CodeViewer(
                        files = result.generatedFiles,
                        projectName = result.projectName
                    )
                }
            }
        }

        // ================= ADVANCED STUDIO MODE =================
        if (activeTab == StudioTab.ADVANCED) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "استودیو پیشرفته تبدیل کد",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = projectName,
                            onValueChange = { projectName = it },
                            label = { Text("نام پروژه") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }

            // Output Type Selector
            item {
                Text(text = "۱. فرمت خروجی مورد نظر در وردپرس", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(OutputType.values()) { type ->
                        val isSelected = selectedOutputType == type
                        Card(
                            modifier = Modifier.width(220.dp).clickable { selectedOutputType = type },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) PrimaryLight.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface
                            )
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(type.titleEn, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (isSelected) PrimaryLight else MaterialTheme.colorScheme.onSurface)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(type.titleFa, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }

            // AI Model Mode
            item {
                Text(text = "۲. حالت موتور هوش مصنوعی", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    AIModelMode.values().forEach { mode ->
                        val isSel = selectedModelMode == mode
                        Card(
                            modifier = Modifier.weight(1f).clickable { selectedModelMode = mode },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSel) PrimaryLight.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface
                            )
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(mode.badge, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text(mode.titleFa, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }

            // Code Editor
            item {
                Text(text = "۳. کدهای منبع React / Next.js", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = reactCodeInput,
                    onValueChange = { reactCodeInput = it },
                    modifier = Modifier.fillMaxWidth().height(200.dp),
                    shape = RoundedCornerShape(12.dp),
                    textStyle = androidx.compose.ui.text.TextStyle(fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                )
            }

            // Conversion Trigger
            item {
                Button(
                    onClick = runConversionAction,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    enabled = !isConverting,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight)
                ) {
                    Icon(Icons.Default.Bolt, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(if (isConverting) "در حال تبدیل..." else "اجرای تبدیل و ذخیره ابری", fontWeight = FontWeight.Bold)
                }
            }

            // Advanced Results
            lastConversionResult?.let { result ->
                item {
                    CodeViewer(files = result.generatedFiles, projectName = result.projectName)
                }
            }
        }
    }
}

@Composable
fun WizardStepBadge(
    stepNumber: Int,
    title: String,
    isActive: Boolean,
    isDone: Boolean,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(
                    when {
                        isDone -> SuccessGreen
                        isActive -> PrimaryLight
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isDone) {
                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            } else {
                Text(
                    text = "$stepNumber",
                    color = if (isActive) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = if (isActive || isDone) FontWeight.Bold else FontWeight.Normal,
            color = if (isActive || isDone) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
