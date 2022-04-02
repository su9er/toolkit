import { describe, expect, it } from 'vitest'
import type { APISchema, RequestOptions } from '../src'
import { schemaClient } from '../src'

interface testModel {
  startTime: number
  endTime: number
}

interface TestAPISchema extends APISchema {
  'getTest': {
    request: void
    response: testModel
  }
  'setTest': {
    request: Partial<testModel>
    response: void
  }
  'download': {
    request: {
      key: string
    }
    response: {
      downloadUrl: string
    }
  }
  'getRes': {
    request: void
    response: Promise<string>
  }
}

describe('schema api client with plugins and configure', async() => {
  it('should return a configurable apis list', async() => {
    const configure = {
      getTest: 'GET /api/gettest',
      setTest: 'POST /api/settest',
      download: {
        // 支持参数占位符
        path: '/api/download/:id',
        method: 'POST',
        // 特殊接口请求
        headers: { 'x-download': 'xxx' },
      } as RequestOptions,
      // 使用配置函数
      getRes: () => {
        // get cache data
        const res = JSON.parse(window.localStorage.getItem('cache') || 'null')
        return Promise.resolve(res)
      },
    }
    const apis = schemaClient<TestAPISchema>(configure)
    expect(apis).toMatchInlineSnapshot(`
      {
        "download": [Function],
        "getRes": [Function],
        "getTest": [Function],
        "setTest": [Function],
      }
    `)
  })
})
