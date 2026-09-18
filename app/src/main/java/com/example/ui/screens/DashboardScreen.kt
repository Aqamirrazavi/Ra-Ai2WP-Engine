package com.example.ui.screens

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FolderZip
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.ViewQuilt
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ConversionItem
import com.example.data.model.OutputType
import com.example.ui.theme.DeepSlate900
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.ReactCyan
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WordPressBlue

data class QuickTemplate(
    val titleFa: String,
    val titleEn: String,
    val targetType: OutputType,
    val reactCode: String,
    val icon: ImageVector
)

val SAMPLE_TEMPLATES = listOf(
    QuickTemplate(
        titleFa = "بخش معرفی فروشگاه (Hero Showcase)",
        titleEn = "Shop Hero Showcase",
        targetType = OutputType.CLASSIC_THEME,
        reactCode = """
            export default function ModernHero() {
              return (
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-12 text-center rounded-2xl shadow-xl">
                  <span className="bg-sky-500/20 text-sky-300 text-xs px-3 py-1 rounded-full uppercase tracking-wider">React to WP</span>
                  <h1 className="text-4xl font-extrabold mt-4">نسل نوین طراحی وردپرس</h1>
                  <p className="mt-3 text-slate-300 max-w-xl mx-auto">تبدیل هوشمند کدهای ری‌اکت به محصولات استاندارد با هوش مصنوعی جمینای.</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <button className="bg-sky-500 hover:bg-sky-400 px-6 py-2.5 rounded-lg font-medium shadow-md">مشاهده تم</button>
                    <button className="border border-white/20 px-6 py-2.5 rounded-lg font-medium hover:bg-white/10">مستندات</button>
                  </div>
                </div>
              );
            }
        """.trimIndent(),
        icon = Icons.Default.ViewQuilt
    ),
    QuickTemplate(
        titleFa = "جدول قیمت‌گذاری هوشمند (Pricing Grid)",
        titleEn = "Pricing Table Block",
        targetType = OutputType.GUTENBERG_BLOCK,
        reactCode = """
            export function PricingGrid() {
              const plans = [
                { name: 'پایه', price: '۱۹$', features: ['۳ تم وردپرس', 'پشتیبانی پایه'] },
                { name: 'حرفه‌ای', price: '۴۹$', featured: true, features: ['تمام قالب‌ها', 'پشتیبانی RTL', 'بلاک گوتنبرگ'] },
                { name: 'سازمانی', price: '۹۹$', features: ['دسترسی نامحدود', 'REST API اختصاصی', 'پل ارتباطی'] },
              ];
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {plans.map((p) => (
                    <div key={p.name} className={`p-6 rounded-xl border ${'$'}{p.featured ? 'border-sky-500 shadow-lg' : 'border-slate-700'}`}>
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <div className="text-3xl font-extrabold my-3">{p.price}</div>
                      <ul className="text-sm space-y-2 mb-6">
                        {p.features.map(f => <li key={f}>✓ {f}</li>)}
                      </ul>
                      <button className="w-full py-2 rounded bg-sky-600 text-white font-medium">انتخاب پلن</button>
                    </div>
                  ))}
                </div>
              );
            }
        """.trimIndent(),
        icon = Icons.Default.Code
    ),
    QuickTemplate(
        titleFa = "فرم ارتباط با مشتریان (Contact Form)",
        titleEn = "Contact Form Plugin",
        targetType = OutputType.WP_PLUGIN,
        reactCode = """
            export default function ContactWidget() {
              const [status, setStatus] = useState('');
              return (
                <form className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
                  <h2 className="text-2xl font-bold text-slate-800">ارسال پیام</h2>
                  <input type="text" placeholder="نام شما" className="w-full p-2 border rounded" required />
                  <input type="email" placeholder="ایمیل" className="w-full p-2 border rounded" required />
                  <textarea placeholder="پیام شما..." rows="4" className="w-full p-2 border rounded" required></textarea>
                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded font-semibold">ارسال از طریق REST API</button>
                </form>
              );
            }
        """.trimIndent(),
        icon = Icons.Default.Bolt
    )
)

