import { defineConfig } from 'umi';

export default defineConfig({
  publicPath: '/static/',
  layout: {},
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/index' }],
  dynamicImport: {},
});
