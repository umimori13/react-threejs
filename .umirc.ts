import { defineConfig } from 'umi'

export default defineConfig({
    publicPath: '/static/',
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        { path: '/', component: '@/pages/index', name: '主页', icon: 'Smile' },
        {
            path: '/func',
            name: '特效页',
            icon: 'Slack',
            routes: [
                {
                    path: '/func/draggable',
                    icon: 'BuildOutlined',
                    name: '点云',
                    component: '@/pages/effectsPage/index',
                },
            ],
        },
        { component: '@/pages/404' },
    ],
    //   routes: [{ path: '/', component: '@/pages/index.js' }],
    dynamicImport: {},
    chainWebpack(memo, { env, webpack, createCSSRule }) {
        // 设置 alias
        memo.module
            .rule('raw')
            .test(/\.(vs|fs|glsl|vert|frag)$/)
            .use('raw')
            .loader('raw-loader')
    },
})
