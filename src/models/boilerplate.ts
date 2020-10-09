/*
 * @Author: Cphayim
 * @Date: 2020-09-12 23:55:09
 * @LastEditTime: 2020-10-03 01:59:53
 * @Description: boilerplate
 */

/**
 * 分类
 */
export interface Category {
  /**
   * 分类标题
   */
  title: string
  /**
   * 样板列表
   */
  boilerplates: Boilerplate[]
}

/**
 * 样板
 * @export
 * @interface Boilerplate
 */
export interface Boilerplate {
  /**
   * 样板标题
   */
  title: string
  /**
   * 唯一键
   */
  key: string
  /**
   * 标签列表
   */
  tags: string[]
  /**
   * 样板版本号
   */
  version: string
  /**
   * .tgz 压缩包名
   */
  tgz: string
}
