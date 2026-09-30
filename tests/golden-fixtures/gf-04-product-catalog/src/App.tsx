import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  rating: number;
  inStock: boolean;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulates dynamic data retrieval
    const timer = setTimeout(() => {
      setProducts([
        { id: 101, name: 'کیبورد مکانیکی بی‌سیم پرو', category: 'تجهیزات جانبی', price: '۳,۲۰۰,۰۰۰ تومان', rating: 4.8, inStock: true },
        { id: 102, name: 'ماوس ارگونومیک اولترا اسلیم', category: 'تجهیزات جانبی', price: '۱,۴۵۰,۰۰۰ تومان', rating: 4.6, inStock: true },
        { id: 103, name: 'مانیتور ۲۷ اینچ ۴K استودیو', category: 'نمایشگر', price: '۱۴,۸۰۰,۰۰۰ تومان', rating: 4.9, inStock: false },
        { id: 104, name: 'پایه خنک‌کننده آلومینیومی لپ‌تاپ', category: 'لوازم جانبی', price: '۸۹۰,۰۰۰ تومان', rating: 4.3, inStock: true }
      ]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="product-catalog-page min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">کاتالوگ تجهیزات دیجیتال</h1>
          <p className="text-slate-600 text-sm">محصولات منتخب با گارانتی اصالت کالا و ارسال سریع</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="mr-3 text-slate-600 font-medium text-sm">در حال بارگذاری کاتالوگ...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <div key={item.id} className="product-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-6">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-3">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base mb-2">{item.name}</h3>
                  <div className="flex items-center text-xs text-amber-500 mb-4">
                    <span>★ {item.rating}</span>
                    <span className="text-slate-400 mr-2">(رضایت ۹۶٪)</span>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-xs text-slate-400 block">قیمت:</span>
                    <span className="text-sm font-black text-slate-900">{item.price}</span>
                  </div>
                  <button
                    disabled={!item.inStock}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      item.inStock
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {item.inStock ? 'سفارش آنلاین' : 'ناموجود'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
