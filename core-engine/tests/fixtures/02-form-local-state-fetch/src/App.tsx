import React, { useState } from 'react';

export default function InteractiveLeadForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    serviceInterest: 'architecture',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/wp-json/rtw/v1/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error(`خطای سرور: ${res.status}`);
      }

      const data = await res.json();
      setStatus('success');
      setResponseMessage(data.message || 'درخواست شما با موفقیت ثبت گردید.');
    } catch (err: any) {
      setStatus('error');
      setResponseMessage(err.message || 'ارتباط با سرور برقرار نشد.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 my-10">
      <h2 className="text-2xl font-bold mb-2">ثبت درخواست مشاوره تخصصی</h2>
      <p className="text-slate-400 text-sm mb-6">اطلاعات تماس خود را وارد نمایید تا کارشناسان ما با شما تماس بگیرند.</p>

      {status === 'success' ? (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-sm">
          {responseMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">نام و نام خانوادگی</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              placeholder="مثال: علی رضایی"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">ایمیل معتبر</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">نوع خدمات</label>
            <select
              value={formData.serviceInterest}
              onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="architecture">طراحی معماری</option>
              <option value="interior">دکوراسیون داخلی</option>
              <option value="renovation">بازسازی و نوسازی</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">توضیحات پروژه</label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              placeholder="خلاصه‌ای از نیازمندی‌های پروژه خود بنویسید..."
            />
          </div>

          {status === 'error' && (
            <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-lg text-rose-200 text-xs">
              {responseMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
          >
            {status === 'submitting' ? 'در حال ارسال...' : 'ارسال درخواست مشاوره'}
          </button>
        </form>
      )}
    </div>
  );
}
