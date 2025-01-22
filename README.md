# cf-subconverter


一个基于 Cloudflare Worker 的clash订阅转换工具，支持多订阅源整合。

## 功能特点

- 支持多个订阅源汇总
- 自动生成多个订阅组
- 自定义节点前缀

## 快速开始

1. 复制[worker代码](https://raw.githubusercontent.com/Zding89/cf-subconverter/refs/heads/main/worker.js)
2. 在 Cloudflare Workers 创建新的 Worker
3. 复制代码到 Worker
4. 绑定自定义域名，然后打开https://www.自定义域名.com/uuid ，复制生成随机uuid到变量token里面（可选，但建议，否则小心被扫）
5. 配置环境变量

## 配置说明

### worker环境变量
| 变量名 | 示例 | 必填 | 备注 | 
|-|-|-|-|
| token | `token` | ✅ | 访问订阅的uuid，访问格式：`https://www.自定义域名.com/token` | 
| subname | `科学订阅` | ❌ | 生成的订阅文件名称 | 
| subupdatetime | `6` | ❌ | 订阅更新时间间隔，单位：小时 |
| subscriptions | `格式见下方说明` | ✅ | 订阅源配置，支持多个订阅源,一行一个订阅源，英文逗号隔开
### subscriptions 配置格式说明:
```
格式: 订阅组名称,订阅地址,节点命名前缀

demo1,https://www.demo1.com/api/subscribe/?uid=xxx,demo-
[demo2],https://www.demo2.com/api/subscribe/?uid=xxx,abc-
demo3,https://www.demo3.com/api/subscribe/?uid=xxx
```
|
## 使用方法

工具获取订阅地址：`https://www.自定义域名.com/token`

网页访问错误是正常的，屏蔽了网页访问

支持的客户端:
- Clash系客户端

## 注意事项

1. ***请修改默认访问token ***

## 致谢

本项目参考了以下开源项目:

- [sublink-worker](https://github.com/7Sageer/sublink-worker)
- [CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB)

感谢以上项目作者的开源贡献！

## 免责声明

本项目仅供学习交流使用，请遵守当地法律法规。
](https://github.com/7Sageer/sublink-worker)
