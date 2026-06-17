import { NextRequest, NextResponse } from 'next/server';
import COSMIC_FORMULAS from '@/lib/cosmic-formulas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let formulas = [...COSMIC_FORMULAS.formulas];

  // Filter by category
  if (category) {
    formulas = formulas.filter(f => 
      f.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Search formulas
  if (search) {
    const term = search.toLowerCase();
    formulas = formulas.filter(f => 
      f.name.toLowerCase().includes(term) ||
      f.formula.toLowerCase().includes(term) ||
      f.description.toLowerCase().includes(term)
    );
  }

  return NextResponse.json({
    title: COSMIC_FORMULAS.title,
    version: COSMIC_FORMULAS.version,
    sources: COSMIC_FORMULAS.sources,
    count: formulas.length,
    formulas: formulas
  });
}
