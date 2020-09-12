/*
 * @Author: Cphayim
 * @Date: 2020-09-12 23:55:09
 * @LastEditTime: 2020-09-12 23:55:29
 * @Description: boilerplate
 */
export interface Category {
  title: string
  boilerplates: Boilerplate[]
}

export interface Boilerplate {
  title: string
  key: string
  tags: string[]
  version: string
  tgz: string
}
