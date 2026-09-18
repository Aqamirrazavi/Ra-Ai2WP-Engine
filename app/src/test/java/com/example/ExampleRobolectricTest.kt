package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.gemini.GeminiService
import com.example.data.model.AIModelMode
import com.example.data.model.OutputType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

    @Test
    fun readStringFromContext() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("RTW Converter", appName)
    }

    @Test
    fun testWordPressSuiteGeneration() {
        val service = GeminiService()
        val (thinking, files) = service.generateFallbackWordPressSuite(
            projectName = "Test Store",
            outputType = OutputType.CLASSIC_THEME,
            reactSource = "export default function App() { return <div>Store</div>; }",
            mode = AIModelMode.HIGH_THINKING
        )

        assertTrue(thinking.isNotEmpty())
        assertTrue(files.isNotEmpty())
        assertTrue(files.any { it.fileName == "style.css" })
        assertTrue(files.any { it.fileName == "functions.php" })
        assertTrue(files.any { it.fileName == "rtl.css" })
    }

    @Test
    fun testBlockThemeV3Generation() {
        val service = GeminiService()
        val (_, files) = service.generateFallbackWordPressSuite(
            projectName = "FSE Store",
            outputType = OutputType.BLOCK_THEME,
            reactSource = "export default function App() {}",
            mode = AIModelMode.LOW_LATENCY
        )

        val themeJson = files.find { it.fileName == "theme.json" }
        assertNotNull(themeJson)
        assertTrue(themeJson!!.content.contains("\"version\": 3"))
    }
}
