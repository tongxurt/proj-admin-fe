import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/am/v1/items',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/am/v1/items',
    method: 'post',
    data
  })
}
