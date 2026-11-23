import { createClient } from '@supabase/supabase-js';
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isCloudConfigured = () => Boolean(url && key);
const client = isCloudConfigured() ? createClient(url, key, { auth: { persistSession: false } }) : null;
const STATE_ID = 'main';
export async function getSharedDB(){
  if(!client) return null;
  const {data,error}=await client.from('app_state').select('data').eq('id',STATE_ID).maybeSingle();
  if(error) throw error;
  return data?.data || null;
}
export async function saveSharedDB(db){
  if(!client) throw new Error('Supabase is not configured');
  const {error}=await client.from('app_state').upsert({id:STATE_ID,data:db,updated_at:new Date().toISOString()});
  if(error) throw error;
}
export function subscribeSharedDB(callback){
  if(!client) return ()=>{};
  const channel=client.channel('3idiots-shared-state').on('postgres_changes',{event:'*',schema:'public',table:'app_state',filter:`id=eq.${STATE_ID}`},payload=>{
    const remote=payload.new?.data;
    if(remote) callback(remote);
  }).subscribe();
  // Realtime may not be enabled on the table; poll as a fallback for cross-device updates.
  let last='';
  const poll=async()=>{try{const remote=await getSharedDB();if(remote){const snap=JSON.stringify(remote);if(snap!==last){last=snap;callback(remote);}}}catch(e){console.warn('Shared DB poll failed',e)}};
  poll();
  const timer=setInterval(poll,5000);
  return ()=>{clearInterval(timer);client.removeChannel(channel)};
}
