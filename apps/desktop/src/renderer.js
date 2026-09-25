let currentConversion = null;
let currentTab = 'php';

const btnOpenFile = document.getElementById('btn-open-file');
const btnConvert = document.getElementById('btn-convert');
const btnCopy = document.getElementById('btn-copy');
const reactInput = document.getElementById('react-input');
const outputContent = document.getElementById('output-content');
const fileInfo = document.getElementById('file-info');
const tabPhp = document.getElementById('tab-php');
const tabJson = document.getElementById('tab-json');

btnOpenFile.addEventListener('click', async () => {
  if (window.rtwAPI && window.rtwAPI.openFile) {
    const file = await window.rtwAPI.openFile();
    if (file) {
      reactInput.value = file.content;
      fileInfo.textContent = file.filePath.split('/').pop().split('\\').pop();
    }
  }
});

btnConvert.addEventListener('click', async () => {
  const code = reactInput.value;
  btnConvert.textContent = '⏳ در حال تجزیه AST...';
  btnConvert.disabled = true;

  try {
    let result;
    if (window.rtwAPI && window.rtwAPI.convertLocal) {
      result = await window.rtwAPI.convertLocal({ sourceCode: code });
    } else {
      // Fallback
      result = {
        success: true,
        php: "<?php\n// RTW Fallback\nfunction rtw_block_render() { return '<div>Transpiled</div>'; }",
        blockJson: "{\n  \"name\": \"rtw/custom-block\"\n}"
      };
    }

    currentConversion = result;
    renderOutput();
  } catch (err) {
    outputContent.innerHTML = `<code style="color: #ef4444;">خطا: ${err.message}</code>`;
  } finally {
    btnConvert.textContent = '⚡ تبدیل آفلاین به WordPress';
    btnConvert.disabled = false;
  }
});

tabPhp.addEventListener('click', () => {
  currentTab = 'php';
  tabPhp.classList.add('active');
  tabJson.classList.remove('active');
  renderOutput();
});

tabJson.addEventListener('click', () => {
  currentTab = 'json';
  tabJson.classList.add('active');
  tabPhp.classList.remove('active');
  renderOutput();
});

btnCopy.addEventListener('click', () => {
  if (!currentConversion) return;
  const text = currentTab === 'php' ? currentConversion.php : currentConversion.blockJson;
  navigator.clipboard.writeText(text);
  const oldText = btnCopy.textContent;
  btnCopy.textContent = '✓ کپی شد!';
  setTimeout(() => {
    btnCopy.textContent = oldText;
  }, 2000);
});

function renderOutput() {
  if (!currentConversion) return;
  if (currentTab === 'php') {
    outputContent.innerHTML = `<code>${escapeHtml(currentConversion.php)}</code>`;
  } else {
    outputContent.innerHTML = `<code>${escapeHtml(currentConversion.blockJson)}</code>`;
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
