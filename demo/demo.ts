import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Mail, 
  LogIn, 
  ChevronRight, 
  CheckCircle2, 
  User, 
  Calendar, 
  ShieldCheck, 
  Heart, 
  Pizza, 
  ArrowLeft, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Edit2, 
  Save, 
  Check, 
  LogOut,
  Info
} from 'lucide-react';

// --- 設定・マスタデータ ---
const CATEGORIES = [
  { 
    id: 'sleep', 
    label: '睡眠', 
    description: 'ぐっすり眠れて、疲れは取れていますか？',
    options: [{ val: 2, icon: '💤', text: '良好' }, { val: 1, icon: '🥱', text: '不足' }] 
  },
  { 
    id: 'body', 
    label: '体の重さ', 
    description: '肩こりや目の疲れ、痛みはないですか？',
    options: [{ val: 2, icon: '🏃', text: '軽い' }, { val: 1, icon: '🤕', text: '重い' }] 
  },
  { 
    id: 'mood', 
    label: '今の気分', 
    description: '漠然とした不安やイライラはないですか？',
    options: [{ val: 3, icon: '😊', text: '最高' }, { val: 2, icon: '😐', text: '普通' }, { val: 1, icon: '🌀', text: '不調' }] 
  },
  { 
    id: 'fog', 
    label: 'プロジェクトの霧', 
    description: '次に何をすべきか、進め方は見えていますか？',
    options: [{ val: 3, icon: '☀️', text: '快晴' }, { val: 2, icon: '☁️', text: '薄曇' }, { val: 1, icon: '🌫️', text: '濃霧' }] 
  },
  { 
    id: 'energy', 
    label: 'バッテリー', 
    description: '仕事に取り組む気力は残っていますか？',
    options: [{ val: 2, icon: '🔋', text: '満タン' }, { val: 1, icon: '🪫', text: '空寸前' }] 
  },
  { 
    id: 'connection', 
    label: '繋がり', 
    description: '今日、誰かと雑談や相談をしましたか？',
    options: [{ val: 2, icon: '🗣️', text: '会話あり' }, { val: 1, icon: '😶', text: '孤立気味' }] 
  },
];

const GRATITUDE_MESSAGES = [
  "昨日の資料整理、助かりました！ありがとうございます。",
  "いつも素早いレスポンスに感謝しています！",
  "資料の図解がとても分かりやすかったです。",
  "難しい不具合の解決、お見事でした！心強いです。",
  "会議での的確なフォロー、ありがとうございました！",
  "いつも前向きな姿勢に、チームが活気づいています。"
];

