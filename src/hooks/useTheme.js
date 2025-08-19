import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Cek tema dari localStorage atau default ke 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Efek ini berjalan setiap kali 'theme' berubah
  useEffect(() => {
    const root = window.document.documentElement; // Ambil elemen <html>
    
    // Hapus kelas tema sebelumnya
    const prevTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(prevTheme);

    // Tambahkan kelas tema saat ini
    root.classList.add(theme);

    // Simpan pilihan tema ke localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fungsi untuk mengganti tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};