import type { UserConfigExport } from '@tarojs/cli';
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {
    devServer: {
      open: false,
      port: 10086,
    },
    webpackChain(chain) {
      chain.optimization.minimize(false);
    },
  },
} satisfies UserConfigExport<'webpack5'>;
