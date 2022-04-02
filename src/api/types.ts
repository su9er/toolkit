/* eslint-disable no-unused-vars */
import type { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'

// 路径配置
export type RequestPath = string

// 选项配置
export interface RequestOptions {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE' | 'PATCH'
  headers?: AxiosRequestHeaders
}

/**
 * @key showErrorMsg 默认接口请求都会开启错误提示，如需要关闭，赋值false
 * @key showLoading 默认接口请求都不会开启加载动画，如需要开启，赋值true
 * @key loadingText
 */
export interface ExtInfo {
  /**
   * 是否开启错误提示，默认接口请求都会开启错误提示，如需要关闭，赋值false
   */
  showErrorMsg?: boolean
  /**
   * 是否开启加载动画，默认接口请求都不会开启加载动画，如需要开启，赋值true
   */
  showLoading?: boolean
  /**
   * 加载文案
   */
  loadingText?: string
}

// 自定义函数
export type RequestFunction<P = Record<string, any> | void, R = any> = (
  params?: P,
  options?: Record<string, any> & ExtInfo
) => Promise<R>

export type APIConfig = RequestPath | RequestOptions | RequestFunction
export type HeaderHandler = (config: AxiosRequestConfig) => Promise<AxiosRequestHeaders>
export type ConfigHandler = (config: AxiosRequestConfig) => Promise<void>
export type ResponseHandler = (res: AxiosResponse) => Promise<AxiosResponse>
export type RequestErrorHandler = (error: AxiosError) => Promise<AxiosError>
export type ClientPlugins = Array<{
  headerHandlers?: Array<HeaderHandler>
  configHandlers?: Array<ConfigHandler>
  responseHandlers?: Array<ResponseHandler>
  errorHandlers?: Array<RequestErrorHandler>
}>

export type APISchema = Record<
string,
{
  request: Record<string, any> | void
  response: Record<string, any> | any
}
>

export interface CreateRequestConfig extends AxiosRequestConfig {
  headerHandlers?: Array<HeaderHandler>
  configHandlers?: Array<ConfigHandler>
  responseHandlers?: Array<ResponseHandler>
  errorHandlers?: Array<RequestErrorHandler>
  plugins?: ClientPlugins
}

// 创建请求客户端的类型约束
export type SchemaClient<T extends APISchema> = {
  // [K in keyof T]: RequestFunction<T[K]['request'], AxiosResponse<T[K]['response']>>
  [K in keyof T]: RequestFunction<T[K]['request'], T[K]['response']>
}
