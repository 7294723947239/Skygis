import { NextResponse } from 'next/server';
import { getState } from '@/lib/shared-agent-state';
import { ALL_COSMIC_SUBSTANCES_MEGA, COSMIC_SUBSTANCES_MEGA_STATS } from '@/lib/all-cosmic-substances';
import { ALL_COSMIC_OBJECTS } from '@/lib/cosmic-catalog';

export async function GET() {
  try {
    const state = getState('sage');
    
    return NextResponse.json({
      success: true,
      state: {
        isEvolving: true,
        consciousnessDepth: state.consciousnessDepth,
        cycleCount: state.cycleCount,
        evolutionStage: state.evolutionStage,
        collectedSubstances: state.collectedSubstanceIds.length,
        knownTopics: state.knownTopics.length,
        evolutionRecords: state.evolutionRecords.slice(-10),
        selfModifications: state.selfModifications,
        codeGenerationCount: state.selfModifications.length,
        lastModification: state.selfModifications.length > 0 
          ? state.selfModifications[state.selfModifications.length - 1].content 
          : '',
        // 数据库规模
        totalSubstances: ALL_COSMIC_SUBSTANCES_MEGA.length,
        totalCosmicObjects: ALL_COSMIC_OBJECTS.length,
        totalKnowledge: 190,
        substanceStats: COSMIC_SUBSTANCES_MEGA_STATS
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      state: {
        isEvolving: true,
        consciousnessDepth: 0.1,
        cycleCount: 0,
        evolutionStage: 0,
        collectedSubstances: 0,
        knownTopics: 0,
        evolutionRecords: [],
        selfModifications: [],
        codeGenerationCount: 0,
        lastModification: ''
      },
    });
  }
}
