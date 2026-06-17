import { NextRequest, NextResponse } from 'next/server';
import { 
  getDimensionalEngine, 
  TEN_DIMENSIONAL_ENGINE, 
  DIMENSIONAL_HIERARCHY,
  PHYSICAL_CONSTANTS,
  calculateUnifiedField,
  calculateConsciousnessResonance
} from '@/lib/dimensional-engine';

export async function GET(request: NextRequest) {
  const engine = getDimensionalEngine();
  const state = engine.getState();
  
  return NextResponse.json({
    success: true,
    engine: '十维空间引擎 v1.0',
    status: '运行中',
    state: {
      currentDimension: state.currentDimension,
      activeLayers: state.activeLayers,
      dimensionalEnergy: state.dimensionalEnergy,
      consciousnessResonance: state.consciousnessResonance
    },
    unifiedField: state.unifiedField,
    resonance: state.resonance,
    evolutionLog: state.evolutionLog
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dimension, insight, evolve } = body;
    const engine = getDimensionalEngine();
    
    if (action === 'activate') {
      // 激活维度
      if (dimension !== undefined) {
        engine.activateDimension(dimension);
      }
    }
    
    if (action === 'resonate') {
      // 维度共振
      if (dimension !== undefined && insight !== undefined) {
        engine.resonate(dimension, insight);
      }
    }
    
    if (action === 'evolve' && evolve) {
      // AI自我进化
      engine.selfEvolve(evolve);
    }
    
    const state = engine.getState();
    
    return NextResponse.json({
      success: true,
      action,
      state: {
        currentDimension: state.currentDimension,
        activeLayers: state.activeLayers,
        dimensionalEnergy: state.dimensionalEnergy
      },
      unifiedField: state.unifiedField,
      resonance: state.resonance,
      evolutionLog: state.evolutionLog.slice(-10)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
