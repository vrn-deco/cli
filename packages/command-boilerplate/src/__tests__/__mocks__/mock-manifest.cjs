/*
 * @Author: Cphayim
 * @Date: 2022-03-05 00:49:12
 * @Description: main script of manifest-package for testing
 */
// manifest package is commonjs module
exports.getManifest = () => [
  {
    name: 'TypeScript',
    boilerplate: [
      {
        name: 'Vue3 Varlet H5plus',
        desc: '',
        package: '@vrn-deco/boilerplate-typescript-vue3-varlet-h5plus',
        version: '0.0.4',
        tags: ['app', 'vue3', 'varlet'],
        sort: 100,
      },
    ],
  },
  {
    name: 'JavaScript',
    boilerplate: [
      {
        name: 'Vue2 VantUI',
        desc: '',
        package: '@vrn-deco/boilerplate-javascript-vue2-vant',
        version: '0.0.4',
        tags: [],
        sort: 31,
      },
      {
        name: 'Vue2 VantUI H5Plus',
        desc: '',
        package: '@vrn-deco/boilerplate-javascript-vue2-vant-h5plus',
        version: '0.0.4',
        tags: [],
        sort: 32,
      },
    ],
  },
]

exports.getAPIManifest = () => [
  {
    name: 'TypeScript',
    boilerplate: [
      {
        name: 'Vue3 Varlet H5plus',
        desc: '',
        file: 'boilerplate-typescript-vue3-varlet-h5plus.tgz',
        version: '0.0.4',
        tags: ['app', 'vue3', 'varlet'],
        sort: 100,
      },
    ],
  },
  {
    name: 'JavaScript',
    boilerplate: [
      {
        name: 'Vue2 VantUI',
        desc: '',
        file: 'boilerplate-javascript-vue2-vant.tgz',
        version: '0.0.4',
        tags: [],
        sort: 31,
      },
      {
        name: 'Vue2 VantUI H5Plus',
        desc: '',
        file: 'boilerplate-javascript-vue2-vant-h5plus.tgz',
        version: '0.0.4',
        tags: [],
        sort: 32,
      },
    ],
  },
]
