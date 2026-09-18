package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PrimaryLight
import com.example.ui.theme.SuccessGreen

data class StepInfo(
    val titleFa: String,
    val titleEn: String
)

val PIPELINE_STEPS = listOf(
    StepInfo("اعتبارسنجی", "Validate"),
    StepInfo("تحلیل AST", "Analyze"),
    StepInfo("تبدیل وردپرس", "Convert"),
    StepInfo("قوانین WPCS", "Sanitize"),
    StepInfo("بسته‌بندی ZIP", "Package")
)

@Composable
fun PipelineProgress(
    currentStepIndex: Int, // 0 to 4, or 5 for complete
    isProcessing: Boolean,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "جریان خط لوله تبدیل (7-Step Pipeline)",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                if (isProcessing) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Sync,
                            contentDescription = null,
                            tint = PrimaryLight,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "در حال پردازش...",
                            fontSize = 12.sp,
                            color = PrimaryLight,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Steps row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PIPELINE_STEPS.forEachIndexed { index, step ->
                    val isCompleted = index < currentStepIndex
                    val isCurrent = index == currentStepIndex && isProcessing

                    val circleColor by animateColorAsState(
                        targetValue = when {
                            isCompleted -> SuccessGreen
                            isCurrent -> PrimaryLight
                            else -> Color(0xFF94A3B8)
                        },
                        animationSpec = tween(400)
                    )

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(circleColor),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isCompleted) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            } else {
                                Text(
                                    text = "${index + 1}",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = step.titleFa,
                            fontSize = 10.sp,
                            fontWeight = if (isCurrent || isCompleted) FontWeight.Bold else FontWeight.Normal,
                            color = if (isCurrent || isCompleted) MaterialTheme.colorScheme.onSurface else Color(0xFF64748B),
                            maxLines = 1
                        )
                    }

                    if (index < PIPELINE_STEPS.size - 1) {
                        Box(
                            modifier = Modifier
                                .height(2.dp)
                                .weight(0.5f)
                                .background(if (index < currentStepIndex) SuccessGreen else Color(0xFFCBD5E1))
                        )
                    }
                }
            }

            if (isProcessing) {
                Spacer(modifier = Modifier.height(12.dp))
                LinearProgressIndicator(
                    modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
                    color = PrimaryLight,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
        }
    }
}
