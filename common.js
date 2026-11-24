import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
export const db=createClient('https://lejycjqmigukhdppbdbe.supabase.co','sb_publishable_uTkkThPaCAKf_bQJWF5pig_dWGvMwcZ');
export const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export let event;export async function load(){const {data,error}=await db.from('final_event').select('*').eq('id',1).single();if(error)throw error;event=data;return data}
const pw=()=>sessionStorage.getItem('final-admin-password')||'';
export async function readVotes(){const {data,error}=await db.rpc('final_admin_read_votes',{p_password:pw()});if(error)throw error;return data}
export async function save(p){const {data,error}=await db.rpc('final_admin_save',{p_password:pw(),p_version:event.version,p_patch:p});if(error)throw error;if(!data)throw Error('他の端末で更新されました。再読込してやり直してください');await load()}
export function watch(fn){let busy=false;const run=async()=>{if(busy)return;busy=true;try{await load();fn(event);$('status').textContent='接続中・自動更新'}catch(e){$('status').textContent='接続エラー：'+e.message}finally{busy=false}};db.channel('final-live').on('postgres_changes',{event:'*',schema:'public',table:'final_event'},run).subscribe();setInterval(run,5000);run()}
export function options(teams){return '<option value="">選択してください</option>'+teams.map(t=>`<option>${esc(t)}</option>`).join('')}
export function remaining(m){return m?.start?Math.max(0,Math.ceil((m.start+600000-Date.now())/1000)):600}
export function fmt(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`}
export async function login(){const p=$('password').value;const {data,error}=await db.rpc('final_password_check',{p_password:p});if(error)throw error;if(!data)throw Error('パスワードが違います');sessionStorage.setItem('final-admin-password',p);location.reload()}
export async function auth(){const p=pw();if(p){const {data,error}=await db.rpc('final_password_check',{p_password:p});if(!error&&data){$('panel').hidden=false;return true}}sessionStorage.removeItem('final-admin-password');$('login').hidden=false;return false}
export function safe(fn){return async(...a)=>{try{await fn(...a)}catch(e){alert(e.message)}}}
