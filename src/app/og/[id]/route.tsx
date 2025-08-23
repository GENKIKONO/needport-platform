import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/lib/supabase/admin';

// export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    
    // Fetch need data (only public information for OG)
    const { data: need } = await supabase
      .from('needs')
      .select('id, title, summary, tags, area, adopted_offer_id, created_at')
      .eq('id', id)
      .single();

    if (!need) {
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
              padding: '40px',
            }}
          >
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>NeedPort</h1>
            <p style={{ fontSize: '24px', color: '#9ca3af' }}>ニーズが見つかりません</p>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
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
                width: '60px',
                height: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
              }}
            >
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>N</span>
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>NeedPort</h1>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {need.title}
            </h2>
            
            {need.summary && (
              <p
                style={{
                  fontSize: '24px',
                  color: '#9ca3af',
                  marginBottom: '30px',
                  lineHeight: 1.4,
                }}
              >
                {need.summary.length > 100 
                  ? need.summary.substring(0, 100) + '...'
                  : need.summary
                }
              </p>
            )}

            {/* Info */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
              {need.area && (
                <div>
                  <p style={{ fontSize: '18px', color: '#9ca3af', margin: 0 }}>エリア</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {need.area}
                  </p>
                </div>
              )}
              <div>
                <p style={{ fontSize: '18px', color: '#9ca3af', margin: 0 }}>投稿日</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {formatDate(need.created_at)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: need.adopted_offer_id ? '#10b981' : '#f59e0b',
                }}
              />
              <span style={{ fontSize: '20px', fontWeight: 'medium' }}>
                {need.adopted_offer_id ? '採用済み' : '募集中'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '18px', color: '#9ca3af', margin: 0 }}>
              needport.jp
            </p>
            <p style={{ fontSize: '18px', color: '#9ca3af', margin: 0 }}>
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
  } catch (error) {
    console.error('OG image generation error:', error);
    
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
            padding: '40px',
          }}
        >
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>NeedPort</h1>
          <p style={{ fontSize: '24px', color: '#9ca3af' }}>エラーが発生しました</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
