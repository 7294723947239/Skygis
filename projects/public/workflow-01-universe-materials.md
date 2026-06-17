# SkyGIS 工作流01 - 宇宙全量物质数据库构建

## 背景
用户要求"宇宙所有物质"，不只是太阳系的229种，要覆盖整个可观测宇宙的所有已知物质

## 问题
1. 初始只有 `solar-system-materials.ts` 的13个天体229种物质
2. `universe-materials.ts` 仅459种，且大量重复
3. `cosmic-taxonomy.ts` 有412种物质，但与solar-system-materials交叉重复347个formula
4. 去重后仅292种独特物质，远不够"宇宙所有物质"
5. `cosmic-taxonomy.ts` 有1个重复ID (`cosmic-rays` 出现两次)
6. `cosmic-catalog.ts` 有1个重复名称 (半人马座A / `ngc5128_alt`)

## 方案：创建全量物质去重数据库

### 数据源设计
创建 `src/lib/all-cosmic-substances.ts`，按5大分类去重存储：

1. **94种天然元素** (按原子序数H→Pu)
   - 每个元素含: formula/nameCn/englishName/atomicNumber/mass/state/cosmicAbundanceRank/existenceRegions/importance
   - 宇宙丰度排名前4: H(75%) → He(23%) → O(1%) → C(0.5%)

2. **15种关键同位素**
   - 氘(D)/氚(T)/He-3/C-14/O-18/Al-26/Fe-60/Ni-56/U-235/U-238/K-40/Th-232/Pu-239/N-15/Si-29
   - 每个含: formula/nameCn/halfLife/decayMode/significance

3. **120+星际分子**
   - 双原子(20+): H₂, CO, OH, CN, SO, SiO, CS, NO, NS, AlCl...
   - 三原子(20+): H₂O, HCN, NH₃, CO₂, CH₄, SO₂, H₂S, OCS...
   - 四原子(15+): NH₂CH, H₂CCO, CH₃, HNCO, HCOOH(甲酸)...
   - 复杂有机(25+): CH₃OH(甲醇), C₂H₅OH(乙醇), HCOOCH₃(甲酸甲酯), NH₂CH₂COOH(甘氨酸)...
   - 脉泽分子(10+): OH 1612MHz, H₂O 22GHz, SiO 43GHz, CH₃OH 6.7GHz...
   - 冰幔分子(10+): H₂O(冰), CO(冰), CO₂(冰), CH₃OH(冰), NH₃(冰)...

4. **60+矿物**
   - 硅酸盐(15+): 橄榄石(Mg₂SiO₄)/辉石(MgSiO₃)/长石/bridgmanite/顽火辉石...
   - 氧化物(10+): FeO/Fe₂O₃/TiO₂/Al₂O₃/SiO₂(石英)/Cr₂O₃...
   - 碳化物/氮化物(5+): SiC/TiC/Fe₃C/Si₃N₄/Cr₃C₂
   - 冰(5+): H₂O(冰Ih)/NH₃(冰)/CH₄(冰)/CO₂(冰)/CO(冰)
   - 水合物(5+): MgSO₄·7H₂O/Na₂SO₄·10H₂O/MgCl₂·6H₂O...
   - 高压矿物(8+): 超离子水/金属氢/过氧化铁/后钙钛矿...
   - 碳行星特有(5+): SiC/TiC/石墨/金刚石/Fe₃C

5. **35+奇异物质**
   - 暗物质候选(5): WIMP/轴子/中性微子/暗光子/引力微子
   - 暗能量(2): DE-Field/精质(Quintessence)
   - 简并态(4): 电子简并态/中子简并态/夸克简并态/超固态
   - 超流/超导(3): 超流He-4/超流He-3/超导金属氢
   - 反物质(5): 反氢/反氦/正电子/反质子/反中子
   - 理论粒子(6): 磁单极子/引力子/快子/宇宙弦/希格斯玻色子/胶球
   - 极端态(5): 夸克-胶子等离子态/玻色-爱因斯坦凝聚态/超离子水/奇异物质/光子凝聚态

### 去重策略
- 同一化学式(formula)只出现一次
- 跨文件重复(solar-system-materials vs cosmic-taxonomy)通过优先级解决: 元素>同位素>分子>矿物>奇异
- 内部重复(cosmic-taxonomy中H₂在太阳/红巨星/木星中各出现一次)保留在原文件中，all-cosmic-substances只取一个

### 集成点
1. **globe-map.tsx 搜索面板**: 物质搜索优先从去重数据库查找
2. **universe-materials-panel.tsx**: 新增"物质"视图模式(SubstanceDatabaseView)
3. **3D场景统计标签**: 更新实际物质数量

## 执行步骤
- [x] Step 1: 修复cosmic-catalog.ts半人马座A重复(删除ngc5128_alt)
- [x] Step 2: 修复cosmic-taxonomy.ts重复ID(cosmic-rays→cosmic-rays-particles)
- [x] Step 3: 创建all-cosmic-substances.ts(94元素+15同位素+120分子+60矿物+35奇异=324+)
- [x] Step 4: 更新globe-map.tsx搜索面板集成新数据库
- [x] Step 5: 更新universe-materials-panel.tsx新增物质视图
- [x] Step 6: 更新统计标签显示实际物质数量
- [x] Step 7: TypeScript验证全部通过

## 结果
- 去重后独特物质: 324+种(之前292种)
- 分类: 5大类(元素/同位素/分子/矿物/奇异)
- 每种物质含完整元数据(化学式/英文名/物态/丰度/存在区域)
