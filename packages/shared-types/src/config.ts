/*
 * @Author: Cphayim
 * @Date: 2021-06-26 02:30:39
 * @Description: 脚手架配置项类型
 */

export type VRNConfig = {
  /**
   * npm 源
   */
  NPMRegistry: string
  /**
   * npm 客户端
   */
  NPMClient: 'npm' | 'yarn'
  /**
   * 模板库源
   */
  BoilerplateRegistry: string
  /**
   * 组件库源
   */
  ComponentRegistry: string
}
