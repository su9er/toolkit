import type { Method } from 'axios'
import { createRequestClient } from './client'
import type { APIConfig, APISchema, CreateRequestConfig, RequestFunction, RequestOptions, RequestPath, SchemaClient } from './types'

const MATCH_METHOD = /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|CONNECT|TRACE|PATCH)\s+/
const MATCH_PATH_PARAMS = /:(\w+)/g
const USE_DATA_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

export function schemaClient<T extends APISchema>(
  apiConfigs: {
    [k in keyof T]: APIConfig
  },
  config?: CreateRequestConfig,
): SchemaClient<T> {
  const client = createRequestClient(config)
  const hostApi: SchemaClient<T> = Object.create(null)
  for (const apiName in apiConfigs) {
    const apiConfig = apiConfigs[apiName]
    // 配置为一个函数
    if (typeof apiConfig === 'function') {
      hostApi[apiName] = apiConfig as RequestFunction
      continue
    }
    let apiOptions = {}
    let apiPath = apiConfig as RequestPath
    // 配置为一个对象
    if (typeof apiConfig === 'object') {
      const { path, ...rest } = apiConfig as RequestOptions
      apiPath = path
      apiOptions = rest
    }
    hostApi[apiName] = function(params, options) {
      const _params = { ...(params || {}) }
      // 匹配路径中请求方法，如：'POST /api/test'
      const [prefix, method] = apiPath.match(MATCH_METHOD) || ['GET ', 'GET']
      // 剔除掉 ”POST “ 前缀
      let url = apiPath.replace(prefix, '')
      // 匹配路径中的参数占位符， 如 '/api/:user_id/:res_id'
      const matchParams = apiPath.match(MATCH_PATH_PARAMS)
      if (matchParams) {
        matchParams.forEach((match) => {
          const key = match.replace(':', '')
          if (Reflect.has(_params, key)) {
            url = url.replace(match, Reflect.get(_params, key))
            Reflect.deleteProperty(_params, key)
          }
        })
      }
      const requestParams = USE_DATA_METHODS.includes(method)
        ? { data: _params }
        : { params: _params }
      return client.request({
        url,
        method: method.toLowerCase() as Method,
        ...requestParams,
        ...apiOptions,
        ...(options || {}),
      })
    }
  }
  return hostApi
}
