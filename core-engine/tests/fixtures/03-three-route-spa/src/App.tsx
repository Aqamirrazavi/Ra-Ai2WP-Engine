import React, { useState } from 'react';

type RouteKey = '/' | '/services' | '/about';

export default function ThreeRouteApp() {
  const [currentRoute, setCurrentRoute] = useState<RouteKey>('/');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-400">ستاره معماری مدرن</div>
          <nav className="flex space-x-reverse space-x-6 text-sm font-medium">
            <button
              onClick={() => setCurrentRoute('/')}
              className={`hover:text-blue-400 transition-colors ${currentRoute === '/' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-slate-300'}`}
            >
              صفحه اصلی
            </button>
            <button
              onClick={() => setCurrentRoute('/services')}
              className={`hover:text-blue-400 transition-colors ${currentRoute === '/services' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-slate-300'}`}
            >
              خدمات ما
            </button>
            <button
              onClick={() => setCurrentRoute('/about')}
              className={`hover:text-blue-400 transition-colors ${currentRoute === '/about' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-slate-300'}`}
            >
              درباره ما
            </button>
          </nav>
        </div>
      </header>

      {/* Main Route Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        {currentRoute === '/' && (
          <section className="space-y-6">
            <h1 className="text-4xl font-extrabold text-white">طراحی خلاقانه و پایدار برای فضاهای آینده</h1>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              ما در استودیو معماری با تلفیق هنر و مهندسی دقیق، فضاهایی الهام‌بخش و ماندگار برای کار و زندگی خلق می‌کنیم.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="font-bold text-lg text-blue-400 mb-2">+۱۵ سال تجربه</h3>
                <p className="text-sm text-slate-400">اجرای بیش از ۲۰۰ پروژه لوکس مسکونی و تجاری در سراسر کشور.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="font-bold text-lg text-emerald-400 mb-2">معماری بیوفیلیک</h3>
                <p className="text-sm text-slate-400">بهره‌گیری حداکثری از نور طبیعی و عناصر طبیعت در طراحی داخلی.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="font-bold text-lg text-amber-400 mb-2">استاندارد جهانی</h3>
                <p className="text-sm text-slate-400">برنده ۳ جایزه بین‌المللی طراحی پایدار و معماری پایدار.</p>
              </div>
            </div>
          </section>
        )}

        {currentRoute === '/services' && (
          <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-white">خدمات تخصصی استودیو</h1>
            <p className="text-slate-400">طیف جامع خدمات مهندسی و نظارت از ایده تا کلید تحویل.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h4 className="font-bold text-lg mb-2">طراحی و نظارت سازه</h4>
                <p className="text-sm text-slate-400">محاسبات دقیق سازه‌ای و بهینه‌سازی مصرف متریال با استانداردهای نظام مهندسی.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h4 className="font-bold text-lg mb-2">طراحی داخلی مدرن</h4>
                <p className="text-sm text-slate-400">انتخاب متریال لوکس، نورپردازی خطی و پلان‌های منعطف مسکونی و اداری.</p>
              </div>
            </div>
          </section>
        )}

        {currentRoute === '/about' && (
          <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-white">درباره استودیو و تاریخچه</h1>
            <p className="text-slate-400 leading-relaxed max-w-2xl">
              تیم ما متشکل از فارغ‌التحصیلان برتر معماری با ماموریت بازتعریف فضاهای زیستی تاسیس گردید. باور ما بر این است که معماری خوب حق تمام انسان‌هاست.
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © تمامی حقوق برای استودیو معماری محفوظ است.
      </footer>
    </div>
  );
}
