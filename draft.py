import requests

cookies = {
    'cookiePrivacyPreferenceBannerProduction': 'accepted',
    'cookiesSettings': '{"analytics":true,"advertising":true}',
    '_ga': 'GA1.1.1423109442.1620354162',
    'device_t': 'S1M1SkFROjM.JWMUDz9r7NnAHzqL7eYi_mspPj6x_fYo3bjzsrKCqbY',
    'sessionid': 'xcz8p2oj5i9w7rp5747ohpxqzp9fp081',
    'sessionid_sign': 'v3:2vIo3Pqidou1Fb6FV0CIalwakcxPAwqULkn6Fwo5Yds=',
    'tv_ecuid': '49c61781-52b6-4ea7-8d6f-9ed825060be6',
    '__gads': 'ID=e9fb082c7ff228f9:T=1695093673:RT=1725086467:S=ALNI_Mb9XWv0-vyxzltoqcPvxe-1Hqkpcw',
    '__gpi': 'UID=00000ee1b68ba37f:T=1724938130:RT=1725086467:S=ALNI_Mb3AQUThGMZlO8CaekiKoZ5nglIOg',
    '__eoi': 'ID=eb0124deea6e1a06:T=1724938130:RT=1725086467:S=AA-AfjbvONCWZZr4Ly4lKv6L8B47',
    '_sp_ses.cf1a': '*',
    '_ga_YVVRYGL0E0': 'GS1.1.1725089083.36.1.1725089258.49.0.0',
    '_sp_id.cf1a': 'dc8e60f8-45d0-4498-9162-d691b0d47c20.1620354162.842.1725089259.1725086469.d8cfab82-48d5-4530-8ba0-12ad9d861bc9',
}

headers = {
    'authority': 'cn.tradingview.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-cache',
    # 'cookie': 'cookiePrivacyPreferenceBannerProduction=accepted; cookiesSettings={"analytics":true,"advertising":true}; _ga=GA1.1.1423109442.1620354162; device_t=S1M1SkFROjM.JWMUDz9r7NnAHzqL7eYi_mspPj6x_fYo3bjzsrKCqbY; sessionid=xcz8p2oj5i9w7rp5747ohpxqzp9fp081; sessionid_sign=v3:2vIo3Pqidou1Fb6FV0CIalwakcxPAwqULkn6Fwo5Yds=; tv_ecuid=49c61781-52b6-4ea7-8d6f-9ed825060be6; __gads=ID=e9fb082c7ff228f9:T=1695093673:RT=1725086467:S=ALNI_Mb9XWv0-vyxzltoqcPvxe-1Hqkpcw; __gpi=UID=00000ee1b68ba37f:T=1724938130:RT=1725086467:S=ALNI_Mb3AQUThGMZlO8CaekiKoZ5nglIOg; __eoi=ID=eb0124deea6e1a06:T=1724938130:RT=1725086467:S=AA-AfjbvONCWZZr4Ly4lKv6L8B47; _sp_ses.cf1a=*; _ga_YVVRYGL0E0=GS1.1.1725089083.36.1.1725089258.49.0.0; _sp_id.cf1a=dc8e60f8-45d0-4498-9162-d691b0d47c20.1620354162.842.1725089259.1725086469.d8cfab82-48d5-4530-8ba0-12ad9d861bc9',
    'pragma': 'no-cache',
    'referer': 'https://www.tradingview.com/',
    'sec-ch-ua': '"Chromium";v="9", "Not?A_Brand";v="8"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 SLBrowser/9.0.0.10191 SLBChan/25',
}

params = {
    'symbol': 'BINANCE:BTCUSDT.P',
}

response = requests.get('https://cn.tradingview.com/chart/9AZf3GUK/', params=params, cookies=cookies, headers=headers)
print(response.text)
with open('draft.html', 'w') as f:
    f.write(response.text)