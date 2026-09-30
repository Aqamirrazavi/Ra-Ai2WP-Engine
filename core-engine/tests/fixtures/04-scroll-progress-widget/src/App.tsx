import React, { useState, useEffect } from 'react';

export default function ScrollProgressWidget() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
        setShowBackToTop(window.scrollY > 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[150vh] bg-slate-900 text-slate-100 p-8">
      {/* Top Fixed Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-800 z-50">
        <div
          className="h-full bg-blue-500 transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Percentage Indicator */}
      <div className="fixed top-6 right-6 z-40 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-mono text-blue-400 shadow-lg backdrop-blur">
        پیشرفت مطالعه: {Math.round(scrollProgress)}%
      </div>

      <div className="max-w-2xl mx-auto pt-16 space-y-8">
        <h1 className="text-3xl font-extrabold text-white">راهنمای بهینه‌سازی سرعت و رندر وردپرس</h1>
        <p className="text-slate-300 leading-relaxed">
          برای تست دقیق این ویجت، صفحه دارای ارتفاع زیاد بوده و رویدادهای اسکرول و پاکسازی لیسنرها بررسی می‌شوند.
        </p>
        <div className="p-6 bg-slate-800 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-blue-300">اصل اول: کشینگ لایه سرور</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            استفاده از OPcache و کش آبجکت ردیس (Redis Object Cache) موجب کاهش بار پردازشی پایگاه‌داده تا ۸۰٪ می‌گردد.
          </p>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-blue-300">اصل دوم: بهینه‌سازی استایل‌ها و فونت‌ها</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            عدم وابستگی به CDNهای خارجی مانند Tailwind Play CDN و میزبانی محلی فونت‌های وب، خطرات مسدودسازی و تأخیر DNS را به صفر می‌رساند.
          </p>
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-40 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-all"
          title="بازگشت به بالا"
        >
          ↑
        </button>
      )}
    </div>
  );
}
