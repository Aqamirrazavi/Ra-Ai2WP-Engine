import React from 'react';

// Simulates React Router multi-page application
export default function App() {
  const posts = [
    {
      id: 1,
      slug: 'getting-started-with-modern-web',
      title: 'راهنمای جامع ورود به دنیای وب نوین',
      excerpt: 'در این مقاله به بررسی مهارت‌های کلیدی برای تبدیل شدن به یک توسعه‌دهنده ارشد می‌پردازیم.',
      date: '۱۴۰۳/۰۴/۱۵',
      author: 'رضا میرزایی',
      category: 'آموزش'
    },
    {
      id: 2,
      slug: 'react-19-features-overview',
      title: 'بررسی ویژگی‌های کلیدی ری‌اکت ۱۹',
      excerpt: 'کامپایلر جدید، اکشن‌ها و هوک‌های تازه؛ چه چیزهایی در نسخه جدید ری‌اکت تغییر کرده‌اند؟',
      date: '۱۴۰۳/۰۴/۱۰',
      author: 'سارا حسینی',
      category: 'تکنولوژی'
    }
  ];

  return (
    <div className="blog-app min-h-screen bg-slate-100 text-slate-800">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-700">وبلاگ تخصصی رایا</h1>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="/" className="text-blue-600 font-bold">خانه</a>
            <a href="/blog" className="hover:text-blue-600">مقالات</a>
            <a href="/about" className="hover:text-blue-600">درباره ما</a>
            <a href="/contact" className="hover:text-blue-600">تماس</a>
          </nav>
        </div>
      </header>

      {/* Main Layout with Content and Sidebar */}
      <div className="max-w-5xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <main className="md:col-span-2 space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{post.category}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>نویسنده: {post.author}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 hover:text-blue-600 transition-colors">
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
              <a href={`/blog/${post.slug}`} className="text-blue-600 text-sm font-bold hover:underline inline-flex items-center gap-1">
                ادامه مطلب ←
              </a>
            </article>
          ))}
        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3 text-sm border-b pb-2">دسته‌بندی‌ها</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex justify-between hover:text-blue-600 cursor-pointer">
                <span>برنامه‌نویسی و وب</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">۱۲</span>
              </li>
              <li className="flex justify-between hover:text-blue-600 cursor-pointer">
                <span>هوش مصنوعی</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">۸</span>
              </li>
              <li className="flex justify-between hover:text-blue-600 cursor-pointer">
                <span>طراحی تجربه کاربری</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">۵</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© ۲۰۲۶ وبلاگ تخصصی رایا. انتشار مطالب با ذکر منبع آزاد است.</p>
      </footer>
    </div>
  );
}
