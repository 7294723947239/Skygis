# SkyGIS 工作流03 - 所有星系3D模型渲染

## 背景
用户要求"类似太阳系那样，添加所有星系" — 之前星系只是小圆点，不像太阳系行星那样有3D模型

## 方案：按星系类型创建不同3D形状+程序化纹理

### 星系3D形状分类

| 类型 | 3D形状 | 尺寸缩放 | 纹理风格 |
|------|--------|----------|----------|
| spiral (旋涡) | CylinderGeometry扁平盘 | 1.5 | 旋臂纹理(2-4臂) |
| barred_spiral (棒旋) | CylinderGeometry扁平盘 | 1.5 | 棒+2臂纹理 |
| elliptical (椭圆) | SphereGeometry球体 | 2.0 | 中心渐亮纹理 |
| irregular (不规则) | SphereGeometry球体 | 1.0 | 斑驳光团纹理 |
| starburst (星暴) | CylinderGeometry盘 | 1.5 | 明亮核心+外溢 |
| ring (环状) | CylinderGeometry盘 | 1.5 | 环状结构纹理 |
| interacting (交互) | CylinderGeometry盘 | 2.0 | 双核+潮汐尾 |
| seyfert (塞弗特) | CylinderGeometry盘 | 1.5 | 亮核+微弱喷流 |
| dwarf (矮星系) | SphereGeometry小球 | 1.0 | 弥散光团 |
| lenticular (透镜) | CylinderGeometry极扁盘 | 1.5 | 盘状无臂纹理 |
| compact (致密) | SphereGeometry小球 | 0.8 | 明亮致密 |
| blazar (耀变体) | SphereGeometry小球 | 1.0 | 极亮核心+喷流 |

### 程序化纹理生成器

**createGalaxyTexture(type)** - canvas 128×128:
- spiral: 黄色核心 + Math.sin(θ×2) 2臂 + 散布星点
- barred_spiral: 黄色核心 + 水平棒 + Math.sin(θ×2) 2臂
- elliptical: 径向渐变 中心亮→边缘暗
- irregular: 随机Math.random() > 0.6光斑
- starburst: 亮核心+6个外溢弧
- ring: 中心暗+明亮环+微弱外晕
- interacting: 双核+弧形潮汐尾
- seyfert: 核心3倍亮+两个暗喷流
- 其他类型各有独特纹理

**createNebulaTexture(type)** - canvas 64×64:
- emission: 红色云团
- reflection: 蓝色弥漫
- planetary: 绿色环状
- snr(超新星遗迹): 橙色丝状
- dark: 暗紫色
- hii: 青色弥漫
- molecular: 暗红致密

### 天体渲染改进
- 所有119个天体都有标签(不再限制为20个)
- 星系随机倾斜角度(rotation.x/z = Math.random)
- 标签颜色: `'#' + vis.color.toString(16).padStart(6,'0')`

### 动画
- 星系自动旋转(autoRotate): `child.rotation.y += 0.002 * (i%2===0 ? 1 : -1)`

## 执行步骤
- [x] Step 1: 编写createGalaxyTexture()12种星系纹理生成器
- [x] Step 2: 编写createNebulaTexture()7种星云纹理生成器
- [x] Step 3: 替换ALL_COSMIC_OBJECTS.forEach渲染为3D模型
- [x] Step 4: 按type分配不同3D形状(Cylinder/Sphere)
- [x] Step 5: 所有119个天体添加标签
- [x] Step 6: 添加autoRotate自转动画
- [x] Step 7: 修复color类型推断问题(string|number兼容)
- [x] Step 8: 修复nameCn→name字段兼容
- [x] Step 9: TypeScript验证通过

## 结果
- 119个天体全部有3D模型(之前只是小圆点)
- 50个星系各有独特形状和纹理
- 20个星云半透明发光球体
- 6个超星系团线框
- 5个类星体明亮点
