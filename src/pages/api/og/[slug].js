import { ImageResponse } from '@vercel/og';
import { html } from 'satori-html';

export const prerender = false;

export async function GET({ params }) {
  const { slug } = params;
  
  const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

  let champion = 'Copa 2026';
  let userName = 'Um fã';
  let runnerUp = '';
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/shared_predictions?slug=eq.${slug}&select=*,leads(nome)&limit=1`,
        { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const prediction = data[0];
          champion = prediction.simulation_data?.champion || champion;
          runnerUp = prediction.simulation_data?.runnerUp || '';
          userName = prediction.leads?.nome || userName;
        }
      }
    } catch (e) {
      // Ignorar erro e renderizar versão padrão
    }
  }

  const markup = html`
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #060913; color: white; padding: 60px; font-family: sans-serif; justify-content: space-between;">
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 40px; font-weight: bold; color: #00ff87;">Simulador Copa 2026</div>
        <div style="font-size: 35px; color: #60a5fa; background: rgba(96, 165, 250, 0.15); padding: 10px 25px; border-radius: 50px;">Palpite de ${userName}</div>
      </div>
      
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background-color: rgba(255, 215, 0, 0.1); border: 4px solid rgba(255, 215, 0, 0.3); border-radius: 30px; padding: 60px; margin-top: 40px; margin-bottom: 40px;">
        <div style="font-size: 35px; color: #ffd700; margin-bottom: 15px; letter-spacing: 2px;">CAMPEÃO MUNDIAL</div>
        <div style="font-size: 110px; font-weight: 900; color: #ffd700; text-transform: uppercase;">${champion}</div>
        ${runnerUp ? `<div style="font-size: 35px; margin-top: 20px; color: #e2e8f0;">Vice: ${runnerUp}</div>` : ''}
      </div>

      <div style="display: flex; justify-content: center; font-size: 30px; color: #a0aec0;">
        Acesse o link para ver o mata-mata completo!
      </div>
    </div>
  `;

  return new ImageResponse(markup, {
    width: 1200,
    height: 630,
  });
}
