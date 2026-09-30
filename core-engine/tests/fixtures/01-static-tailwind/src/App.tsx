import React from 'react';

export default function StaticTailwindHero() {
  return (
    <section className="min-h-screen bg-[#0B132B] dark:bg-[#070A13] text-[#E0E1DD] p-4 sm:p-8 md:p-16 flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full border border-[#778DA9]/20 rounded-2xl bg-[#1B263B]/60 p-6 md:p-12 shadow-2xl backdrop-blur-md">
        <span className="text-xs uppercase tracking-widest text-[#48CAE4] font-mono mb-3 block">
          Tailwind Arbitrary Values & Variants
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
          معماری مدرن، استایل‌های ایزوله بدون وابستگی کلاینت
        </h1>
        <p className="text-sm sm:text-base text-[#778DA9] leading-relaxed mb-8 max-w-2xl">
          این فیکسچر شامل مقادیر دلخواه رنگی هگزادسیمال، واریانت‌های ریسپانسیو و حالت تاریک است که باید بدون نیاز به Tailwind Play-CDN در CSS استاتیک نهایی کامپایل شوند.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-6 py-3 rounded-xl bg-[#48CAE4] hover:bg-[#0096C7] text-[#0B132B] font-bold transition-colors duration-200">
            شروع پروژه
          </button>
          <button className="px-6 py-3 rounded-xl border border-[#778DA9] hover:bg-[#1B263B] text-white transition-colors duration-200">
            مشاهده نمونه‌کارها
          </button>
        </div>
      </div>
    </section>
  );
}
