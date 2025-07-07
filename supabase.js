import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Telegram WebApp данные
export const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe?.user || {};

// ID и имя пользователя
export const id = user?.id || 'unknown_id';
export const name = user?.username || user?.first_name || 'Anonymous';

// Инициализация Supabase
const supabaseUrl = 'https://nmtotmsuclnowxhemibc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdG90bXN1Y2xub3d4aGVtaWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDM4NzMsImV4cCI6MjA2NzExOTg3M30._EEk-_GT62n8u9MkqTSiiYNWaAmQCV90n9w4QCL94fA'; // 🔴 твой ключ
export const supabase = createClient(supabaseUrl, supabaseKey);

// Сохраняем результат
export async function saveScore(score) {
  const { error } = await supabase
    .from('scores')
    .upsert({ user_id: id, name, score }, { onConflict: 'user_id' });

  if (error) console.error('Ошибка сохранения:', error);
}

// Загружаем таблицу лидеров
export async function loadLeaderboard() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Ошибка загрузки лидеров:', error);
    return [];
  }
  return data;
}

// Получаем место игрока
export async function getUserRank(score) {
  const { count, error } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .gt('score', score);

  if (error) {
    console.error('Ошибка получения ранга:', error);
    return null;
  }

  return count + 1;
}