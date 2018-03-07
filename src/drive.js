/**
 * flydrive-google-drive
 * Author : Doumbia Mahamadou <doumbiamahamadou.ensate@gmail.com>
 * @license MIT
 * @copyright Doumbia Mahamadou <doumbiamahamadou.ensate@gmail.com>
 */


const baseUrl = 'https://www.googleapis.com/drive/v3'
const uploadUrl = 'https://www.googleapis.com/upload/drive/v3'
const request = require('request')

function extend (a, b) {
  for (var x in b) a[x] = b[x]
  return a
}

module.exports = function (accessToken) {
  const defaults = {
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    qs: {}
  }

  function makeRequest (p) {
    let options = defaults
    options.qs = extend(options.qs, p.params)
    if (p.meta) {
      if (p.meta.media && p.meta.media) {
        options.multipart = [
          {
            'content-type': 'application/json',
            body: JSON.stringify(p.meta.resource)
          }
        ]
        if (p.meta.media.body) {
          options.multipart.push({
            'content-type': p.meta.media.mimeType,
            body: (p.meta.media.body)
          })
        }
      } else {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(p.meta.resource || p.meta)
      }
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = null
    }
    return request.defaults(options)
  }

  function extractParams (meta, params, cb) {
    if ((!cb) && (!params) && (typeof meta === 'function')) {
      return {meta: {}, params: {}, cb: meta}
    } else if ((!cb) && (typeof params === 'function')) {
      return {meta: meta, params: {}, cb: params}
    } else return {meta: meta, params: params, cb: cb}
  }

  const resources = {}

  resources.files = function (fileId) {
    return {
      list: function (params, cb) {
        let p = extractParams(undefined, params, cb)
        return makeRequest(p).get(baseUrl + '/files', p.cb)
      },
      create: function (meta, params, cb) {
        let p = extractParams(meta, params, cb)
        let req = makeRequest(p)
        return req.post(uploadUrl + '/files', p.cb)
      },
      get: function (params, encoding, cb) {
        if (typeof encoding === 'function') {
          cb = encoding
          encoding = undefined
        }
        let p = extractParams(undefined, params, cb)
        return makeRequest(p).get(baseUrl + '/files/' + fileId, {encoding}, p.cb)
      },
      patch: function (meta, params, cb) {
        let p = extractParams(meta, params, cb)
        return makeRequest(p).patch(baseUrl + '/files/' + fileId, p.cb)
      },
      update: function (meta, params, cb) {
        let p = extractParams(meta, params, cb)
        return makeRequest(p).patch(baseUrl + '/files/' + fileId, p.cb)
      },
      copy: function (meta, params, cb) {
        let p = extractParams(meta, params, cb)
        return makeRequest(p).post(baseUrl + '/files/' + fileId + '/copy', p.cb)
      },
      delete: function (cb) {
        let p = extractParams(undefined, undefined, cb)
        return makeRequest(p).del(baseUrl + '/files/' + fileId, p.cb)
      }

    }
  }

  return resources
}
