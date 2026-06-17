import { NextRequest, NextResponse } from 'next/server';
import { queryKnowledgeBase } from '@/lib/local-knowledge-engine';

export async function POST(request: NextRequest) {
  try {
    const { type, query } = await request.json();

    if (type === 'qa') {
      // 始终使用本地知识引擎（零积分消耗）
      const result = queryKnowledgeBase(query || '');
      const answer = result.answer || '抱歉，我暂时无法回答这个问题。';
      const sources = result.sources?.join(', ') || '';
      const relatedTopics = result.relatedTopics?.join(', ') || '';
      const confidence = result.confidence || 0;

      let fullAnswer = answer;
      if (sources) {
        fullAnswer += `\n\n来源: ${sources}`;
      }
      if (relatedTopics) {
        fullAnswer += `\n\n相关话题: ${relatedTopics}`;
      }
      if (confidence < 0.3) {
        fullAnswer += '\n\n(置信度较低，建议进一步探索)';
      }

      return NextResponse.json({ answer: fullAnswer, confidence, sources: result.sources });
    }

    if (type === 'neo-risk') {
      // 近地天体风险评估 — 使用本地数据
      const neoData = [
        { name: '99942 Apophis', diameter: 370, probability: 0.000089, closestApproach: '2029-04-13', distanceAU: 0.000254, risk: '低' },
        { name: '101955 Bennu', diameter: 490, probability: 0.000037, closestApproach: '2060-09-23', distanceAU: 0.003, risk: '低' },
        { name: '29075 (1950 DA)', diameter: 1300, probability: 0.000012, closestApproach: '2032-03-02', distanceAU: 0.0042, risk: '极低' },
        { name: '4179 Toutatis', diameter: 4500, probability: 0, closestApproach: '2069-11-05', distanceAU: 0.0063, risk: '无' },
        { name: '4660 Nereus', diameter: 330, probability: 0, closestApproach: '2031-02-14', distanceAU: 0.0099, risk: '无' },
        { name: '2023 DW', diameter: 49, probability: 0.0015, closestApproach: '2046-02-14', distanceAU: 0.012, risk: '极低' },
      ];
      return NextResponse.json({ neoData });
    }

    if (type === 'landing') {
      // 着陆选址评估 — 使用本地数据
      const landingSites = [
        { name: 'Jezero Crater', body: 'Mars', lat: 18.4, lon: 77.5, elevation: -2500, safety: 0.85, scienceValue: 0.95, description: '古代三角洲，曾存在湖泊，富含黏土矿物' },
        { name: 'Gale Crater', body: 'Mars', lat: -4.5, lon: 137.4, elevation: -4500, safety: 0.9, scienceValue: 0.85, description: '层状沉积岩，记录火星气候演化历史' },
        { name: 'South Pole-Aitken', body: 'Moon', lat: -45, lon: 180, elevation: -8000, safety: 0.6, scienceValue: 0.98, description: '太阳系最大撞击盆地，可能暴露月幔物质' },
        { name: 'Shackleton Crater', body: 'Moon', lat: -89.7, lon: 0, elevation: 4000, safety: 0.8, scienceValue: 0.9, description: '永久阴影区，存在水冰资源' },
        { name: 'Europa Ridge', body: 'Europa', lat: 0, lon: 90, elevation: -100, safety: 0.3, scienceValue: 0.99, description: '冰壳裂缝，可能通向地下海洋' },
        { name: 'Titan Lakes', body: 'Titan', lat: 79, lon: 125, elevation: 0, safety: 0.7, scienceValue: 0.92, description: '甲烷/乙烷湖泊，独特有机化学环境' },
      ];
      const filtered = (query && typeof query === 'string')
        ? landingSites.filter(s => s.body.toLowerCase() === query.toLowerCase() || s.name.toLowerCase().includes(query.toLowerCase()))
        : landingSites;
      return NextResponse.json({ landingSites: filtered });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
