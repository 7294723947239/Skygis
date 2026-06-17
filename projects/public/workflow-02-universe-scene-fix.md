# SkyGIS 工作流02 - 宇宙3D视图渲染修复

## 背景
用户反馈"所有3d模型呈现出乱七八糟"

## 问题(截图分析)
1. **方块点** - PointsMaterial默认渲染方形，没有圆形纹理
2. **星云点过大** - size 3.0-5.0造成巨大重叠半透明块
3. **120个天体全有标签+光晕** - 文字和mesh严重遮挡
4. **50000背景星系点** - 数量过多导致密集白色区域
5. **透明物体穿插** - 没有depthWrite:false和AdditiveBlending
6. **无LOD** - 所有物体无论距离远近同样渲染

## 修复方案

### 1. 创建圆形粒子纹理
```typescript
const circleCanvas = document.createElement('canvas');
circleCanvas.width = 64; circleCanvas.height = 64;
const ctx = circleCanvas.getContext('2d')!;
const grad = ctx.createRadialGradient(32,32,0,32,32,32);
grad.addColorStop(0, 'rgba(255,255,255,1)');
grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
grad.addColorStop(1, 'rgba(255,255,255,0)');
// → circleTexture = new CanvasTexture(circleCanvas)
```

### 2. 参数调整对照表

| 参数 | 修复前 | 修复后 | 变化 |
|------|--------|--------|------|
| 背景星系数量 | 50000 | 15000 | -70% |
| 背景星系size | 0.6 | 0.4 | -33% |
| 星云size(银河系内) | 3.0 | 0.6 | -80% |
| 星云size(沿纤维) | 5.0 | 0.8 | -84% |
| 星云数量(银河系) | 2000 | 1500 | -25% |
| 星云数量(沿纤维) | 1000 | 500 | -50% |
| 远景星场 | 15000 | 8000 | -47% |
| 恒星场 | 8000 | 6000 | -25% |
| 恒星size | 0.15 | 0.1 | -33% |
| 超星系团内点 | 300 | 80 | -73% |
| 超星系团wireframe opacity | 0.2 | 0.08 | -60% |
| 纤维线opacity | 0.12 | 0.08 | -33% |

### 3. 天体渲染优化
- 移除每个天体的光晕mesh(减少遮挡)
- 仅20个重要天体显示标签(之前120个全显示)
- 天体尺寸缩小50%(typeVisualReduced = typeVisual * 0.5)
- 宇宙空洞球缩小+opacity降低

### 4. 深度排序修复
- 所有PointsMaterial: `depthWrite: false`
- 星云使用: `AdditiveBlending`
- 背景: `transparent: true`

## 执行步骤
- [x] Step 1: 创建circleTexture圆形粒子纹理
- [x] Step 2: 所有PointsMaterial添加map:circleTexture+depthWrite:false+AdditiveBlending
- [x] Step 3: 大幅缩小星云/星系/恒星点尺寸
- [x] Step 4: 减少点数量(背景星系/星云/星场)
- [x] Step 5: 移除天体光晕mesh
- [x] Step 6: 限制标签显示(仅20个重要天体)
- [x] Step 7: TypeScript验证通过

## 结果
- 视觉从"乱七八糟的方块堆"变为清晰的宇宙场景
- 圆形粒子、合理密度、层次分明
