import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Mail, Cloud, Check } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LibraryContext } from '../App';
import { BookStatus } from '../types';

export const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useContext(LibraryContext);
  const [showExportSuccess, setShowExportSuccess] = React.useState(false);

  const statusData = [
    { name: 'Đang đọc', value: books.filter(b => b.status === BookStatus.Reading).length, color: '#10B981' },
    { name: 'Muốn đọc', value: books.filter(b => b.status === BookStatus.ToRead).length, color: '#A78BFA' },
    { name: 'Đã đọc', value: books.filter(b => b.status === BookStatus.Finished).length, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  const mockMonthlyData = [
    { name: 'Th1', count: 2 },
    { name: 'Th2', count: 3 },
    { name: 'Th3', count: 1 },
    { name: 'Th4', count: 4 },
    { name: 'Th5', count: 2 },
    { name: 'Th6', count: 5 },
  ];

  const handleExport = () => {
    // Simulate export delay
    setTimeout(() => setShowExportSuccess(true), 500);
  };

  return (
    <div className="min-h-screen bg-darker pb-24 pt-safe">
      <header className="px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">Thống kê & Xuất dữ liệu</h1>
      </header>

      <main className="px-6 space-y-8 mt-4">
        {/* Pie Chart */}
        <section className="bg-card rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6">Sách theo trạng thái</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#27272A', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Insights */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Thông tin chi tiết</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-5 rounded-2xl">
              <p className="text-3xl font-bold text-white">3.5</p>
              <p className="text-xs text-slate-400 mt-1">Sách/tháng (TB)</p>
            </div>
            <div className="bg-card p-5 rounded-2xl">
              <p className="text-xl font-bold text-emerald-400">Viễn tưởng</p>
              <p className="text-xs text-slate-400 mt-1">Thể loại yêu thích</p>
            </div>
          </div>
        </section>

        {/* Bar Chart */}
        <section className="bg-card rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6">Sách đã đọc / Tháng</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMonthlyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                <Tooltip cursor={{fill: '#3F3F46', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Export */}
        <section className="bg-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Xuất thư viện</h2>
          <p className="text-sm text-slate-400 mb-6">
            Xuất toàn bộ dữ liệu thư viện của bạn dưới dạng tệp Excel hoặc CSV để sao lưu hoặc chia sẻ.
          </p>
          <button 
            onClick={handleExport}
            className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-3 transition-colors"
          >
            <Download size={20} />
            Xuất ra Excel/CSV
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Mail size={18} />
              Gửi Email
            </button>
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Cloud size={18} />
              Lưu đám mây
            </button>
          </div>
        </section>
      </main>

      {/* Success Modal */}
      {showExportSuccess && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Xuất thành công</h3>
            <p className="text-slate-400 mb-6 text-sm">Thư viện của bạn đã được xuất thành công vào thiết bị.</p>
            <button 
              onClick={() => setShowExportSuccess(false)}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};