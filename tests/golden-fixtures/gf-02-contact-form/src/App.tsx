import React, { useState } from 'react';

export default function ContactApp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
    newsletter: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'لطفاً نام کامل خود را وارد کنید.';
    if (!formData.email.trim()) {
      errs.email = 'لطفاً ایمیل خود را وارد کنید.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'فرمت ایمیل نامعتبر است.';
    }
    if (!formData.message.trim()) errs.message = 'متن پیام نمی‌تواند خالی باشد.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    // Simulates AJAX endpoint submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم.');
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: '',
        newsletter: true
      });
    }, 1000);
  };

  return (
    <div className="contact-container min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">تماس با ما</h2>
          <p className="mt-2 text-sm text-gray-600">
            سوالی دارید یا به مشاوره اختصاصی نیاز دارید؟ با ما در ارتباط باشید.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-r-4 border-green-500 rounded-lg text-green-800 text-sm font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="مثال: علی احمدی"
            />
            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              آدرس ایمیل
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              موضوع پیام
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="موضوع درخواست شما"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              متن پیام
            </label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="توضیحات درخواست خود را بنویسید..."
            />
            {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="newsletter"
              checked={formData.newsletter}
              onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="newsletter" className="mr-2 text-sm text-gray-600">
              مایلم آخرین اخبار و مقالات آموزشی را در ایمیل دریافت کنم.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ارسال پیام...' : 'ارسال پیام'}
          </button>
        </form>
      </div>
    </div>
  );
}
