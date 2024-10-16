import re
import os
import requests
from tqdm import tqdm

https_list = '''
https://static.tradingview.com/static/bundles/fired.aaee45a643068df3a94b.mp3
https://static.tradingview.com/static/bundles/3_notes_reverb.dc905347b1eda03c1db2.mp3
https://static.tradingview.com/static/bundles/alarm_clock.ba219c712b5dce956b08.mp3
https://static.tradingview.com/static/bundles/beep_beep.cddbb5d281594d0b4b8d.mp3
https://static.tradingview.com/static/bundles/alert_calling.205c6b5ccb0a10decbc1.mp3
https://static.tradingview.com/static/bundles/chirpy.bcc136ad76d4496efe29.mp3
https://static.tradingview.com/static/bundles/fault.ca1f77478c28a528be67.mp3
https://static.tradingview.com/static/bundles/hand_bell.bd1c77bbd21a64aa4fe8.mp3
https://static.tradingview.com/static/bundles/banjo.f8ae29a5e9eeff80336f.mp3
https://static.tradingview.com/static/bundles/droplet.7af2637e76fd0c398606.mp3
https://static.tradingview.com/static/bundles/flickering.49f333585b66b9495ec6.mp3
https://static.tradingview.com/static/bundles/hoarse.0bde36a58b5b3ee2a830.mp3
https://static.tradingview.com/static/bundles/knock-knock.dc78a16c942c8221ae35.mp3
https://static.tradingview.com/static/bundles/promise.8846c006e26bbd93bb15.mp3
https://static.tradingview.com/static/bundles/trumpets.37b45d4b4b0828435ef4.mp3
https://static.tradingview.com/static/bundles/you-win.f8f109a5485e9e627b13.mp3
https://static.tradingview.com/static/bundles/bullfrog.e9f5fe358a7565dd25f9.mp3
https://static.tradingview.com/static/bundles/cat.c0361b04abbaef5f63ca.mp3
https://static.tradingview.com/static/bundles/dog.182e11395ca967b1f7ad.mp3
https://static.tradingview.com/static/bundles/raven.e5f1ef3373f71e85768a.mp3
https://static.tradingview.com/static/bundles/rooster.3bb75f83b8f97580b5c2.mp3
https://static.tradingview.com/static/bundles/thunder.d31d5f06c8bf2f78b26c.mp3
https://static.tradingview.com/static/bundles/water-drop.83c2ab9af95ea24a5ecf.mp3
https://static.tradingview.com/static/bundles/whale.8e28cf183644d362fa2b.mp3
https://static.tradingview.com/static/bundles/attention.a1af5fa41c3e9e422628.mp3
https://static.tradingview.com/static/bundles/guess-what.f13694a7444c01218117.mp3
https://static.tradingview.com/static/bundles/hey-pssst.f66fa4f219d880e04341.mp3
https://static.tradingview.com/static/bundles/hey-take-a-look.a6ef5b28e6c1b7e7998d.mp3
https://static.tradingview.com/static/bundles/hey.e649d73a63e46f7195cf.mp3
https://static.tradingview.com/static/bundles/look-at-me.b3eeca2dba8149400db1.mp3
https://static.tradingview.com/static/bundles/mmm-sexy.730f4389ff3b69449b19.mp3
https://static.tradingview.com/static/bundles/oh.3c8b67f23e52d811cbdd.mp3
https://static.tradingview.com/static/bundles/applauses.f9b16be0c15847f526ac.mp3
https://static.tradingview.com/static/bundles/breaking-some-glass.aef850d696e4b6c11c8d.mp3
https://static.tradingview.com/static/bundles/cash-register.c109ec79b89bd22697b4.mp3
https://static.tradingview.com/static/bundles/chimes-power-down.affb45318b98eda293a3.mp3
https://static.tradingview.com/static/bundles/dramatic-one-note.5c31c48772184f481ae3.mp3
https://static.tradingview.com/static/bundles/jackpot.3c5bace2c136e79d06db.mp3
https://static.tradingview.com/static/bundles/man-laughing.c06b06a98b7f222799e5.mp3
https://static.tradingview.com/static/bundles/martian-gun.c73c33efcfba10700d1a.mp3
'''
url_list = https_list.strip().split('\n')
print(url_list)

file_name_list = []
temp = []
for i in tqdm(range(len(url_list))):
    if i % 8 == 0:
        if len(temp) > 0:
            file_name_list.append(temp)
        temp = []
    # response = requests.get(url_list[i])
    # data = response.content
    file_name = url_list[i].split('/')[-1].split('.')[0]
    temp.append(file_name)
    # with open('./media/' + file_name + '.mp3', 'wb') as f:
    #     f.write(data)
else:
    file_name_list.append(temp)
print(file_name_list)

