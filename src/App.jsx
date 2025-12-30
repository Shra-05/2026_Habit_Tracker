import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, Sparkles, LogOut, Users, Lock } from 'lucide-react';

const HabitTracker = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(0);
  const [habitList, setHabitList] = useState(['Reading', 'Coding']);
  const [newHabit, setNewHabit] = useState('');
  const [checkedDays, setCheckedDays] = useState({});
  const [celebration, setCelebration] = useState('');
  const [animatingCell, setAnimatingCell] = useState('');

  const quotes = [
    "Small steps every day lead to big changes! 🌟",
    "You're building your future, one habit at a time! 💪",
    "Consistency is your superpower! ⚡",
    "Every check mark is a win! 🎯",
    "You're doing amazing! Keep going! 🚀",
    "Progress, not perfection! ✨"
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const sessionToken = localStorage.getItem('sessionToken');
    if (savedUser && sessionToken) {
      setCurrentUser(savedUser);
      loadUserData(savedUser);
      setShowLogin(false);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (currentUser) {
      saveUserData();
    }
  }, [habitList, checkedDays, currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const saveUserData = () => {
    if (!currentUser) return;
    const userData = {
      habitList,
      checkedDays
    };
    localStorage.setItem(`habitData_${currentUser}`, JSON.stringify(userData));
  };

  const loadUserData = (user) => {
    const savedData = localStorage.getItem(`habitData_${user}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setHabitList(data.habitList || ['Reading', 'Coding']);
      setCheckedDays(data.checkedDays || {});
    } else {
      setHabitList(['Reading', 'Coding']);
      setCheckedDays({});
    }
  };

  const hashPassword = async (pwd) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleSignup = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    
    // Check if account already exists
    const existingAccounts = JSON.parse(localStorage.getItem('accounts') || '{}');
    if (existingAccounts[trimmedUsername]) {
      setError('Account already exists! Please login instead.');
      return;
    }

    // Create new account
    const hashedPassword = await hashPassword(password);
    existingAccounts[trimmedUsername] = {
      password: hashedPassword,
      displayName: username.trim(),
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('accounts', JSON.stringify(existingAccounts));
    
    // Auto login after signup
    const sessionToken = Math.random().toString(36).substring(7);
    localStorage.setItem('currentUser', trimmedUsername);
    localStorage.setItem('sessionToken', sessionToken);
    
    setCurrentUser(trimmedUsername);
    loadUserData(trimmedUsername);
    setShowLogin(false);
    setUsername('');
    setPassword('');
  };

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    const existingAccounts = JSON.parse(localStorage.getItem('accounts') || '{}');
    
    if (!existingAccounts[trimmedUsername]) {
      setError('Account not found! Please sign up first.');
      return;
    }

    const hashedPassword = await hashPassword(password);
    if (existingAccounts[trimmedUsername].password !== hashedPassword) {
      setError('Incorrect password!');
      return;
    }

    // Login successful
    const sessionToken = Math.random().toString(36).substring(7);
    localStorage.setItem('currentUser', trimmedUsername);
    localStorage.setItem('sessionToken', sessionToken);
    
    setCurrentUser(trimmedUsername);
    loadUserData(trimmedUsername);
    setShowLogin(false);
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionToken');
    setCurrentUser(null);
    setShowLogin(true);
    setHabitList(['Reading', 'Coding']);
    setCheckedDays({});
  };

  const getDaysInMonth = (month) => {
    return new Date(2026, month + 1, 0).getDate();
  };

  const toggleDay = (habit, day) => {
    const key = `${habit}-${currentMonth}-${day}`;
    const wasChecked = checkedDays[key];
    
    setCheckedDays(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    if (!wasChecked) {
      setAnimatingCell(key);
      setTimeout(() => setAnimatingCell(''), 600);

      const newTotal = getMonthTotal(habit) + 1;
      if (newTotal === 7) {
        setCelebration('🎉 Week streak! You\'re on fire!');
        setTimeout(() => setCelebration(''), 3000);
      } else if (newTotal === 30) {
        setCelebration('🏆 30 days! Legendary commitment!');
        setTimeout(() => setCelebration(''), 3000);
      } else if (newTotal % 10 === 0 && newTotal > 0) {
        setCelebration(`✨ ${newTotal} days! Amazing progress!`);
        setTimeout(() => setCelebration(''), 3000);
      }
    }
  };

  const addHabit = () => {
    if (newHabit.trim() && !habitList.includes(newHabit.trim())) {
      setHabitList([...habitList, newHabit.trim()]);
      setNewHabit('');
    }
  };

  const deleteHabit = (habit) => {
    setHabitList(habitList.filter(h => h !== habit));
  };

  const getStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    const currentDate = new Date(2026, currentMonth, Math.min(getDaysInMonth(currentMonth), today.getDate()));
    
    for (let i = currentDate.getDate(); i >= 1; i--) {
      const key = `${habit}-${currentMonth}-${i}`;
      if (checkedDays[key]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getMonthTotal = (habit) => {
    const days = getDaysInMonth(currentMonth);
    let total = 0;
    for (let i = 1; i <= days; i++) {
      if (checkedDays[`${habit}-${currentMonth}-${i}`]) {
        total++;
      }
    }
    return total;
  };

  const getBadges = (habit) => {
    const total = getMonthTotal(habit);
    const badges = [];
    if (total >= 7) badges.push({ emoji: '🔥', label: 'Week' });
    if (total >= 14) badges.push({ emoji: '⭐', label: '2 Weeks' });
    if (total >= 21) badges.push({ emoji: '💎', label: '3 Weeks' });
    if (total >= 30) badges.push({ emoji: '👑', label: 'Month' });
    return badges;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDisplayName = () => {
    if (!currentUser) return '';
    const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
    return accounts[currentUser]?.displayName || currentUser;
  };

  // Login/Signup Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
            </div>
            <p className="text-gray-600">
              {isSignup ? 'Create your account to start' : 'Welcome back! Login to continue'}
            </p>
          </div>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
            />
            
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
              />
            </div>
            
            <button
              onClick={isSignup ? handleSignup : handleLogin}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              {isSignup ? 'Create Account' : 'Login'}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Your data is saved securely on your device. Each person needs their own account!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Celebration Banner */}
        {celebration && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-50 font-medium">
            {celebration}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">2026 Habit Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {getDisplayName()}! 👋</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="italic">{currentQuote}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
              disabled={currentMonth === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-30 hover:bg-gray-100"
            >
              ←
            </button>
            <span className="text-lg font-medium text-gray-700 min-w-[60px] text-center">
              {months[currentMonth]} 2026
            </span>
            <button
              onClick={() => setCurrentMonth(Math.min(11, currentMonth + 1))}
              disabled={currentMonth === 11}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-30 hover:bg-gray-100"
            >
              →
            </button>
          </div>
        </div>

        {/* Add Habit */}
        <div className="bg-white border border-gray-200 rounded p-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              placeholder="Add new habit..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Tracker Table */}
        <div className="bg-white border border-gray-200 rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700 min-w-[140px]">Habit</th>
                {days.map(day => {
                  const date = new Date(2026, currentMonth, day);
                  const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
                  return (
                    <th key={day} className="px-2 py-3 text-center w-8">
                      <div className="text-xs text-gray-500 font-normal">{dayInitial}</div>
                      <div className="font-medium text-gray-600">{day}</div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-center font-medium text-gray-700 min-w-[80px]">
                  <Flame className="w-4 h-4 inline" />
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 min-w-[70px]">Total</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {habitList.map(habit => (
                <tr key={habit} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{habit}</td>
                  {days.map(day => {
                    const key = `${habit}-${currentMonth}-${day}`;
                    const isAnimating = animatingCell === key;
                    return (
                      <td key={day} className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checkedDays[key] || false}
                          onChange={() => toggleDay(habit, day)}
                          className={`w-4 h-4 cursor-pointer accent-gray-900 ${
                            isAnimating ? 'animate-ping' : ''
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {getStreak(habit)}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-700">
                    {getMonthTotal(habit)}/{daysInMonth}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteHabit(habit)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Progress Strips */}
        {habitList.length > 0 && (
          <div className="mt-4 space-y-2">
            {habitList.map(habit => {
              const badges = getBadges(habit);
              const total = getMonthTotal(habit);
              const percentage = Math.round((total / daysInMonth) * 100);
              
              return (
                <div key={habit} className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-800">{habit}</h3>
                      <div className="flex gap-1">
                        {badges.map((badge, i) => (
                          <span key={i} className="text-sm" title={badge.label}>
                            {badge.emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {getStreak(habit)} streak
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {total}/{daysInMonth} days
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Check off days to track progress. Earn badges at 7, 14, 21, and 30 days! 🎯
        </p>
      </div>
    </div>
  );
};

export default HabitTracker;
