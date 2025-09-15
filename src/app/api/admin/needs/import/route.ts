import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Read CSV content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have header and at least one data row' },
        { status: 400 }
      );
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    const requiredColumns = ['title', 'summary'];
    
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        return NextResponse.json(
          { error: `Missing required column: ${col}` },
          { status: 400 }
        );
      }
    }

    const supabase = supabaseServer();
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];
    const createdIds: string[] = [];

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',').map(v => v.trim());
      
      if (values.length !== header.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        skipped++;
        continue;
      }

      const row: Record<string, string> = {};
      header.forEach((col, index) => {
        row[col] = values[index];
      });

      // Validate required fields
      if (!row.title || !row.summary) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        skipped++;
        continue;
      }

      // Prepare need data
      const needData: any = {
        title: row.title,
        summary: row.summary,
        body: row.body || row.summary,
        tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
        area: row.location || '全国対応',
        status: row.status || 'draft'
      };

      // Parse price if provided
      if (row.price) {
        const price = parseInt(row.price);
        if (!isNaN(price)) {
          needData.price_amount = price;
        }
      }

      // Parse deadline if provided
      if (row.deadline) {
        const deadline = new Date(row.deadline);
        if (!isNaN(deadline.getTime())) {
          needData.deadline = deadline.toISOString();
        }
      }

      try {
        const { data: need, error } = await supabase
          .from('needs')
          .insert(needData)
          .select('id')
          .single();

        if (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
          skipped++;
        } else {
          createdIds.push(need.id);
          inserted++;
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: Insert failed`);
        skipped++;
      }
    }

    return NextResponse.json({
      inserted,
      skipped,
      errors,
      createdIds
    });

  } catch (error) {
    console.error('[import] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
