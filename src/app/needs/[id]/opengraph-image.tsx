import { ImageResponse } from 'next/og';
import { getNeed } from '@/lib/admin/store';

export const runtime = 'edge';
export const alt = 'NeedPort - ニーズ詳細';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const need = await getNeed(params.id);
    
    if (!need || !need.isPublished) {
      return new ImageResponse(
        (
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              padding: '40px',
            }}
          >
            <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', textAlign: 'center' }}>
              NeedPort
            </h1>
            <p style={{ fontSize: '24px', margin: '0', textAlign: 'center' }}>
              ニーズが見つかりません
            </p>
          </div>
        ),
        size
      );
    }

    const title = need.title.length > 50 ? need.title.substring(0, 50) + '...' : need.title;
    const estimate = need.estimateYen ? `¥${need.estimateYen.toLocaleString()}` : '未定';

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            color: 'white',
            padding: '60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'white', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px'
            }}>
              <span style={{ fontSize: '32px', color: '#667eea' }}>🚀</span>
            </div>
            <h1 style={{ fontSize: '36px', margin: '0', fontWeight: 'bold' }}>
              NeedPort
            </h1>
          </div>
          
          <h2 style={{ 
            fontSize: '48px', 
            margin: '0 0 30px 0', 
            lineHeight: '1.2',
            maxWidth: '1000px'
          }}>
            {title}
          </h2>
          
          <div style={{ display: 'flex', gap: '40px', fontSize: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>💰</span>
              <span>予算: {estimate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>👥</span>
              <span>賛同: {need.supportsCount ?? 0}人</span>
            </div>
          </div>
          
          <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            right: '60px',
            fontSize: '20px',
            opacity: 0.8
          }}>
            needport.jp
          </div>
        </div>
      ),
      size
    );
  } catch (error) {
    console.error('Failed to generate OG image:', error);
    
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '40px',
          }}
        >
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', textAlign: 'center' }}>
            NeedPort
          </h1>
          <p style={{ fontSize: '24px', margin: '0', textAlign: 'center' }}>
            ニーズ詳細
          </p>
        </div>
      ),
      size
    );
  }
}
