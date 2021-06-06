const jszip = require('jszip')
const path = require('path')
const RawSource = require('webpack-sources').RawSource
const fs = require('fs')
const os = require('os')
const zip = new jszip()
class PreBuildZipPlugin {
  constructor(options) {
    // 得到当前的环境和压缩包名,放的位置
    this.options = options||{folderName: 'zipDist'}
  }
  delDir(path) {
    let files = []
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path)
      files.forEach((file, index) => {
        let curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          delDir(curPath) //递归删除文件夹
        } else {
          fs.unlinkSync(curPath) //删除文件
        }
      })
    }
  }
  getRootFile(){
    let rootPath = path.resolve()
    var rootAllFile = fs.readdirSync(rootPath)
    return rootAllFile
  }
  apply(compiler) {
    let foldName = this.options.foldName
    compiler.hooks.beforeRun.tapAsync(
      'preBuildZipPlugin',
      (compilation, callback) => {
        // 获取路径名称
        // 获取当前路径下的所有文件
        if (this.getRootFile().includes(foldName)) {
          if(fs.readdirSync(path.resolve(foldName)).length){

              // nodejs只能通过递归来删除文件。或者通过递归来
                this.delDir(`${path.resolve(foldName)}`)
          }
        } else {
          // 如果没有的话那么就需要创建这个文档
          fs.mkdir(path.resolve(foldName), function(error) {
            if (error) {
              console.log(error)
              return false
            }
            console.log('创建目录成功')
          })
        }
        callback()
        return 
      }
    )
    compiler.hooks.emit.tapAsync(
      'PreBuildZipPlugin',
      (compilation, callback) => {
        const folder = zip.folder(this.options.filename)
        for (let filename in compilation.assets) {
          // 获取所有的资源，并且使用folder.file来将文件更新到zip里面
          const source = compilation.assets[filename].source()
          folder.file(filename, source)
        }

        zip
          .generateAsync({
            type: 'nodebuffer',
          })
          .then(content => {
            const outputPath = path.resolve(
                compilation.options.context, 
                `${foldName}/${this.options.filename}.zip`
            );
            const relativeOutputPath = path.relative(
				`${compilation.options.context}`,
				`${outputPath}`
			);
            // 
            let source = new RawSource(content)
            // 输出
            compilation.assets['../'+relativeOutputPath] = source
            callback()
          })
      }
    )
    compiler.hooks.done.tapAsync('PreBuildZipPlugin',(compilation,callback)=>{
        console.log('打包完成，请注意查收')
        callback()
    })
  }
}

module.exports = PreBuildZipPlugin
