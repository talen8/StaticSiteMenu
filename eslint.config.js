// https://eslint.nodejs.cn/docs/latest/use/configure/configuration-files

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import pluginJs from '@eslint/js' // JavaScript 规则
import configPrettier from 'eslint-config-prettier' // 禁用与 Prettier 冲突的规则
import pluginImport from 'eslint-plugin-import' // Import 规则
import pluginPrettier from 'eslint-plugin-prettier' // 运行 Prettier 规则
import pluginVue from 'eslint-plugin-vue' // Vue 规则
import globals from 'globals'
import parserVue from 'vue-eslint-parser' // Vue 解析器

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('eslint').Linter.Config[]} */
export default [
  // 指定检查文件和忽略文件
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    ignores: ['node_modules', 'dist', 'public', 'src/assets']
  },
  // 全局配置
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      prettier: pluginPrettier,
      import: pluginImport
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', resolve(__dirname, './src')]],
          extensions: ['.js', '.jsx', '.vue', '.json']
        }
      }
    },
    rules: {
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^[A-Z0-9_]+$',
          ignoreRestSiblings: true
        }
      ],
      // Import 插件规则
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': ['error', { ignore: ['^@/'] }], // 暂时忽略 @ 开头的导入
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error'
    }
  },
  // JavaScript 配置
  pluginJs.configs.recommended,

  // Vue 配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        sourceType: 'module'
      }
    },
    plugins: { vue: pluginVue },
    processor: pluginVue.processors['.vue'],
    rules: {
      ...pluginVue.configs.recommended.rules,
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off'
    }
  }
]
