import React from 'react';

export default function App() {
  const projects = [
    {
      id: 1,
      title: 'سامانه ابری پیشرفته (Cloud Platform)',
      desc: 'پلتفرم توزیع‌شده با قابلیت پردازش در لحظه داده‌ها و داشبورد تحلیلی یکپارچه.',
      tag: 'فناوری اطلاعات',
      stars: '۴.۹'
    },
    {
      id: 2,
      title: 'فروشگاه نسل نو (Next-gen Commerce)',
      desc: 'سامانه چندفروشندگی پرسرعت با درگاه‌های پرداخت هوشمند و طراحی واکنش‌گرا.',
      tag: 'تجارت الکترونیک',
      stars: '۵.۰'
    },
    {
      id: 3,
      title: 'اپلیکیشن سلامت دیجیتال (Health AI)',
      desc: 'دستیار پایش ضربان قلب و علائم بالینی مبتنی بر مدل‌های یادگیری عمیق.',
      tag: 'هوش مصنوعی',
      stars: '۴.۸'
    }
  ];

  return (
    <div className="portfolio-app font-sans bg-slate-900 text-slate-100 min-h-screen">
      {/* Header */}
      <header className="site-header border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="brand flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              RTW
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">استودیو طراحی نوین</span>
          </div>
          <nav className="nav-menu hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-cyan-400 transition-colors">خانه</a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">پروژه‌ها</a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">درباره ما</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">تماس</a>
          </nav>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md shadow-cyan-500/20">
            شروع همکاری
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero-section py-20 px-6 max-w-5xl mx-auto text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-6">
          طراحی وب و مهندسی نرم‌افزار حرفه‌ای
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
          خلق تجربه‌های دیجیتال <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">پایدار، سریع و چشم‌نواز</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          ما ایده‌های پیچیده شما را به محصولاتی مقیاس‌پذیر با بالاترین استانداردهای روز دنیا تبدیل می‌کنیم.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#projects" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all">
            مشاهده پروژه‌ها
          </a>
          <a href="#contact" className="border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold px-8 py-3.5 rounded-xl transition-all">
            دریافت مشاوره رایگان
          </a>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="projects-section py-16 px-6 max-w-6xl mx-auto border-t border-slate-800">
        <div className="section-title text-center mb-14">
          <h2 className="text-3xl font-black text-white mb-3">نمونه‌کارهای منتخب</h2>
          <p className="text-slate-400 text-sm">برخی از پروژه‌های اخیر که با افتخار تحویل داده‌ایم</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((item) => (
            <article key={item.id} className="project-card bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-xl">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md mb-4 inline-block">
                {item.tag}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.desc}</p>
              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700/50 pt-4">
                <span>امتیاز کارفرما: {item.stars} ⭐</span>
                <span className="text-cyan-400 font-semibold cursor-pointer hover:underline">مشاهده جزئیات ←</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer bg-slate-950 border-t border-slate-800 py-10 px-6 text-center text-slate-500 text-sm">
        <p className="mb-2">تمامی حقوق برای استودیو نوین محفوظ است © ۲۰۲۶</p>
        <p className="text-xs text-slate-600">طراحی‌شده با دقت و متکی بر استانداردهای باز وب</p>
      </footer>
    </div>
  );
}
