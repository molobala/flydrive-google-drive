/**
 * flydrive-google-drive
 * Author : Doumbia Mahamadou <doumbiamahamadou.ensate@gmail.com>
 * @license MIT
 * @copyright Doumbia Mahamadou <doumbiamahamadou.ensate@gmail.com>
 */

const test = require('japa')
const StorageManager = require('@slynova/flydrive')
const GoogleDriver = require('../..')
require('dotenv').load()
/* const config = {
  'driver': 'googledrive',
  'clientId': process.env.DRIVE_CLIENT_ID,
  'clientSecret': process.env.DRIVE_CLIENT_SECRET,
  'redirectUrl': process.env.DRIVE_REDIRECT_URL,
  'access_token': process.env.GD_ACCESS_TOKEN,
  'refresh_token': process.env.GD_REFRESH_TOKEN
} */

const config = require('../stubs/config').disks.googledrive

test.group('GoogleDrive Driver with storage', () => {
  test('should be able to register correctly Google Drive driver', (assert) => {
    const storageManager = new StorageManager({
      default: 'googledrive',
      disks: {
        googledrive: config
      }
    })
    storageManager.extend('googledrive', GoogleDriver)
    const gd = storageManager.disk().driver
    // console.log(gd)
    // assert.throw(gd, 'Driver google-drive is not supported')
    assert.instanceOf(gd, GoogleDriver)
  })
  test('should be able to call google drive driver method via storage manager', async (assert) => {
    const storageManager = new StorageManager({
      default: 'googledrive',
      disks: {
        googledrive: config
      }
    })
    storageManager.extend('googledrive', GoogleDriver)
    const storage = storageManager.disk()
    let file = await storage.put('storage-test.txt', 'From storage manager')
    assert.equal(file.name, 'storage-test.txt')
    file = await storage.move('storage-test.txt', 'storage-test-cp.txt')
    assert.equal(file.name, 'storage-test-cp.txt')
    const content = await storage.get('storage-test-cp.txt')
    assert.equal(content, 'From storage manager')
    const r = await storage.delete('storage-test-cp.txt')
    assert.isTrue(r)
  }).timeout(20 * 1000)
})