@Composable
fun DashboardScreen(
    conversions: List<ConversionItem>,
    onNavigateToConverter: (QuickTemplate?) -> Unit,
    onNavigateToAssets: () -> Unit,
    onNavigateToHistory: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("dashboard_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // Hero Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(DeepSlate900, Color(0xFF075985), Color(0xFF0284C7))
                            )
                        )
                        .padding(22.dp)
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF0284C7).copy(alpha = 0.4f))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "استودیو هوشمند تبدیل React به وردپرس",
                                    color = ReactCyan,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(SuccessGreen)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "سیستم فعال (v1.1.0)",
                                    color = Color.White,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "تبدیل کدهای هوش مصنوعی به محصولات پایدار وردپرس",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            lineHeight = 28.sp
                        )

                        Text(
                            text = "تحلیل معماری عمیق با gemini-3.1-pro-preview، پردازش کم‌تاخیر با gemini-3.1-flash-lite و تولید خودکار تصویر قالب با gemini-3.1-flash-image-preview.",
                            color = Color(0xFFE2E8F0),
                            fontSize = 13.sp,
                            lineHeight = 20.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )

                        Spacer(modifier = Modifier.height(18.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            FilledTonalButton(
                                onClick = { onNavigateToConverter(null) },
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = Color.White,
                                    contentColor = Color(0xFF0F172A)
                                ),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.testTag("dashboard_start_convert_button")
                            ) {
                                Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("شروع تبدیل جدید", fontWeight = FontWeight.Bold)
                            }

                            FilledTonalButton(
                                onClick = onNavigateToAssets,
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = Color(0xFF1E293B).copy(alpha = 0.8f),
                                    contentColor = ReactCyan
                                ),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.testTag("dashboard_generate_asset_button")
                            ) {
                                Icon(imageVector = Icons.Default.Image, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("تولید پوسته گرافیکی")
                            }
                        }
                    }
                }
            }
        }

        // System Specs & Metrics
        item {
            Text(
                text = "وضعیت ماژول‌ها و موتورهای هوش مصنوعی",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Metric 1: High Thinking Mode
                ElevatedCard(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = null,
                            tint = Color(0xFF818CF8),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "معماری عمیق",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "gemini-3.1-pro",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Thinking: HIGH",
                            fontSize = 10.sp,
                            color = SuccessGreen,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Metric 2: Low Latency Mode
                ElevatedCard(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = Color(0xFFF59E0B),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "مبدل سریع",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "flash-lite",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "تاخیر کم • پاسخ آنی",
                            fontSize = 10.sp,
                            color = Color(0xFFF59E0B),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Metric 3: Security & WPCS
                ElevatedCard(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = SuccessGreen,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "استانداردها",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "WPCS 3.4.1",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "CVE Guard فعال",
                            fontSize = 10.sp,
                            color = SuccessGreen,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        // Quick Start Templates
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "قالب‌های آماده برای تست سریع",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "انتخاب و تبدیل مستقیم",
                    fontSize = 12.sp,
                    color = PrimaryLight
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(SAMPLE_TEMPLATES) { template ->
                    Card(
                        modifier = Modifier
                            .width(260.dp)
                            .clickable { onNavigateToConverter(template) }
                            .testTag("template_card_${template.titleEn}"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(PrimaryLight.copy(alpha = 0.1f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = template.icon,
                                        contentDescription = null,
                                        tint = PrimaryLight,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = template.titleFa,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        maxLines = 1
                                    )
                                    Text(
                                        text = template.targetType.titleEn,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = template.reactCode.trim().take(120) + "...",
                                color = Color(0xFF64748B),
                                fontSize = 11.sp,
                                maxLines = 3,
                                lineHeight = 16.sp
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                Text(
                                    text = "بارگذاری در استودیو ←",
                                    color = PrimaryLight,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // Recent Conversions
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "آخرین تبدیل‌های ذخیره شده",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "مشاهده همه (${conversions.size})",
                    fontSize = 12.sp,
                    color = PrimaryLight,
                    modifier = Modifier.clickable { onNavigateToHistory() }
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (conversions.isEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text(
                            text = "هنوز تبدیلی ثبت نشده است. یکی از قالب‌ها را انتخاب کنید یا کد خود را در استودیو وارد نمایید.",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    conversions.take(3).forEach { item ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateToHistory() },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.FolderZip,
                                        contentDescription = null,
                                        tint = WordPressBlue,
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(
                                            text = item.projectName,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = "${item.outputType.titleFa} • ${item.generatedFiles.size} فایل",
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(SuccessGreen.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "تکمیل شده",
                                        color = SuccessGreen,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
