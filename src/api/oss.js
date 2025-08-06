import OSS from 'ali-oss'
import SparkMD5 from 'spark-md5'
import axios from 'axios'

const UPLOAD_CONSTANTS = {
  CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 1024 * 1024 * 1000, // 1000MB
  UPLOAD_TIMEOUT: 300000 // 5 minutes
}
const OSS_ACCESS_KEY_ID = process.env.VUE_APP_OSS_ACCESS_KEY_ID
const OSS_ACCESS_KEY_SECRET = process.env.VUE_APP_OSS_ACCESS_KEY_SECRET
const OSS_BUCKET = process.env.VUE_APP_OSS_BUCKET
const OSS_REGION = process.env.VUE_APP_OSS_REGION

const calculateMD5 = async(file) => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2097152 // 2MB
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target?.result)
      currentChunk++

      if (currentChunk < chunks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onerror = (e) => {
      reject(e)
    }

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}

const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

const ossClient = new OSS({
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: OSS_ACCESS_KEY_ID,
  accessKeySecret: OSS_ACCESS_KEY_SECRET,
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: OSS_REGION,
  authorizationV4: true,
  // yourBucketName填写Bucket名称。
  bucket: OSS_BUCKET
})

const generateFileName = async(file) => {
  const md5 = await calculateMD5(file)
  const extension = getFileExtension(file.name)
  return `${md5}.${extension}`
}

const OSS_BASE_URL = `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com`

export const performSingleUpload = async(file, onProgressChange) => {
  try {
    onProgressChange(0)
    const filename = await generateFileName(file)

    // 1. 生成预签名URL，必须包含 'Content-Type'
    const signedUrl = ossClient.signatureUrl(filename, {
      method: 'PUT',
      expires: 3600,
      'Content-Type': file.type
    })

    // 2. 使用axios上传，headers 必须和签名时完全一致
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      timeout: UPLOAD_CONSTANTS.UPLOAD_TIMEOUT,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgressChange(progress)
        }
      }
    })

    onProgressChange(100)
    return `${OSS_BASE_URL}/${filename}`
  } catch (error) {
    console.log(error)
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message)
      console.error('Response Data:', error.response?.data)
    } else {
      console.error('Upload Error:', error)
    }
    throw error
  }
}
