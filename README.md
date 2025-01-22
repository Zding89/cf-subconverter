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
| nodes | `格式见下方说明` | ✅ | 单个节点配置，支持多个节点,一行一个节点，英文逗号隔开
### subscriptions 配置格式说明:
```
格式: 订阅组名称,订阅地址,节点命名前缀

demo1,https://www.demo1.com/api/subscribe/?uid=xxx,demo-
[demo2],https://www.demo2.com/api/subscribe/?uid=xxx,abc-
demo3,https://www.demo3.com/api/subscribe/?uid=xxx
```
### subscriptions 配置格式说明:
```
格式: 一行一个节点
vless://uuid@example.com:443?encryption=none&security=reality&sni=www.microsoft.com&fp=chrome&pbk=uJtl2VlB0MLClBXB-jgVoGXyP_q5JKtbJxrV1E3zVWw&sid=6ba85179e30d4fc2&type=tcp&flow=xtls-rprx-vision#VLESS-REALITY-TCP
vless://uuid@example.com:443?encryption=none&security=reality&sni=www.microsoft.com&fp=chrome&pbk=uJtl2VlB0MLClBXB-jgVoGXyP_q5JKtbJxrV1E3zVWw&sid=6ba85179e30d4fc2&type=grpc&serviceName=grpcservice&flow=xtls-rprx-vision#VLESS-REALITY-gRPC
vless://uuid@example.com:443?encryption=none&security=tls&sni=www.example.com&type=ws&host=www.example.com&path=%2Fpath#VLESS-TLS-WS
vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsImFpZCI6IjAiLCJob3N0Ijoid3d3LmV4YW1wbGUuY29tIiwiaWQiOiJ1dWlkIiwibmV0Ijoid3MiLCJwYXRoIjoiL3BhdGgiLCJwb3J0IjoiNDQzIiwicHMiOiJWTWVzcy1UTFMtV1MiLCJzY3kiOiJhdXRvIiwic25pIjoid3d3LmV4YW1wbGUuY29tIiwidGxzIjoidGxzIiwidHlwZSI6IiIsInYiOiIyIn0=
trojan://password@example.com:443?security=tls&type=tcp&sni=www.example.com#Trojan-TLS
ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ@example.com:443#Shadowsocks
vless://uuid@example.com:443?security=tls&encryption=none&headerType=none&type=tcp&flow=xtls-rprx-direct&sni=www.example.com#VLESS-XTLS
vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsImFpZCI6IjAiLCJpZCI6InV1aWQiLCJuZXQiOiJncnBjIiwicGF0aCI6ImdycGNzZXJ2aWNlIiwicG9ydCI6IjQ0MyIsInBzIjoiVk1lc3MtVExTLWdSUEMiLCJzY3kiOiJhdXRvIiwic25pIjoid3d3LmV4YW1wbGUuY29tIiwidGxzIjoidGxzIiwidHlwZSI6Imd1biIsInYiOiIyIn0=
trojan://password@example.com:443?security=tls&type=ws&path=/path&host=www.example.com&sni=www.example.com#Trojan-TLS-WS
```
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
