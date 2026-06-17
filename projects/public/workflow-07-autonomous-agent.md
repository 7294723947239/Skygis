# 工作流 07 - 空间智能体自主进化系统

## 需求
智能体不再是手动进化，自己采集物质总结，自己进化，自己迭代，功能栏也对应进行升级

## 架构设计

### 自主进化循环
```
感知(Sense) → 采集(Collect) → 分析(Analyze) → 总结(Summarize) → 进化(Evolve) → 迭代(Iterate)
     ↑                                                                    |
     └────────────────────────────────────────────────────────────────────┘
```

### 五大自主能力
1. **自动感知** - 每3秒扫描当前视图/聚焦天体/探针检测，无需用户操作
2. **自动采集** - 从3D场景物质数据自动收集，构建物质库
3. **自动总结** - 每次采集后生成发现报告(类型/置信度/关联物质)
4. **自动进化** - 根据发现数/物质数自动升级(5级: 初始探测器→全知观测者)
5. **自主迭代** - 发现间自动关联进化(新发现验证/推翻/扩展旧发现)

### 数据结构
- **Discovery**: id/timestamp/type/title/summary/details/relatedSubstances/confidence/evolved
- **KnowledgeNode**: id/label/type(body|material|phenomenon|region)/connections/data
- **AgentLevel**: level(0-5)/title/discoveries/substances/color
- **自主行为日志**: action/target/result/timestamp

### 进化等级
| 等级 | 称号 | 发现数 | 物质数 |
|------|------|--------|--------|
| 0 | 初始探测器 | 0 | 0 |
| 1 | 初级勘探者 | 5 | 10 |
| 2 | 空间分析师 | 15 | 50 |
| 3 | 星际科学家 | 30 | 100 |
| 4 | 宇宙学者 | 60 | 200 |
| 5 | 全知观测者 | 100 | 324 |

### 四个Tab页
- **自主模式(auto)**: 感知状态+发现流+物质图谱+进化进度+行为日志+知识图谱
- **智能问答(qa)**: LLM问答(保持原有)
- **NEO风险(neo)**: 近地小行星风险评估(保持原有)
- **着陆选址(landing)**: 行星着陆点分析(保持原有)

## 执行步骤

- [x] 重写spatial-agent-panel.tsx为自主智能体
- [x] 添加probeDetection完整类型传递(globe-map→agent-panel)
- [x] 修复category比较(中文→英文枚举)
- [x] 修复probeDetection.materials类型(string[]→object[])
- [x] TypeScript编译通过
- [x] API冒烟测试通过

## 文件变更
- `src/components/gis/spatial-agent-panel.tsx` - 全面重写
- `src/components/gis/globe-map.tsx` - 传递currentView+probeDetection给智能体
