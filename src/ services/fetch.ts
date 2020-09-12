/*
 * @Author: Cphayim
 * @Date: 2020-09-12 23:24:22
 * @LastEditTime: 2020-09-12 23:43:26
 * @Description:
 */
import axios, { AxiosRequestConfig } from 'axios'
import { VRN_CONFIG } from '@/config'

const DEFAULT_OPTIONS: AxiosRequestConfig = {
  baseURL: VRN_CONFIG.registry,
  timeout: 10000,
}

export const fetch = axios.create(DEFAULT_OPTIONS)
