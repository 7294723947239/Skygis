/**
 * SkyGIS 代码分析器
 * 智能体使用此模块分析和修复代码问题
 */
import * as fs from 'fs';
import * as path from 'path';

export interface CodeAnalysis {
  file: string;
  issues: CodeIssue[];
  suggestions: string[];
  fixable: boolean;
}

export interface CodeIssue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

// 关键文件路径
const KEY_FILES = {
  'globe-map.tsx': path.join(process.cwd(), 'src/components/gis/globe-map.tsx'),
  'evolve-route.ts': path.join(process.cwd(), 'src/app/api/agent/evolve/route.ts'),
  'agent-engine.ts': path.join(process.cwd(), 'src/lib/agent-evolution-engine.ts'),
  'self-heal.ts': path.join(process.cwd(), 'src/lib/self-heal-daemon.ts'),
};

// 分析单个文件
export function analyzeFile(filePath: string): CodeAnalysis | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues: CodeIssue[] = [];
    const suggestions: string[] = [];

    // 检查常见问题
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // 检查 console.log
      if (line.includes('console.log') && !line.includes('DEBUG')) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: '调试日志未移除',
          suggestion: '考虑移除或禁用生产环境的console.log'
        });
      }

      // 检查潜在的死循环
      if (line.includes('while(true)') || line.includes('while (true)')) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: '潜在的死循环',
          suggestion: '确保有退出条件'
        });
      }

      // 检查未使用的变量
      if (line.match(/^(\s*)const\s+\w+\s*=\s*[^;]+;?\s*$/)) {
        // 简单检查，实际需要更复杂的分析
      }
    });

    return {
      file: path.basename(filePath),
      issues,
      suggestions,
      fixable: issues.some(i => i.severity === 'error')
    };
  } catch (error) {
    return null;
  }
}

// 分析动画循环问题
export function analyzeAnimationLoop(): { status: string; issues: string[]; fix: string } {
  const globeMapPath = KEY_FILES['globe-map.tsx'];
  
  try {
    if (!fs.existsSync(globeMapPath)) {
      return {
        status: '文件不存在',
        issues: ['globe-map.tsx 文件未找到'],
        fix: '需要创建或恢复文件'
      };
    }

    const content = fs.readFileSync(globeMapPath, 'utf-8');
    const issues: string[] = [];
    let fix = '';

    // 检查关键代码段
    const hasAnimate = content.includes('const animate =');
    const hasOrbitGroup = content.includes('orbitGroup.rotation.y');
    const hasRequestAnimFrame = content.includes('requestAnimationFrame');
    const hasPlanetMeshRef = content.includes('planetMeshesRef');
    const hasOrbitGroupsRef = content.includes('planetOrbitGroupsRef');

    if (!hasAnimate) {
      issues.push('❌ 缺少 animate 函数定义');
      fix += '\n\n// 需要添加 animate 函数:\nconst animate = () => {\n  requestAnimationFrame(animate);\n  // 动画逻辑\n};\nanimate();';
    }

    if (!hasOrbitGroup) {
      issues.push('❌ 缺少轨道旋转代码');
      fix += '\n\n// 需要添加轨道旋转:\norbitGroup.rotation.y += speed * dt;';
    }

    if (!hasRequestAnimFrame) {
      issues.push('❌ 缺少 requestAnimationFrame 调用');
    }

    if (!hasPlanetMeshRef) {
      issues.push('⚠️ planetMeshesRef 未定义，可能影响行星自转');
    }

    if (!hasOrbitGroupsRef) {
      issues.push('⚠️ planetOrbitGroupsRef 未定义，可能影响行星公转');
    }

    // 检查速度计算
    const speedMatch = content.match(/const speed\s*=\s*([^;]+)/);
    if (speedMatch) {
      const speedValue = speedMatch[1];
      if (speedValue.includes('0')) {
        issues.push('⚠️ 速度计算可能为0');
      }
    }

    return {
      status: issues.length === 0 ? '✅ 正常' : '⚠️ 需要修复',
      issues,
      fix
    };
  } catch (error) {
    return {
      status: '❌ 分析失败',
      issues: [`错误: ${error}`],
      fix: ''
    };
  }
}

// 获取代码修复建议
export function getFixSuggestions(problem: string): string[] {
  const suggestions: string[] = [];
  
  if (problem.includes('公转') || problem.includes('不动') || problem.includes('转动')) {
    suggestions.push('1. 检查 animate 函数是否被调用');
    suggestions.push('2. 确认 planetOrbitGroupsRef 有数据');
    suggestions.push('3. 验证 dt 值 > 0');
    suggestions.push('4. 检查 orbitGroup.rotation.y 是否更新');
    suggestions.push('5. 确认 speed = 2 * Math.PI * 50 / Math.sqrt(distAu³) > 0');
  }
  
  if (problem.includes('自转')) {
    suggestions.push('1. 检查 planetMeshesRef 是否有行星数据');
    suggestions.push('2. 确认 mesh.rotation.y += rotationSpeed * dt');
    suggestions.push('3. 验证 rotationSpeed > 0');
  }
  
  if (problem.includes('卡') || problem.includes('死')) {
    suggestions.push('1. 检查是否有死循环');
    suggestions.push('2. 确认 useEffect 依赖数组正确');
    suggestions.push('3. 检查内存泄漏');
  }

  return suggestions;
}

// 生成分析报告
export function generateAnalysisReport(): string {
  const animationAnalysis = analyzeAnimationLoop();
  
  let report = `【SkyGIS 代码分析报告】
生成时间: ${new Date().toISOString()}

【动画循环分析】
状态: ${animationAnalysis.status}
`;

  if (animationAnalysis.issues.length > 0) {
    report += '\n发现的问题:\n';
    animationAnalysis.issues.forEach(issue => {
      report += `  ${issue}\n`;
    });
  }

  if (animationAnalysis.fix) {
    report += '\n修复建议:\n';
    report += animationAnalysis.fix + '\n';
  }

  report += '\n【关键文件状态】\n';
  Object.entries(KEY_FILES).forEach(([name, filePath]) => {
    const exists = fs.existsSync(filePath);
    report += `  ${name}: ${exists ? '✅ 存在' : '❌ 缺失'}\n`;
  });

  return report;
}
