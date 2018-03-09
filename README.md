# flydrive-google-drive
This is GoogleDrive access driver for [node-flydrive](https://github.com/Slynova-Org/node-flydrive) library
## Dependencies
This package depends on google-auth-library, you can get it by running  
`npm i --save google-auth-library`  
The ``google-auth-library`` permits using OAuth for google drive authentication, its main role is to get a new token from refresh token if any
## Installation
You can get this package by running just  
`npm i --save flydrive-google-drive`  
## Usage
### With flydrive library
You need to install  @slynova/flydrive that is a fluent nodejs storage library  
`npm i --save @slynova/flydrive`

And now you just import StorageManager from flydrive and register flydrive-google-drive  
```js
const StorageManager = require('@slynova/flydrive')
const GoogleDriver = require('flydrive-google-drive')


const storageManager = new StorageManager({
  default: 'googledrive',
  'disks': {
      'local': {
        'driver': 'local',
        'root': process.cwd()
      },
  
      's3': {
        'driver': 's3',
        'key': 'AWS_S3_KEY',
        'secret': 'AWS_S3_SECRET',
        'region': 'AWS_S3_REGION',
        'bucket': 'AWS_S3_BUCKET'
      },
      'googledrive': {
        'driver': 'googledrive',
        'clientId': 'GOOGLE_DRIVE_CLIENT_ID',
        'clientSecret': 'GOOGLE_DRIVE_CLIENT_SECRET',
        'redirectUrl': 'GOOGLE_DRIVE_REDIRECT_URL',
        'access_token': 'GOOGLE_DRIVE_ACCESS_TOKEN',
        'refresh_token': 'GOOGLE_DRIVE_REFRESH_TOKEN'
      }
  }
})
storageManager.extend('googledrive', GoogleDriver)
```

You can now call file operation method from on a Storage object instance that you can get from storage manager  

````js
async function test() {
  const storage = storageManager.disk('googledrive')
  let file = await storage.put('storage-test.txt', 'From storage manager')
  file = await storage.move('storage-test.txt', 'storage-test-cp.txt')
  const content = await storage.get('storage-test-cp.txt')
  const r = await storage.delete('storage-test-cp.txt')
}

```` 
> Please refer to [flydrive wiki](https://github.com/Slynova-Org/node-flydrive/wiki) for more information about this
### Use as standlone
You can use this library standlone  
Import ``GoogleDrive`` 
````js
const GoogleDriver = require('flydrive-google-drive')
````
Create an instance of the `GoogleDrive`  
```js
const config = {
  'clientId': 'GOOGLE_DRIVE_CLIENT_ID',
  'clientSecret': 'GOOGLE_DRIVE_CLIENT_SECRET',
  'redirectUrl': 'GOOGLE_DRIVE_REDIRECT_URL',
  'access_token': 'GOOGLE_DRIVE_ACCESS_TOKEN',
  'refresh_token': 'GOOGLE_DRIVE_REFRESH_TOKEN'
}
async function test() {
  const drive = new GoogleDrive(config);
  //if you provide a refresh token , this will be used to get a new token on each request, to ensure there is not authentication error
  let r =await drive.exists('some-file.txt');
  if(!r){
    await drive.put('some-file.txt','Some file')
    let file = await drive.getMeta('some-file.txt')
    const content = await drive
      .with({token:"new token",refresh_token:'new refresh token'})
      .get(file.name,'utf-8');
    console.log(content)
  }
}
```

##Licence
MIT
