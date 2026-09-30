import React, { useState, useEffect } from 'react';

interface Project {
  id: number;
  title: string;
  category: string;
  year: string;
  location: string;
}

export default function SedrazaviArchitecturePortfolio() {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, title: 'ویلای صخره‌ای لواسان', category: 'مسکونی لوکس', year: '۱۴۰۲', location: 'تهران، لواسان' },
    { id: 2, title: 'برج اداری هزاره تجریش', category: 'تجاری پایدار', year: '۱۴۰۱', location: 'تهران، تجریش' },
    { id: 3, title: 'مجموعه اقامتی اکولوژیک کویر', category: 'گردشگری بیوفیلیک', year: '۱۴۰۳', location: 'یزد' }
  ]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real projects list if available
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/wp-json/sedrazavi/v1/projects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data);
          }
        }
      } catch (err) {
        // Fallback to static initial state
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = selectedFilter === 'all'
    ? projects
    : projects.filter(p => p.category.includes(selectedFilter));

  return (
    <div className="min-h-screen bg-[#0B132B] text-[#E0E1DD] font-sans antialiased selection:bg-[#5BC0BE] selection:text-[#0B132B]">
      {/* Navigation Header */}
      <header className="border-b border-[#1C2541] bg-[#0B132B]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="w-4 h-4 bg-[#5BC0BE] rounded-full inline-block animate-pulse" />
            <span className="text-xl font-black tracking-wider text-white uppercase">SEDRAZAVI ARCHITECTURE</span>
          </div>

          <nav className="hidden md:flex space-x-reverse space-x-8 text-sm font-medium">
            <a href="#about" className="hover:text-[#5BC0BE] transition-colors">استودیو</a>
            <a href="#projects" className="text-[#5BC0BE] font-bold">پروژه‌ها</a>
            <a href="#philosophy" className="hover:text-[#5BC0BE] transition-colors">مانیفست معماری</a>
            <a href="#contact" className="hover:text-[#5BC0BE] transition-colors">ارتباط</a>
          </nav>

          <button className="px-5 py-2.5 rounded-full border border-[#5BC0BE] text-[#5BC0BE] hover:bg-[#5BC0BE] hover:text-[#0B132B] text-xs font-bold transition-all duration-300">
            رزرو جلسه مشاوره
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-[#5BC0BE] font-mono mb-4 block">
            LUXURY ARCHITECTURAL ATELIER
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
            آفرینش فضاهای اصیل و لوکس در نقطه پیوند هنر و اقلیم
          </h1>
          <p className="text-lg text-[#8D99AE] leading-relaxed mb-10">
            طراحی مهندسی‌شده با بالاترین استانداردهای جهانی برای کسانی که معماری را به عنوان اثر هنری پایدار می‌شناسند.
          </p>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#1C2541]">
            <div>
              <div className="text-3xl font-extrabold text-[#6FFFE9]">۲۸+</div>
              <div className="text-xs text-[#8D99AE] mt-1">پروژه لوکس اجرا شده</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#6FFFE9]">۷</div>
              <div className="text-xs text-[#8D99AE] mt-1">جایزه بین‌المللی طراحی</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#6FFFE9]">۱۰۰٪</div>
              <div className="text-xs text-[#8D99AE] mt-1">رضایت کارفرمایان خصوصی</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section id="projects" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#5BC0BE] font-mono block mb-2">SELECTED WORKS</span>
            <h2 className="text-3xl font-bold text-white">منتخب آثار و پروژه‌های شاخص</h2>
          </div>

          {/* Category Filter Chips */}
          <div className="flex space-x-reverse space-x-2 mt-4 md:mt-0">
            {['all', 'مسکونی', 'تجاری', 'بیوفیلیک'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${selectedFilter === cat ? 'bg-[#5BC0BE] text-[#0B132B]' : 'bg-[#1C2541] text-[#8D99AE] hover:text-white'}`}
              >
                {cat === 'all' ? 'همه آثار' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div key={p.id} className="group rounded-2xl bg-[#1C2541]/70 border border-[#3A506B]/30 p-6 hover:border-[#5BC0BE]/50 transition-all duration-300">
              <div className="h-48 rounded-xl bg-[#0B132B] mb-6 flex items-center justify-center border border-[#3A506B]/20 text-xs text-[#8D99AE]">
                تصویر پروژه: {p.title}
              </div>
              <div className="flex justify-between items-center text-xs text-[#5BC0BE] font-mono mb-2">
                <span>{p.category}</span>
                <span>{p.year}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#6FFFE9] transition-colors">{p.title}</h3>
              <p className="text-xs text-[#8D99AE]">{p.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1C2541] py-8 text-center text-xs text-[#8D99AE]">
        © تمامی حقوق مادی و معنوی این وب‌سایت متعلق به آتلیه معماری سیدرضوی می‌باشد.
      </footer>
    </div>
  );
}
