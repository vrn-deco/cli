/*
 * @Author: Cphayim
 * @Date: 2020-09-12 23:24:22
 * @LastEditTime: 2020-10-03 02:55:00
 * @Description:
 */
import axios, { AxiosRequestConfig } from 'axios'

const DEFAULT_OPTIONS: AxiosRequestConfig = {
  timeout: 10000,
}

export const fetch = axios.create(DEFAULT_OPTIONS)
