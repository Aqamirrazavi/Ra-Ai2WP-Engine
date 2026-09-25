package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.FolderZip
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Login
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
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
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.ConversionRepository
import com.example.ui.components.AbstractVectorLinesBackground
import com.example.ui.screens.AssetStudioScreen
import com.example.ui.screens.ConverterStudioScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.HistoryBridgeScreen
import com.example.ui.screens.QuickTemplate
import com.example.ui.theme.DeepSlate900
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.ReactCyan
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WordPressBlue
import com.google.firebase.FirebaseApp
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var repository: ConversionRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            FirebaseApp.initializeApp(this)
        } catch (e: Exception) {
            // Firebase already initialized or fallback
        }

        repository = ConversionRepository(this)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                MainAppScreen(repository)
            }
        }
    }
}

enum class NavDestination(val labelFa: String, val labelEn: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    DASHBOARD("پیشخوان", "Dashboard", Icons.Default.Dashboard),
    CONVERTER("استودیو", "Studio", Icons.Default.AutoAwesome),
    ASSETS("پوسته و عکس", "Assets", Icons.Default.Image),
    HISTORY("تاریخچه و پل", "Bridge", Icons.Default.FolderZip)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(repository: ConversionRepository) {
    var currentDestination by remember { mutableStateOf(NavDestination.DASHBOARD) }
    var selectedTemplateForStudio by remember { mutableStateOf<QuickTemplate?>(null) }
    var showProfileDialog by remember { mutableStateOf(false) }

    val userProfile by repository.authManager.currentUserProfile.collectAsState()
    val conversions by repository.conversions.collectAsState()
    val coroutineScope = rememberCoroutineScope()

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("main_scaffold"),
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(PrimaryLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "RTW",
                                color = Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 11.sp
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "RTW Converter",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "React & AI to WordPress Studio",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                },
                actions = {
                    // Profile button with auth indicator
                    IconButton(
                        onClick = { showProfileDialog = true },
                        modifier = Modifier.testTag("profile_button")
                    ) {
                        Box {
                            Icon(
                                imageVector = Icons.Default.AccountCircle,
                                contentDescription = "User Profile",
                                tint = if (userProfile?.isAnonymous == false) PrimaryLight else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(28.dp)
                            )
                            if (userProfile != null) {
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .clip(CircleShape)
                                        .background(if (userProfile?.isAnonymous == false) SuccessGreen else Color(0xFFF59E0B))
                                        .align(Alignment.BottomEnd)
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp,
                modifier = Modifier.testTag("bottom_navigation_bar")
            ) {
                NavDestination.values().forEach { destination ->
                    val isSelected = currentDestination == destination
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentDestination = destination },
                        icon = {
                            Icon(
                                imageVector = destination.icon,
                                contentDescription = destination.labelEn,
                                modifier = Modifier.size(22.dp)
                            )
                        },
                        label = {
                            Text(
                                text = destination.labelFa,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryLight,
                            selectedTextColor = PrimaryLight,
                            indicatorColor = PrimaryLight.copy(alpha = 0.15f)
                        ),
                        modifier = Modifier.testTag("nav_item_${destination.name.lowercase()}")
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            AbstractVectorLinesBackground(
                modifier = Modifier.fillMaxSize(),
                alphaMultiplier = 0.6f
            )

            when (currentDestination) {
                NavDestination.DASHBOARD -> DashboardScreen(
                    conversions = conversions,
                    onNavigateToConverter = { template ->
                        selectedTemplateForStudio = template
                        currentDestination = NavDestination.CONVERTER
                    },
                    onNavigateToAssets = {
                        currentDestination = NavDestination.ASSETS
                    },
                    onNavigateToHistory = {
                        currentDestination = NavDestination.HISTORY
                    }
                )

                NavDestination.CONVERTER -> ConverterStudioScreen(
                    repository = repository,
                    initialTemplate = selectedTemplateForStudio
                )

                NavDestination.ASSETS -> AssetStudioScreen(
                    repository = repository
                )

                NavDestination.HISTORY -> HistoryBridgeScreen(
                    repository = repository
                )
            }
        }
    }

    // Profile & Google Authentication Dialog
    if (showProfileDialog) {
        AlertDialog(
            onDismissRequest = { showProfileDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.CloudDone, contentDescription = null, tint = PrimaryLight)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "احراز هویت و پایگاه داده Firebase",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "این برنامه برای ذخیره‌سازی ابری تبدیل‌ها و تصاویر از Firebase Auth و Google Sign-in استفاده می‌کند.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = androidx.compose.material3.CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "کاربر فعلی:",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = userProfile?.displayName ?: "کاربر ناشناس",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = userProfile?.email ?: "نامشخص",
                                fontSize = 12.sp,
                                color = Color(0xFF64748B)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(if (userProfile?.isAnonymous == false) SuccessGreen else Color(0xFFF59E0B))
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (userProfile?.isAnonymous == false) "ورود با حساب گوگل (تایید شده)" else "حالت مهمان محلی (همگام‌سازی ابری خودکار)",
                                    fontSize = 11.sp,
                                    color = if (userProfile?.isAnonymous == false) SuccessGreen else Color(0xFFF59E0B)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    if (userProfile?.isAnonymous == true) {
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    repository.authManager.signInWithGoogle()
                                    showProfileDialog = false
                                }
                            },
                            modifier = Modifier.fillMaxWidth().testTag("google_sign_in_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight)
                        ) {
                            Icon(imageVector = Icons.Default.Login, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("ورود با حساب Google")
                        }
                    } else {
                        OutlinedButton(
                            onClick = {
                                repository.authManager.signOut()
                                coroutineScope.launch {
                                    repository.authManager.signInAnonymously()
                                }
                                showProfileDialog = false
                            },
                            modifier = Modifier.fillMaxWidth().testTag("sign_out_button")
                        ) {
                            Icon(imageVector = Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("خروج از حساب")
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showProfileDialog = false }) {
                    Text("بستن")
                }
            }
        )
    }
}
