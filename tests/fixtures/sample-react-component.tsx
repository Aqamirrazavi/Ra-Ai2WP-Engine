import React, { useState } from 'react';

interface HeroProps {
  headline?: string;
  subheading?: string;
  callToActionUrl?: string;
}

export const HeroBanner: React.FC<HeroProps> = ({
  headline = 'توسعه نسل آینده وردپرس با هوش مصنوعی',
  subheading = 'تبدیل آنی کامپوننت‌های مدرن ری‌اکت به بلاک‌های بومی گوتنبرگ با رعایت WPCS 3.4.1',
  callToActionUrl = 'https://github.com/Aqamirrazavi/Ra-Ai2WP-Engine'
}) => {
  const [clicked, setClicked] = useState(false);

  return (
    <section className="rtw-hero-container bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-cyan-400">
          {headline}
        </h1>
        <p className="text-lg text-slate-300 mb-6">
          {subheading}
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={callToActionUrl}
            onClick={() => setClicked(true)}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 font-bold rounded-lg transition"
          >
            {clicked ? 'در حال انتقال...' : 'مشاهده در گیت‌هاب'}
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
