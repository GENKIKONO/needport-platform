import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: 'white',
          padding: '60px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#3b82f6',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '30px',
            }}
          >
            <span style={{ fontSize: '40px', fontWeight: 'bold' }}>N</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0 }}>NeedPort</h1>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              marginBottom: '30px',
              lineHeight: 1.2,
            }}
          >
            ニーズとオファーを
            <br />
            つなぐプラットフォーム
          </h2>
          
          <p
            style={{
              fontSize: '28px',
              color: '#9ca3af',
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            企業のニーズとベンダーのオファーを効率的にマッチングし、
            <br />
            最適なパートナーシップを実現します
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', gap: '60px', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#10b981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
              }}
            >
              <span style={{ fontSize: '24px' }}>📋</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 'medium', margin: 0 }}>ニーズ管理</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f59e0b',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
              }}
            >
              <span style={{ fontSize: '24px' }}>💼</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 'medium', margin: 0 }}>オファー比較</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#ef4444',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
              }}
            >
              <span style={{ fontSize: '24px' }}>🤝</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 'medium', margin: 0 }}>マッチング</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <p style={{ fontSize: '20px', color: '#9ca3af', margin: 0 }}>
            needport.jp
          </p>
          <p style={{ fontSize: '20px', color: '#9ca3af', margin: 0 }}>
            {new Date().toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
