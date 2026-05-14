# 项目规则

## 项目简介
智能菜谱生成器 — 一个多端通用的小程序，帮助用户根据冰箱里的食材和家里的调料智能生成菜谱。

## 技术栈
- 框架: Uni-app (Vue 3 + TypeScript)
- 状态管理: Pinia
- 构建工具: Vite
- 数据存储: uni.storage (本地存储)

## 目录结构
```
src/
├── pages/
│   ├── index/            # 首页 - 冰箱概览
│   ├── ingredients/      # 食材管理
│   ├── seasonings/       # 调料管理
│   ├── generate/         # 生成菜谱
│   └── recipe-detail/    # 菜谱详情
├── components/           # 公共组件
├── stores/               # Pinia 状态管理
│   ├── ingredient.ts     # 食材状态
│   ├── seasoning.ts      # 调料状态
│   └── recipe.ts         # 菜谱状态
├── utils/
│   ├── storage.ts        # 存储工具
│   └── recipeEngine.ts   # 菜谱匹配引擎
├── data/
│   ├── types.ts          # 类型定义
│   └── recipes.ts        # 内置菜谱库
├── static/               # 静态资源
├── App.vue
├── main.ts
├── pages.json
├── manifest.json
└── uni.scss
```

## 运行命令
- `npm run dev` - 启动开发服务器
- `npm run dev:h5` - 启动 H5 模式
- `npm run dev:mp-weixin` - 启动微信小程序模式
- `npm run build:h5` - 构建 H5
- `npm run build:mp-weixin` - 构建微信小程序

## 数据流
1. 用户在食材/调料页面添加数据
2. 数据通过 Pinia store 自动持久化到本地存储
3. 生成菜谱时，recipeEngine 从 store 获取数据，与内置菜谱库匹配
4. 匹配结果按匹配度排序展示

## 菜谱匹配算法
- 必需食材匹配得2分，可选食材匹配得1分
- 计算总体匹配百分比
- 匹配度 >= 50% 的菜谱才会被推荐
- 按匹配度降序排列，取用户指定的数量

## 多端适配说明
- H5: 直接运行 `npm run dev:h5` 浏览器访问
- 微信小程序: 需在微信开发者工具中导入 dist/dev/mp-weixin
- App: 需使用 HBuilderX 打包