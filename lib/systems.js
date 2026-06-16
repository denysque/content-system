"use client";

import { supabase } from "./supabase";

const TABLE = "event_systems";

// Список сохранённых наборов текущего пользователя (без тяжёлого cards)
export async function listSystems() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Получить один набор целиком
export async function getSystem(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, idea, cards, created_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Сохранить новый набор
export async function saveSystem({ title, idea, cards, userId }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ title, idea, cards, user_id: userId })
    .select("id, title, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSystem(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
