# pre-build-zip-plugin  v0.1
使用jsZip实现的一个webpack插件
[jszip库](https://stuk.github.io/jszip)
考虑到自己的业务，自己的情况下，需要将一个zip文件压缩出来，作为单独的文件，并上传到服务器上。并不需要和webpack默认生成目录进行强绑定。有的时候需要打包多个环境下的包进行测试。
所以自己封装了这么一个插件，方便自己的开发和构建

```
// 使用实例：

 new PreBuildZipPlugin({
      filename: 'test env',
      foldName: 'zipDist',
 }),
```
