package com.example.ui.screens

import android.graphics.BitmapFactory
import android.util.Base64
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
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
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AssetItem
import com.example.data.repository.ConversionRepository
import com.example.ui.theme.DeepSlate900
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.ReactCyan
import com.example.ui.theme.SuccessGreen
import kotlinx.coroutines.launch

data class AssetPreset(
    val titleFa: String,
    val type: String,
    val defaultPrompt: String,
    val ratio: String
)

val ASSET_PRESETS = listOf(
    AssetPreset(
        titleFa = "پیش‌نمایش قالب (screenshot.png)",
        type = "screenshot.png",
        defaultPrompt = "Modern minimal WordPress theme screenshot for an e-commerce website, featuring dark slate header, clean typography, product showcase grid with glowing cyan accents, professional UI mockup, 4:3 aspect ratio.",
        ratio = "4:3"
    ),
    AssetPreset(
        titleFa = "آیکون بلاک گوتنبرگ (Block Icon)",
        type = "block_icon",
        defaultPrompt = "Minimalist modern vector icon for a WordPress Gutenberg block widget, geometric cyan and royal blue symbol on clean slate background, flat design, 1:1 square.",
        ratio = "1:1"
    ),
    AssetPreset(
        titleFa = "بنر بالای صفحه قالب (Hero Banner)",
        type = "hero_banner",
        defaultPrompt = "Futuristic tech abstract mesh gradient banner for website hero section, deep navy slate with luminous cyan and violet waves, elegant, 1:1.",
        ratio = "1:1"
    )
)

@Composable
fun AssetStudioScreen(
    repository: ConversionRepository,
    modifier: Modifier = Modifier
) {
    val assets by repository.assets.collectAsState()
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedPreset by remember { mutableStateOf(ASSET_PRESETS.first()) }
    var promptInput by remember { mutableStateOf(selectedPreset.defaultPrompt) }
    var editPromptInput by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }
    var currentGeneratedAsset by remember { mutableStateOf<AssetItem?>(null) }
    var isEditingMode by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("asset_studio_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
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
                                text = "استودیو گرافیک و پوسته تم با هوش مصنوعی",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "تولید و ویرایش تصاویر با مدل gemini-3.1-flash-image-preview",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF38BDF8).copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "gemini-3.1-flash-image-preview",
                                color = Color(0xFF0284C7),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // Presets row
        item {
            Text(
                text = "۱. انتخاب نوع دارایی گرافیکی وردپرس",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(ASSET_PRESETS) { preset ->
                    val isSelected = selectedPreset == preset
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            selectedPreset = preset
                            promptInput = preset.defaultPrompt
                        },
                        label = { Text(preset.titleFa, fontSize = 12.sp) },
                        leadingIcon = {
                            Icon(imageVector = Icons.Default.Palette, contentDescription = null, modifier = Modifier.size(16.dp))
                        },
                        modifier = Modifier.testTag("asset_preset_${preset.type}")
                    )
                }
            }
        }

        // Prompt Input
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "۲. پرامپت متنی برای تولید تصویر (Text-to-Image Prompt)",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = promptInput,
                        onValueChange = { promptInput = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(110.dp)
                            .testTag("asset_prompt_input"),
                        placeholder = { Text("توصیف تصویر مورد نظر خود را بنویسید...", fontSize = 12.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryLight,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant
                        ),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Edit existing image section
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isEditingMode = !isEditingMode },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = null,
                                tint = Color(0xFF818CF8),
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "اعمال تغییرات و ویرایش بر روی تصویر قبلی (Image Editing)",
                                fontSize = 12.sp,
                                color = Color(0xFF818CF8),
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Text(
                            text = if (isEditingMode) "بستن" else "باز کردن ویرایشگر",
                            fontSize = 11.sp,
                            color = PrimaryLight
                        )
                    }

                    AnimatedVisibility(visible = isEditingMode) {
                        Column {
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = editPromptInput,
                                onValueChange = { editPromptInput = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(90.dp)
                                    .testTag("asset_edit_prompt_input"),
                                label = { Text("دستورالعمل ویرایش (مانند: تغییر رنگ بک‌گراند به بنفش تیره یا افزودن لوگو)") },
                                placeholder = { Text("تغییرات مورد نظر را وارد کنید...", fontSize = 12.sp) },
                                shape = RoundedCornerShape(10.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            if (promptInput.isBlank()) {
                                Toast.makeText(context, "لطفاً پرامپت متنی را بنویسید.", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            isGenerating = true
                            coroutineScope.launch {
                                val asset = repository.generateAsset(
                                    prompt = promptInput,
                                    editPrompt = if (isEditingMode) editPromptInput else "",
                                    assetType = selectedPreset.type
                                )
                                currentGeneratedAsset = asset
                                isGenerating = false
                                Toast.makeText(context, "تصویر با موفقیت تولید و در گالری ذخیره شد!", Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("generate_asset_button"),
                        enabled = !isGenerating,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight)
                    ) {
                        if (isGenerating) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("در حال تولید تصویر با هوش مصنوعی...")
                        } else {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isEditingMode && editPromptInput.isNotBlank()) "ویرایش تصویر با gemini-3.1-flash-image-preview" else "تولید تصویر با gemini-3.1-flash-image-preview",
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // Current Asset Preview Card
        val activeAsset = currentGeneratedAsset ?: assets.firstOrNull()
        activeAsset?.let { asset ->
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("generated_asset_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "پیش‌نمایش تصویر تولید شده (${asset.assetType})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(SuccessGreen.copy(alpha = 0.15f))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(text = "ذخیره شده در Firestore", color = SuccessGreen, fontSize = 11.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        val bitmap = remember(asset.imageBase64) {
                            asset.imageBase64?.let { base64 ->
                                try {
                                    val bytes = Base64.decode(base64, Base64.DEFAULT)
                                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                                } catch (e: Exception) {
                                    null
                                }
                            }
                        }

                        if (bitmap != null) {
                            Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = asset.prompt,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .aspectRatio(if (asset.assetType == "screenshot.png") 4f / 3f else 1f)
                                    .clip(RoundedCornerShape(12.dp)),
                                contentScale = ContentScale.Crop
                            )
                        } else {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(200.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(DeepSlate900),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "تصویر گرافیکی: ${asset.prompt.take(40)}",
                                    color = Color.White,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = asset.prompt,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        // Assets Gallery
        item {
            Text(
                text = "گالری دارایی‌های گرافیکی تولید شده (${assets.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (assets.isEmpty()) {
                Text(
                    text = "هنوز دارایی تصویری تولید نشده است.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(assets) { item ->
                        Card(
                            modifier = Modifier
                                .width(160.dp)
                                .clickable { currentGeneratedAsset = item }
                                .testTag("gallery_item_${item.id}"),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                val itemBitmap = remember(item.imageBase64) {
                                    item.imageBase64?.let { base64 ->
                                        try {
                                            val bytes = Base64.decode(base64, Base64.DEFAULT)
                                            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                                        } catch (e: Exception) {
                                            null
                                        }
                                    }
                                }

                                if (itemBitmap != null) {
                                    Image(
                                        bitmap = itemBitmap.asImageBitmap(),
                                        contentDescription = null,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(100.dp)
                                            .clip(RoundedCornerShape(8.dp)),
                                        contentScale = ContentScale.Crop
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(100.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0xFF1E293B)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(imageVector = Icons.Default.Image, contentDescription = null, tint = Color.White)
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = item.assetType,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1
                                )
                                Text(
                                    text = item.prompt,
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 2
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
