import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosRequestHeaders, AxiosResponse } from 'axios'
import type { ConfigHandler, CreateRequestConfig, HeaderHandler, RequestErrorHandler, ResponseHandler } from './types'

// 创建请求客户端
export function createRequestClient(
  requestConfig: CreateRequestConfig = {},
): AxiosInstance {
  const client: AxiosInstance = axios.create({
    baseURL: requestConfig.baseURL,
    timeout: requestConfig.timeout ?? 10000,
    responseType: requestConfig.responseType ?? 'json',
    withCredentials: requestConfig.withCredentials,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      ...(requestConfig.headers ?? {}),
    },
    transformResponse: [
      (data) => {
        if (typeof data === 'string' && data.startsWith('{'))
          data = JSON.parse(data)

        return data
      },
    ],
  })

  // 添加插件
  let headerHandlers: Array<HeaderHandler> = []
  let configHandlers: Array<ConfigHandler> = []
  let responseHandlers: Array<ResponseHandler> = []
  let errorHandlers: Array<RequestErrorHandler> = []
  requestConfig?.plugins?.forEach((plugin) => {
    headerHandlers = [...(headerHandlers), ...(plugin.headerHandlers ?? [])]
    configHandlers = [...(configHandlers ?? []), ...(plugin.configHandlers ?? [])]
    responseHandlers = [...(responseHandlers ?? []), ...(plugin.responseHandlers ?? [])]
    errorHandlers = [...(errorHandlers ?? []), ...(plugin.errorHandlers ?? [])]
  })

  requestConfig.headerHandlers = [...headerHandlers, ...(requestConfig.headerHandlers ?? [])]
  requestConfig.configHandlers = [...configHandlers, ...(requestConfig.configHandlers ?? [])]
  requestConfig.responseHandlers = [...responseHandlers, ...(requestConfig.responseHandlers ?? [])]
  requestConfig.errorHandlers = [...errorHandlers, ...(requestConfig.errorHandlers ?? [])]

  client.interceptors.request.use((config) => {
    // 附加各业务请求头
    const headerHandlers = requestConfig.headerHandlers?.map((handler) => {
      return handler(config)
        .then((mixHeaders: AxiosRequestHeaders) => {
          Object.assign(config.headers, mixHeaders)
          return Promise.resolve(config)
        })
        .catch()
    }) ?? [Promise.resolve(config)]
    // 提供配置阶段的钩子
    const configHandlers = requestConfig?.configHandlers?.map((handler) => {
      return handler(config)
    }) ?? [Promise.resolve()]
    return Promise.all([...headerHandlers, ...configHandlers]).then(
      () => config,
      () => config,
    )
  })

  // 拦截请求
  client.interceptors.response.use(
    (res: AxiosResponse) => {
      // 提供响应阶段的钩子
      return (requestConfig.responseHandlers ?? []).reduce((prev, current) => {
        return prev.then(preRes => current(preRes))
      }, Promise.resolve(res))
    },
    (error: AxiosError) => {
      const mwa = (requestConfig.errorHandlers ?? []).reduce((prev, current) => {
        return prev.then(preError => current(preError))
      }, Promise.resolve(error))
      return mwa.then(err => Promise.reject(err), err => Promise.reject(err))
    },
  )

  return client
}
