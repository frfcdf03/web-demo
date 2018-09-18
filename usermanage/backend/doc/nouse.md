# hrframe 插件开发工具

## 目录结构说明

+ gulpfile.js //gulp配置文件
+ package.js  //nodejs配置文件
+ README.md   //插件说明
+ doc/        //插件接口文件
+ src/        //插件源码位置
+ web/        //插件运行使用的其他文件


## 反向代理使用方式

修改gulpfile中的后台地址配置不同的后台。
参考文档：（可以同时连接多个后台）
https://github.com/chimurai/http-proxy-middleware

ps:server端不要配置ip地址;
