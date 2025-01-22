let token = 'token';   //订阅token
let subname = '科学订阅';  //订阅名称
let subupdatetime = 6;    //自定义订阅更新时间，单位小时

// subscriptions 配置说明:
// 格式: 订阅组名称,订阅地址,节点命名前缀
// - 订阅组名称: 普通组直接写名称,自动测延迟组加[]
// - 订阅地址: 订阅源地址
// - 节点命名前缀: 可选,默认使用订阅组名称+'-'
let subscriptions = `
    demo1,https://www.demo1.com/api/subscribe/?uid=xxx,demo-     
    [demo2],https://www.demo2.com/api/subscribe/?uid=xxx,abc-  
    demo3,https://www.demo3.com/api/subscribe/?uid=xxx         
`;


export default {
	async fetch(request, env) {
		token = env.token || token;
		subscriptions = env.subscriptions || subscriptions;
		let subs = parseSubscriptions(subscriptions);
		subname = env.subname || subname;
		subupdatetime = env.subupdatetime || subupdatetime;

		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const pathToken = pathParts[pathParts.length - 1];
        if (pathToken === 'uuid') {
            return new Response(generateUUID(), {
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
		if (!pathToken || pathToken !== token) {
			return await getRandomErrorResponse();
		}

		const userAgent = request.headers.get('User-Agent');
		if (!userAgent) return await getRandomErrorResponse();

		const allowedKeywords = ['clash', 'meta', 'stash'];
		const bannedKeywords = ['bot', 'spider'];

		if (!allowedKeywords.some(k => userAgent.toLowerCase()
				.includes(k)) ||
			bannedKeywords.some(k => userAgent.toLowerCase()
				.includes(k))) {
			return await getRandomErrorResponse();
		}

		const config = {
			"mixed-port": 7890,
			"ipv6": true,
			"allow-lan": true,
			"unified-delay": false,
			"tcp-concurrent": true,
			"external-controller": "127.0.0.1:9090",
			"external-ui": "ui",
			"external-ui-url": "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",

			"geodata-mode": true,
			"geox-url": {
				"geoip": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
				"geosite": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
				"mmdb": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
				"asn": "https://mirror.ghproxy.com/https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"
			},

			"find-process-mode": "strict",
			"global-client-fingerprint": "chrome",

			"profile": {
				"store-selected": true,
				"store-fake-ip": true
			},

			"sniffer": {
				"enable": true,
				"sniff": {
					"HTTP": {
						"ports": [80, "8080-8880"],
						"override-destination": true
					},
					"TLS": {
						"ports": [443, 8443]
					},
					"QUIC": {
						"ports": [443, 8443]
					}
				},
				"skip-domain": [
					"Mijia Cloud",
					"+.push.apple.com"
				]
			},

			"tun": {
				"enable": true,
				"stack": "mixed",
				"dns-hijack": [
					"any:53",
					"tcp://any:53"
				],
				"auto-route": true,
				"auto-redirect": true,
				"auto-detect-interface": true
			},

			"dns": {
				"enable": true,
				"ipv6": true,
				"respect-rules": true,
				"enhanced-mode": "fake-ip",
				"fake-ip-filter": [
					"*",
					"+.lan",
					"+.local",
					"+.market.xiaomi.com"
				],
				"nameserver": [
					"https://223.5.5.5/dns-query",
					"https://120.53.53.53/dns-query"
				],
				"proxy-server-nameserver": [
					"https://223.5.5.5/dns-query",
					"https://120.53.53.53/dns-query"
				],
				"nameserver-policy": {
					"geosite:cn,private": [
						"https://223.5.5.5/dns-query",
						"https://120.53.53.53/dns-query"
					],
					"geosite:geolocation-!cn": [
						"https://dns.cloudflare.com/dns-query",
						"https://dns.google/dns-query"
					]
				}
			},

			"proxies": [{
					"name": "➡️ 直连",
					"type": "direct",
					"udp": true
				},
				{
					"name": "❌ 拒绝",
					"type": "reject"
				}
			]
		};

		config['proxy-providers'] = {};
		for (const [name, sub] of Object.entries(subs)) {
			config['proxy-providers'][name] = {
				url: sub.url,
				type: "http",
				interval: 43200,
				"health-check": {
					enable: true,
					url: "https://www.gstatic.com/generate_204",
					interval: 300
				},
				override: {
					"additional-prefix": sub.prefix
				}
			};
		}

		config['proxy-groups'] = [{
				name: "🚀 默认",
				type: "select",
				proxies: ["⚡️ 自动选择", "📍 全部节点", ...Object.keys(subs)
					.map(name => `📑 ${name}`), "➡️ 直连", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区"
				]
			},
			{
				name: "📍 全部节点",
				type: "select",
				"include-all": true,
				"exclude-type": "direct|reject"
			},
			{
				name: "⚡️ 自动选择",
				type: "url-test",
				"include-all": true,
				"exclude-type": "direct|reject",
				tolerance: 10,
				interval: 1200
			}
		];

		// 为每个订阅源添加专属分组
		Object.keys(subs).forEach(name => {
			config['proxy-groups'].push({
				name: `📑 ${name}`,
				type: subs[name].isUrlTest ? "url-test" : "select",
				"include-all": true,
				"exclude-type": "direct|reject",
				filter: `(?i)${subs[name].prefix}`,
				...(subs[name].isUrlTest ? {
					tolerance: 10,
					interval: 1200
				} : {})
			});
		});

		config['proxy-groups'].push({
			name: "🚫 广告拦截",
			type: "select",
			proxies: ["❌ 拒绝", "➡️ 直连", "🚀 默认"]
		}, {
			name: "🇭🇰 香港",
			type: "url-test",
			"include-all": true,
			"exclude-type": "direct|reject",
			filter: "(?i)港|hk|hongkong|hong kong"
		}, {
			name: "🇨🇳 台湾",
			type: "select",
			"include-all": true,
			"exclude-type": "direct|reject",
			filter: "(?i)台|tw|taiwan"
		}, {
			name: "🇯🇵 日本",
			type: "select",
			"include-all": true,
			"exclude-type": "direct|reject",
			filter: "(?i)日|jp|japan"
		}, {
			name: "🇺🇸 美国",
			type: "select",
			"include-all": true,
			"exclude-type": "direct|reject",
			filter: "(?i)美|us|unitedstates|united states"
		}, {
			name: "🇸🇬 新加坡",
			type: "select",
			"include-all": true,
			"exclude-type": "direct|reject",
			filter: "(?i)(新|sg|singapore)"
		}, {
			name: "🔍 Google",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "📱 Telegram",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "🐦 Twitter",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "📺 哔哩哔哩",
			type: "select",
			proxies: ["➡️ 直连", "🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择"]
		}, {
			name: "📹 YouTube",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "🎬 NETFLIX",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "🎵 Spotify",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "📦 Github",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "🌏 国内",
			type: "select",
			proxies: ["➡️ 直连", "🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择"]
		}, {
			name: "🌍 其他",
			type: "select",
			proxies: ["🚀 默认", "🇭🇰 香港", "🇨🇳 台湾", "🇯🇵 日本", "🇸🇬 新加坡", "🇺🇸 美国", "🌐 其它地区", "📍 全部节点", "⚡️ 自动选择", "➡️ 直连"]
		}, {
			name: "🌐 其它地区",
			type: "select",
			"include-all": true,
			"exclude-type": "direct|reject",
			filter: "(?i)^(?!.*(?:🇭🇰|🇯🇵|🇺🇸|🇸🇬|🇨🇳|港|hk|hongkong|台|tw|taiwan|日|jp|japan|新|sg|singapore|美|us|unitedstates)).*"
		})

		config['rules'] = [
			"GEOSITE,category-ads-all,🚫 广告拦截",
			"GEOIP,lan,➡️ 直连,no-resolve",
			"GEOSITE,github,📦 Github",
			"GEOSITE,twitter,🐦 Twitter",
			"GEOSITE,youtube,📹 YouTube",
			"GEOSITE,google,🔍 Google",
			"GEOSITE,telegram,📱 Telegram",
			"GEOSITE,netflix,🎬 NETFLIX",
			"GEOSITE,bilibili,📺 哔哩哔哩",
			"GEOSITE,spotify,🎵 Spotify",
			"GEOSITE,CN,🌏 国内",
			"GEOSITE,geolocation-!cn,🌍 其他",
			"GEOIP,google,🔍 Google",
			"GEOIP,netflix,🎬 NETFLIX",
			"GEOIP,telegram,📱 Telegram",
			"GEOIP,twitter,🐦 Twitter",
			"GEOIP,CN,🌏 国内,no-resolve",
			"MATCH,🌍 其他"
		];

		return new Response(formatConfig(config), {
			headers: {
			  "content-type": "text/yaml; charset=utf-8",
			  "Profile-Update-Interval": `${subupdatetime}`,
			  "Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(subname)}`
			},
		});
	}
};


function getRandomErrorResponse() {
	const responses = [{
			status: 401,
			message: 'Unauthorized access denied'
		},
		{
			status: 403,
			message: 'Access forbidden'
		},
		{
			status: 404,
			message: 'Resource not found'
		},
		{
			status: 429,
			message: 'Rate limit exceeded'
		},
		{
			status: 503,
			message: 'Service unavailable'
		}
	];

	const response = responses[Math.floor(Math.random() * responses.length)];
	const delay = Math.floor(Math.random() * 1900 + 100);
	const requestId = Array.from({
				length: 32
			}, () =>
			Math.floor(Math.random() * 16)
			.toString(16))
		.join('');

	return new Promise(resolve => {
		setTimeout(() => {
			resolve(new Response(JSON.stringify({
				error: {
					code: response.status,
					message: response.message,
					request_id: requestId,
					timestamp: new Date()
						.toISOString()
				}
			}), {
				status: response.status,
				headers: {
					'Content-Type': 'application/json',
					'X-Request-ID': requestId,
					'Retry-After': Math.floor(Math.random() * 60 + 30)
						.toString(),
					'X-RateLimit-Remaining': '0',
				}
			}));
		}, delay);
	});
}

function parseSubscriptions(text) {
	let subscriptions = {};
  
	const lines = text.trim()
		.split('\n')
		.filter(line => line.trim())
		.map(line => line.trim());
  
	lines.forEach(line => {
		let [name, url, prefix] = line.split(',')
			.map(item => item.trim())
			.map(item => item.replace(/\s+/g, ''));

		const isUrlTest = /^\[(.*)\]$/.test(name);
		if (isUrlTest) {
			name = name.replace(/^\[(.*)\]$/, '$1');
		}
  
		if (!prefix) {
			prefix = name + '-';
		}
  
		subscriptions[name] = {
			url: url,
			prefix: prefix,
			isUrlTest: isUrlTest
		};
	});
  
	return subscriptions;
  }

function formatConfig(config) {
  function needsQuotes(str) {
    return typeof str === 'string' && (
      str.includes(':') || 
      str.includes('{') || 
      str.includes('[') || 
      str.includes('"') ||
      str.includes("'") ||
      str.includes('🚀') ||
      str.includes('⚡') ||
      str.includes('📍') ||
      str.includes('➡') ||
      /^[\s#:>|*{}\[\],'&?!]|-\s|:\s|^[+-]?\d+\.?\d*$/.test(str) ||
      str.length === 0
    );
  }

  function formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean' || typeof value === 'number') return String(value);
    if (needsQuotes(value)) {
      return `"${String(value).replace(/"/g, '\\"')}"`;
    }
    return String(value);
  }

  function toYaml(obj, indent = 0) {
    let yaml = '';
    const spaces = ' '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      const formattedKey = needsQuotes(key) ? `"${key}"` : key;
      if (Array.isArray(value)) {
        yaml += `${spaces}${formattedKey}:\n`;
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            yaml += `${spaces}- ${toYaml(item, indent + 2).trimStart()}\n`;
          } else {
            yaml += `${spaces}- ${formatValue(item)}\n`;
          }
        });
      }

      else if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${formattedKey}:\n${toYaml(value, indent + 2)}`;
      }
      else {
        yaml += `${spaces}${formattedKey}: ${formatValue(value)}\n`;
      }
    }
    return yaml;
  }
  
  return toYaml(config);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
