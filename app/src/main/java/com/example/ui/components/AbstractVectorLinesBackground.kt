package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlin.math.sin

/**
 * Modern Abstract Vector Lines and Cybernetic Wave Mesh Background
 * Inspired by futuristic digital vector ribbon lines and harmonic wave aesthetics.
 */
@Composable
fun AbstractVectorLinesBackground(
    modifier: Modifier = Modifier,
    alphaMultiplier: Float = 1.0f
) {
    val infiniteTransition = rememberInfiniteTransition(label = "vector_lines_anim")
    
    val phase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = (2 * Math.PI).toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 14000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "phase"
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        if (w <= 0f || h <= 0f) return@Canvas

        // 1. Subtle Background Coordinate Grid
        val gridStep = 44f
        val gridColor = Color(0xFF1E293B).copy(alpha = 0.25f * alphaMultiplier)
        
        var x = 0f
        while (x < w) {
            drawLine(
                color = gridColor,
                start = Offset(x, 0f),
                end = Offset(x, h),
                strokeWidth = 1f
            )
            x += gridStep
        }

        var y = 0f
        while (y < h) {
            drawLine(
                color = gridColor,
                start = Offset(0f, y),
                end = Offset(w, y),
                strokeWidth = 1f
            )
            y += gridStep
        }

        // 2. Harmonic Abstract Vector Flow Lines (Multiple Ribbon Layers)
        val lineCount = 7
        val baseColors = listOf(
            Color(0xFF38BDF8), // Cyan
            Color(0xFF0284C7), // Blue
            Color(0xFF818CF8), // Indigo
            Color(0xFF06B6D4), // Teal
            Color(0xFF6366F1), // Violet
            Color(0xFF10B981)  // Emerald
        )

        for (i in 0 until lineCount) {
            val progress = i.toFloat() / lineCount
            val colorIndex = i % baseColors.size
            val nextColorIndex = (i + 1) % baseColors.size

            val brush = Brush.horizontalGradient(
                colors = listOf(
                    baseColors[colorIndex].copy(alpha = 0.05f * alphaMultiplier),
                    baseColors[colorIndex].copy(alpha = 0.35f * alphaMultiplier),
                    baseColors[nextColorIndex].copy(alpha = 0.45f * alphaMultiplier),
                    baseColors[colorIndex].copy(alpha = 0.05f * alphaMultiplier)
                ),
                startX = 0f,
                endX = w
            )

            val path = Path()
            val steps = 60
            val waveHeight = 60f + (i * 12f)
            val baselineY = (h * 0.45f) + (i - lineCount / 2f) * 45f
            val freq = 0.003f + (i * 0.0004f)
            val currentPhase = phase + (i * 0.42f)

            for (s in 0..steps) {
                val currentX = (s.toFloat() / steps) * w
                val currentY = baselineY + (sin(currentX * freq + currentPhase) * waveHeight)

                if (s == 0) {
                    path.moveTo(currentX, currentY)
                } else {
                    path.lineTo(currentX, currentY)
                }
            }

            drawPath(
                path = path,
                brush = brush,
                style = Stroke(
                    width = 1.8f + (i * 0.4f)
                )
            )
        }

        // 3. Ambient Dynamic Flow Arc
        val arcPath = Path()
        arcPath.moveTo(0f, h * 0.2f)
        arcPath.cubicTo(
            w * 0.25f, h * 0.1f + sin(phase) * 50f,
            w * 0.75f, h * 0.35f + sin(phase + 1f) * 60f,
            w, h * 0.25f
        )

        drawPath(
            path = arcPath,
            brush = Brush.linearGradient(
                colors = listOf(
                    Color(0xFF38BDF8).copy(alpha = 0.3f * alphaMultiplier),
                    Color(0xFF818CF8).copy(alpha = 0.4f * alphaMultiplier),
                    Color(0xFF06B6D4).copy(alpha = 0.1f * alphaMultiplier)
                )
            ),
            style = Stroke(width = 2.5f)
        )
    }
}
