/* RTW Bridge Admin JavaScript */
(function($) {
    'use strict';

    $(document).ready(function() {
        const btnDispatch = $('#rtw_btn_dispatch');
        const statusBox = $('#rtw_dispatch_status');

        btnDispatch.on('click', function(e) {
            e.preventDefault();

            const projectTitle = $('#rtw_project_title').val().trim() || 'React WP Project';
            const outputType = $('#rtw_output_type').val();
            const sourceCode = $('#rtw_code_input').val().trim();

            if (!sourceCode) {
                statusBox.removeClass('success loading').addClass('error').text('لطفاً کد کامپوننت React یا لینک فایل فشرده را در کادر متنی وارد نمایید.').show();
                return;
            }

            // Show loading
            btnDispatch.prop('disabled', true).text('در حال مخابره به GitHub Actions...');
            statusBox.removeClass('error success').addClass('loading').html('⏳ در حال برقراری ارتباط با REST API گیت‌هاب و ارسال رویداد مخزن...').show();

            wp.apiFetch({
                path: 'rtw-bridge/v1/dispatch',
                method: 'POST',
                data: {
                    project_name: projectTitle,
                    output_type: outputType,
                    source_code: sourceCode
                }
            }).then(function(response) {
                btnDispatch.prop('disabled', false).html('<span class="dashicons dashicons-cloud-upload"></span> ارسال مجدد به GitHub Actions');
                if (response.success) {
                    statusBox.removeClass('loading error').addClass('success').html('<strong>✓ موفقیت‌آمیز!</strong> ' + response.message);
                } else {
                    statusBox.removeClass('loading success').addClass('error').text(response.message || 'خطا در عملیات.');
                }
            }).catch(function(error) {
                btnDispatch.prop('disabled', false).html('<span class="dashicons dashicons-cloud-upload"></span> ارسال رویداد به GitHub Actions و شروع بیلد');
                const errMsg = error.message || 'خطای غیرمنتظره در سرور وردپرس.';
                statusBox.removeClass('loading success').addClass('error').text('خطا: ' + errMsg);
            });
        });
    });
})(jQuery);
