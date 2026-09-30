import React, { useState, useMemo } from 'react';

interface ArticleItem {
  id: number;
  title: string;
  category: string;
  views: number;
  isFeatured: boolean;
}

export default function FilterDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<'views' | 'title'>('views');

  const rawData: ArticleItem[] = [
    { id: 1, title: 'راهنمای سئو برای وردپرس در سال ۲۰۲۶', category: 'seo', views: 1250, isFeatured: true },
    { id: 2, title: 'بهینه‌سازی دیتابیس وردپرس با MySQL 8', category: 'performance', views: 820, isFeatured: false },
    { id: 3, title: 'امنیت پیشرفته با نانس و Sanitization', category: 'security', views: 2400, isFeatured: true },
    { id: 4, title: 'مهاجرت از کدهای سنتی به کامپوننت‌های مدرن', category: 'development', views: 1650, isFeatured: false },
    { id: 5, title: 'تست خودکار و سنجش کیفیت در CI/CD', category: 'development', views: 980, isFeatured: true }
  ];

  const filteredItems = useMemo(() => {
    return rawData
      .filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesFeatured = !onlyFeatured || item.isFeatured;
        return matchesSearch && matchesCategory && matchesFeatured;
      })
      .sort((a, b) => {
        if (sortBy === 'views') return b.views - a.views;
        return a.title.localeCompare(b.title);
      });
  }, [searchQuery, selectedCategory, onlyFeatured, sortBy]);

  return (
    <div className="filter-dashboard-app min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">میز کار و فیلتر هوشمند مقالات</h1>
          <p className="text-sm text-gray-500 mt-1">جستجو و دسته‌بندی پیشرفته با قابلیت به‌روزرسانی آنی</p>
        </header>

        {/* Filter Controls Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">جستجوی عنوان</label>
            <input
              type="text"
              placeholder="جستجو در مقالات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">دسته‌بندی</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="all">همه دسته‌ها</option>
              <option value="development">توسعه و کدنویسی</option>
              <option value="security">امنیت</option>
              <option value="seo">سئو و مارکتینگ</option>
              <option value="performance">کارایی و سرعت</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">مرتب‌سازی</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'views' | 'title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="views">بیشترین بازدید</option>
              <option value="title">عنوان (الفبا)</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <input
              type="checkbox"
              id="featuredOnly"
              checked={onlyFeatured}
              onChange={(e) => setOnlyFeatured(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="featuredOnly" className="mr-2 text-xs font-semibold text-gray-700">
              فقط مقالات ویژه (Featured)
            </label>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center mb-4 text-xs font-medium text-gray-500">
          <span>تعداد نتایج یافت‌شده: {filteredItems.length} مورد</span>
          {(searchQuery || selectedCategory !== 'all' || onlyFeatured) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyFeatured(false);
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              پاک‌سازی تمام فیلترها
            </button>
          )}
        </div>

        {/* Articles List */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-400 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-3">
                  {item.category}
                </span>
                <span className="font-bold text-gray-900 text-sm">{item.title}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>بازدید: {item.views.toLocaleString('fa-IR')}</span>
                {item.isFeatured && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-xs">
                    ویژه
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400 text-sm">
              هیچ مقاله‌ای با شرایط انتخابی پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