export default function App() {
  const [view, setView] = useState('auth'); // auth, checkin, success, personal_db, admin_db, settings
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [user, setUser] = useState(null); 
  const [role, setRole] = useState('admin'); 
  const [answers, setAnswers] = useState({});
  const [personalHistory, setPersonalHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    setCurrentMessage(GRATITUDE_MESSAGES[Math.floor(Math.random() * GRATITUDE_MESSAGES.length)]);
    
    // 個人履歴のモック
    const mockHistory = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      mood: Math.floor(Math.random() * 3) + 1,
      fog: Math.floor(Math.random() * 3) + 1,
    }));
    setPersonalHistory(mockHistory);
  }, []);

  const handleSendMagicLink = (email) => {
    setIsEmailSent(true);
  };

  const handleLoginSuccess = (email) => {
    setUser({ email, isFirstTime: true, name: email.split('@')[0] });
    setView('checkin');
    setIsEmailSent(false);
  };

  const handleSelect = (catId, val) => {
    setAnswers(prev => ({ ...prev, [catId]: val }));
  };

  const submitReport = () => {
    const newEntry = {
      date: new Date().toLocaleDateString(),
      ...answers,
    };
    setPersonalHistory([newEntry, ...personalHistory]);
    setView('success');
  };

  const updateUserName = (newName) => {
    setUser(prev => ({ ...prev, name: newName }));
  };

  const isComplete = Object.keys(answers).length === CATEGORIES.length;

  // --- Components ---

  const AuthView = () => {
    const [email, setEmail] = useState('');
    
    if (isEmailSent) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">メールを送信しました</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            <span className="font-bold text-slate-800">{email}</span> 宛にログインリンクを送りました。
          </p>
          <div className="space-y-4 w-full max-w-xs">
            <button 
              onClick={() => handleLoginSuccess(email || 'demo@example.com')}
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              (デモ) ログインを完了する <LogIn className="w-5 h-5" />
            </button>
            <button onClick={() => setIsEmailSent(false)} className="text-slate-400 text-xs font-bold underline">
              メールを再入力する
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
            <Smile className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Team Condition</h1>
          <p className="text-slate-400 mt-2 font-medium">心とチームの健康診断</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="メールアドレスを入力" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
            />
          </div>
          <button 
            onClick={() => handleSendMagicLink(email)}
            disabled={!email.includes('@')}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-slate-200"
          >
            ログインリンクを送信 <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-2 px-4">
            <Info className="w-3 h-3 text-slate-400 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
              初回ログイン時にアカウントが自動作成されます。
            </p>
          </div>
        </div>
      </div>
    );
  };

  const CheckInView = () => (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="p-6 bg-white shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Check-in</h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
            {user?.name} さん
          </p>
        </div>
        <button onClick={() => setView('personal_db')} className="p-2 rounded-full bg-slate-100 relative">
          <User className="w-5 h-5 text-slate-600" />
          {role === 'admin' && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white"></div>}
        </button>
      </header>

      <main className="p-4 space-y-4">
        {user?.isFirstTime && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              初めまして！今の状態を直感で選んでください。
            </p>
          </div>
        )}
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="mb-4">
              <span className="font-black text-slate-700 text-sm">{cat.label}</span>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">{cat.description}</p>
            </div>
            <div className="flex gap-3">
              {cat.options.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSelect(cat.id, opt.val)}
                  className={`flex-1 py-4 rounded-2xl text-2xl transition-all active:scale-95 ${
                    answers[cat.id] === opt.val 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-slate-50 border border-slate-100 grayscale-[0.5]'
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <button
          onClick={submitReport}
          disabled={!isComplete}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
            isComplete ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-200 text-slate-400'
          }`}
        >
          {isComplete ? '送信して完了' : '項目を選んでください'}
        </button>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <Heart className="w-10 h-10 text-green-500 fill-current" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">記録完了！</h2>
      {user?.isFirstTime && <p className="text-xs text-green-600 font-bold mb-4 italic underline decoration-2">アカウントを作成しました ✅</p>}
      
      <div className="bg-indigo-50 p-6 rounded-3xl my-4 relative max-w-xs w-full border border-indigo-100/50">
        <p className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-widest text-left">Message from Team</p>
        <p className="italic text-indigo-700 text-sm leading-relaxed font-bold">
          「{currentMessage}」
        </p>
      </div>

      <div className="w-full max-w-xs mt-6 space-y-3">
        <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <Pizza className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Pizza Meter</span>
            </div>
            <span className="text-[10px] font-black text-orange-600">85%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-orange-100">
            <div className="h-full bg-orange-500 w-[85%] rounded-full"></div>
          </div>
        </div>

        <button 
          onClick={() => setView('personal_db')}
          className="w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-100 hover:bg-slate-100 transition-colors"
        >
          マイ・ダッシュボード <Calendar className="w-4 h-4" />
        </button>
        
        {role === 'admin' && (
          <button 
            onClick={() => setView('admin_db')}
            className="w-full py-4 bg-indigo-50 text-indigo-600 font-bold rounded-2xl flex items-center justify-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            管理者パネルを開く <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const PersonalDashboardView = () => (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="p-6 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('checkin')} className="p-2 rounded-full bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-black text-slate-800">My Dashboard</h1>
        </div>
        <button onClick={() => setView('settings')} className="p-2 rounded-full bg-slate-100">
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      <main className="p-4 space-y-6 pb-12">
        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 font-bold">
              <Smile className="w-5 h-5" />
              <span>AI Advice</span>
            </div>
            <p className="text-sm leading-relaxed font-bold">
              {user?.name}さん、最近「体の重さ」が続いていますね。今日は早めに切り上げて、ゆっくり湯船に浸かるのはいかがでしょうか？
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Heart className="w-24 h-24 text-white" />
          </div>
        </div>

        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Personal History</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {personalHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-xs font-black text-slate-800">{entry.date}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">気分: {entry.mood === 3 ? '😊' : entry.mood === 2 ? '😐' : '🌀'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-[10px] font-bold text-slate-400">
                    霧: {entry.fog === 1 ? '🌫️' : '☀️'}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${entry.mood === 3 ? 'bg-green-400' : entry.mood === 2 ? 'bg-amber-400' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {role === 'admin' && (
          <section className="pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 ml-2">Team Management</h3>
            <button 
              onClick={() => setView('admin_db')}
              className="w-full bg-white border border-indigo-100 p-5 rounded-3xl flex items-center justify-between shadow-sm active:bg-indigo-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800">Admin Dashboard</p>
                  <p className="text-[10px] text-slate-400 font-bold">チーム全体の状況を確認する</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          </section>
        )}
      </main>
    </div>
  );

  const AdminDashboardView = () => (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="p-6 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('personal_db')} className="p-2 rounded-full bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-6 h-6 text-indigo-500" /> Admin Console
          </h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* FOG ALERT */}
        <div className="bg-rose-50 border-2 border-rose-100 p-5 rounded-3xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-rose-500 font-black mb-2 uppercase text-xs tracking-tighter">
            <AlertTriangle className="w-4 h-4" />
            Critical Fog Alert
          </div>
          <p className="text-sm text-rose-800 leading-relaxed font-bold">
            エンジニアチームにて「プロジェクトの霧（濃霧）」が5日間継続中。早めのヒアリング推奨。
          </p>
        </div>

        {/* チーム統計 */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Team Energy</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-indigo-600">82%</span>
              <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Participation</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-blue-500">12/12</span>
              <Users className="w-5 h-5 text-blue-500 mb-1" />
            </div>
          </div>
        </section>

        {/* ピザ・バッジの進捗 */}
        <section className="bg-orange-50 border border-orange-100 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Pizza className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-800 text-[10px] uppercase tracking-widest">Pizza Meter</span>
            </div>
            <span className="text-xs font-black text-orange-600">READY SOON</span>
          </div>
          <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner border border-orange-100">
            <div className="h-full bg-orange-500 w-[90%] shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
          </div>
          <p className="text-[10px] text-orange-700/60 mt-3 font-bold italic">あと1人の入力で「ピザ・バッジ」が全員の画面に発行されます。</p>
        </section>

        {/* メンバーリスト */}
        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Member Status</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {[
              { name: '大倉', status: '😊', fog: '☀️' },
              { name: '尾上', status: '🌀', fog: '🌫️' },
              { name: '田中', status: '😐', fog: '☀️' },
              { name: '佐藤', status: '😊', fog: '☁️' }
            ].map((m, i) => (
              <div key={i} className="p-4 flex items-center justify-between border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-sm font-black border border-indigo-100">
                    {m.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block leading-none mb-1">{m.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">最終入力: 今日 9:30 AM</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className={`w-3 h-3 rounded-full ${m.status === '😊' ? 'bg-green-400' : m.status === '😐' ? 'bg-amber-400' : 'bg-rose-400'}`} title="気分"></div>
                  <div className={`w-3 h-3 rounded-full ${m.fog === '☀️' ? 'bg-green-400' : m.fog === '☁️' ? 'bg-amber-400' : 'bg-rose-400'}`} title="霧"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );

  const SettingsView = () => {
    const [editingName, setEditingName] = useState(user?.name || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveName = () => {
      updateUserName(editingName);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };

    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <header className="p-6 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setView('personal_db')} className="p-2 rounded-full bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-black text-slate-800">Settings</h1>
        </header>
        
        <main className="p-4 space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Edit2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  />
                </div>
                <button 
                  onClick={handleSaveName}
                  disabled={!editingName || editingName === user?.name}
                  className={`px-4 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                    isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none'
                  }`}
                >
                  {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                </button>
              </div>
              {isSaved && <p className="text-[10px] text-green-500 font-bold ml-1 animate-in fade-in">名前を更新しました ✅</p>}
            </div>

            <div className="pt-4 border-t border-slate-50">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
              <p className="mt-1 ml-1 text-sm font-bold text-slate-500">{user?.email}</p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm space-y-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">管理者権限 (Demo)</p>
                <p className="text-[10px] text-slate-400 font-bold italic">表示モードを切り替えて確認できます</p>
              </div>
              <button 
                onClick={() => setRole(role === 'admin' ? 'user' : 'admin')}
                className={`w-14 h-8 rounded-full relative transition-colors ${role === 'admin' ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${role === 'admin' ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-6 cursor-not-allowed opacity-50">
              <p className="font-bold text-slate-700">Push通知設定</p>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-6 text-rose-500 active:opacity-50">
              <p className="font-bold">ログアウト</p>
              <button onClick={() => { setUser(null); setView('auth'); setIsEmailSent(false); }}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </section>
          
          <p className="text-[10px] text-center text-slate-400 font-black tracking-widest uppercase opacity-40">TEAM CONDITION v1.1.5</p>
        </main>
      </div>
    );
  };

  return (
    <div className="font-sans antialiased select-none overflow-x-hidden bg-white min-h-screen">
      <style>{`
        @font-face {
          font-family: 'Inter';
          src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        }
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      {view === 'auth' && <AuthView />}
      {view === 'checkin' && <CheckInView />}
      {view === 'success' && <SuccessView />}
      {view === 'personal_db' && <PersonalDashboardView />}
      {view === 'admin_db' && <AdminDashboardView />}
      {view === 'settings' && <SettingsView />}
    </div>
  );
}