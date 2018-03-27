/**
 * flydrive-google-drive
 * Author : Doumbia Mahamadou <doumbiamahamadou.ensate@gmail.com>
 * @license MIT
 * @copyright Doumbia Mahamadou <doumbiamahamadou.ensate@gmail.com>
 */

const test = require('japa')
const path = require('path')
const fs = require('fs-extra')
const GoogleDriver = require('../..')

const readStream = function (stream) {
  return new Promise((resolve, reject) => {
    let body = ''

    stream
      .on('data', (chunk) => (body += chunk))
      .on('end', () => resolve(body))
      .on('error', reject)
  })
}
const config = require('../stubs/config').disks.googledrive
const token = {
  'access_token': config.access_token,
  'refresh_token': config.refresh_token
}
test.group('GoogleDrive Driver', () => {
  test('resolve id with quote character', async(assert)=>{
    const driveDriver = new GoogleDriver(config)
    const exists = await driveDriver.with(token).exists("dossier d\'analyse et conception");
    assert.isNotNull(exists)
  });
  test('return null when file doesn\'t exists', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    const exists = await driveDriver.with(token).exists('some-file.jpg')
    assert.isNull(exists)
  }).timeout(0)
  test('create a folder', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    const folder = await driveDriver.put('folder', null, {
      metadata: {
        mimeType: 'application/vnd.google-apps.folder'
      }
    })
    assert.isNotNull(folder)
    assert.equal(folder.name, 'folder')
  })
  test('create a new file', async (assert) => {
    const driveDriver = new GoogleDriver(config)

    const file = await driveDriver.with(token).put('folder/some-file.txt', 'This is the text file', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    assert.isNotNull(file.id)
    const exists = await driveDriver.with(token).exists('', {fileId: file.id})
    assert.equal(file.name, `some-file.txt`)
    assert.isNotNull(exists)
  }).timeout(0)

  test('create a new file from buffer', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    const file = await driveDriver.with(token).put('folder/buffer-file.txt', Buffer.from('This is the text file', 'utf-8'), {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const exists = await driveDriver.with(token).exists('folder/buffer-file.txt')
    assert.isNotNull(file)
    assert.equal(file.name, `buffer-file.txt`)
    assert.isNotNull(exists)
  }).timeout(0)

  test('create a new file from stream', async (assert) => {
    const dummyFile = path.join(__dirname, 'stream-file.txt')
    await fs.outputFile(dummyFile, 'Some dummy content')

    const driveDriver = new GoogleDriver(config)
    const readStream = fs.createReadStream(dummyFile)

    const file = await driveDriver.with(token).put('folder/stream-file.txt', readStream, {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const exists = await driveDriver.with(token).exists('folder/stream-file.txt')
    await fs.remove(dummyFile)
    assert.isNotNull(file.id)
    assert.equal(file.name, `stream-file.txt`)
    assert.isNotNull(exists)
  }).timeout(0)

  test('delete existing file', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    await driveDriver.with(token).put('folder/dummy-file.txt', 'Hello', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const ret = await driveDriver.with(token).delete('folder/dummy-file.txt')
    assert.isTrue(ret)
  }).timeout(0)

  test('get file contents', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    await driveDriver.with(token).put('folder/dummy-file.txt', 'Hello', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const content = await driveDriver.with(token).get('folder/dummy-file.txt', 'utf-8')
    assert.equal(content, 'Hello')
  }).timeout(0)
  test('get file metadata', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    await driveDriver.with(token).delete('folder/dummy-file.txt')
    await driveDriver.with(token).put('folder/dummy-file.txt', 'Hello', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const file = await driveDriver.with(token).getMeta('folder/dummy-file.txt', {fields: 'id, name, description'})
    assert.equal(file.description, 'a test simple txt file')
    assert.equal(file.name, 'dummy-file.txt')
  }).timeout(20 * 1000)

  test('get file as stream', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    const file = await driveDriver.with(token).put('folder/dummy-file.txt', 'Hello', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    assert.isNotNull(file)
    const stream = await driveDriver.with(token).getStream('', {fileId: file.id})
    const content = await readStream(stream)
    assert.equal(content, 'Hello')
  }).timeout(0)
  test('return null when getting stream for non-existing file', async (assert) => {
    assert.plan(1)
    const driveDriver = new GoogleDriver(config)
    const stream = await driveDriver.with(token).getStream('non-existing.txt')
    assert.isNull(stream)
  }).timeout(10 * 1000)

  test('copy file from one location to other', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    await driveDriver.with(token).put('folder/dummy-file1.txt', 'Hello', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const file = await driveDriver.with(token).copy('folder/dummy-file1.txt', 'folder/dummy-file2.txt')
    assert.isNotNull(file)
    assert.equal(file.name, `dummy-file2.txt`)
  }).timeout(10 * 1000)

  test('move file from one location to other', async (assert) => {
    const driveDriver = new GoogleDriver(config)
    await driveDriver.with(token).put('folder/dummy-file3.txt', 'Hello', {
      metadata: {
        mimeType: 'text/plain',
        description: 'a test simple txt file'
      }
    })
    const file = await driveDriver.with(token).move('folder/dummy-file3.txt', 'folder/dummy-file4.txt')
    const exists = await driveDriver.with(token).exists('folder/dummy-file3.txt')

    assert.equal(file.name, `dummy-file4.txt`)
    assert.isNull(exists)
    await driveDriver.with(token).delete('folder')
  }).timeout(10 * 1000)
})
