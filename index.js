const http = require('http');
http.createServer(function (req, res) {
  res.write("online");
  res.end();
}).listen(8080);

require('dotenv').config();
const AToursBot = require('./atoursbot.js');

// 'guildId/channelId' of the discord channel for logging
const loggerId = '807729013396471879/809281891512614932';

const aToursBot = new AToursBot(loggerId, process.env.TRANSLATE_KEY, process.env.TRANSLATE_REGION);

const replaceListMana = [
  { replace: 'Anima', match: /(アニマ|あにま|アニミャ|あにみゃ)鯖?/g },
  { replace: 'Asura', match: /(アスラ|あすら)鯖?/g },
  { replace: 'Belias', match: /(ベリ(アス)?|べり(あす)?)鯖?/g },
  { replace: 'Chocobo', match: /(チョコボ?|ちょこぼ?|馬鳥)鯖?/g },
  { replace: 'Hades', match: /(ハデス|はです|ハーデス|はーです)鯖?/g },
  { replace: 'Ixion', match: /(イクシ(オン)?|いくし(おん)?)鯖?/g },
  { replace: 'Mandragora', match: /(マンドラ(ゴラ)?|まんどら(ごら)?)鯖?/g },
  { replace: 'Masamune', match: /(マサムネ|まさむね|正宗|政宗)鯖?/g },
  { replace: 'Pandaemonium', match: /(パンデモ(ニウム)?|ぱんでも(にうむ)?)鯖?/g },
  { replace: 'Shinryu', match: /(シンリュ(ウ|ー)|しんりゅ(う|ー)|((真|神)(竜|龍)))鯖?/g },
  { replace: 'Titan', match: /(タイタン|たいたん)鯖?|タコ鯖|たこ鯖/g }];

const replaceListGaia = [
  { replace: 'Alaxander', match: /(アレキ(サンダー)?|あれき(さんだー)?)鯖?/g },
  { replace: 'Bahamut', match: /(バハ(ムート)?|ばは(むーと)?)鯖?/g },
  { replace: 'Durandal', match: /(デュラ(ンダル)?|でゅら(んだる)?)鯖?/g },
  { replace: 'Fenrir', match: /(フェンリル|ふぇんりる)鯖?|狼鯖/g },
  { replace: 'Ifrit', match: /(イフ(リート)?|いふ(りーと)?)鯖?/g },
  { replace: 'Ridill', match: /(リディル|りでぃる)鯖?/g },
  { replace: 'Tiamat', match: /(ティアマット|てぃあまっと)鯖?/g },
  { replace: 'Ultima', match: /(アルテマ|あるてま)鯖?/g },
  { replace: 'Valefor', match: /(ヴァル(フレア)?|ヴぁる(ふれあ)?)鯖?/g },
  { replace: 'Yojimbo', match: /(ヨウジンボウ|ようじんぼう|用心棒)鯖?/g },
  { replace: 'Zeromus', match: /(ゼロムス|ぜろむす)鯖?/g }];

const replaceList = [
  { replace: 'Lakeland', match: /レイクランド|れいくらんど/g },
  { replace: 'Kholusia', match: /コルシア|こるしあ/g },
  { replace: 'Amh Araeng', match: /アム・?アレーン|あむ・?あれーん/g },
  { replace: 'Il Mheg', match: /イル・?メグ|いる・?めぐ/g },
  {
    replace: 'The Rak\'tika Greatwood', match: /(ラケティカ|らけてぃか)(大森林)?/g
  },
  { replace: 'The Tempest', match: /テンペスト|てんぺすと/g },
  { replace: 'The Fringes', match: /(ギラバニア辺境|ぎらばにあ辺境)(地帯)?/g },
  { replace: 'The Peaks', match: /(ギラバニア山岳|ぎらばにあ山岳)(地帯)?/g },
  { replace: 'The Lochs', match: /(ギラバニア湖畔|ぎらばにあ湖畔)(地帯)?/g },
  { replace: 'The Ruby Sea', match: /紅玉海?/g },
  { replace: 'Yanxia', match: /ヤンサ|やんさ/g },
  { replace: 'The Azim Steppe', match: /アジム(ステップ)?|あじむ(ステップ)?/g },
  { replace: 'Fort Jobb', match: /(ジョッブ|じょっぶ|ジョップ|じょっぷ)砦?/g },
  { replace: 'Ostall', match: /(オスタル|おすたる)(厳命城|城)?/g },
  { replace: 'Silltide', match: /スティルタイド|すてぃるたいど/g },
  { replace: 'Wright', match: /(ライト|らいと)村?/g },
  { replace: 'Tomra', match: /(トメラ|とめら)(の?村)?/g },
  { replace: 'Mord Souq', match: /モルド・?スーク|もるど・?すーく/g },
  {
    replace: 'The Inn at Journey\'s Head', match: /旅立ちの宿/g
  },
  { replace: 'Twine', match: /トゥワイン|とぅわいん/g },
  { replace: 'Lydha Lran', match: /リダ・?ラーン|りだ・?らーん/g },
  { replace: 'Pla Enni', match: /(プラ・?エンニ|ぷら・?えんに)(茸窟)?/g },
  { replace: 'Wolekdorf', match: /ヴォレクドルフ|ヴぉれくどるふ/g },
  { replace: 'Slitherbough', match: /スリザーバウ|すりざーばう/g },
  { replace: 'Fanow', match: /ファノヴ(の里)?/g },
  { replace: 'The Ondo Cups', match: /オンドの湖溜まり/g },
  { replace: 'The Macarenses Angele', match: /マカレンサス広場|まかれんさす広場/g },
  { replace: 'The Crystarium', match: /クリスタリウム|くりすたりうむ/g },
  { replace: 'Eulmore', match: /ユールモア|ゆーるもあ/g },
  {
    replace: 'Rhalgr\'s Reach', match: /ラールガーズリーチ|らーるがーずりーち/g
  },
  { replace: 'Castrum Oriens', match: /カストルム・?オリエンス|かすとるむ・?おりえんす/g },
  { replace: 'The Peering Stones', match: /ピーリングストーンズ|ぴーりんぐすとーんず/g },
  { replace: 'Ala Gannha', match: /アラガー?ナ|あらがー?な/g },
  { replace: 'Ala Ghiri', match: /アラギリ|あらぎり/g },
  { replace: 'Porta Praetoria', match: /ポルタ・?プレトリア|ぽるた・?ぷれとりあ/g },
  { replace: 'The Ala Mhigan Quarter', match: /アラミガン・?クォーター|あらみがん・?くぉーたー/g },
  { replace: 'Kugane', match: /クガネ|くがね/g },
  { replace: 'Tamamizu', match: /(碧の)?(タマミズ|たまみず)/g },
  { replace: 'Onokoro', match: /(オノコロ|おのころ)島?/g },
  { replace: 'Namai', match: /(ナマイ|なまい)村?/g },
  { replace: 'The House of the Fierce', match: /レッシアン|れっしあん|烈士庵/g },
  { replace: 'Reunion', match: /再会の市|再開の市/g },
  { replace: 'The Dawn Throne', match: /明けの玉座/g },
  { replace: 'Dhoro Iloh', match: /ドーロ・?イロー|どーろ・?いろー/g },
  { replace: 'The Domain Enclave', match: /ドマ町人地|どま町人地/g },
  { replace: 'ShB', match: /漆黒エリア|漆黒えりあ|漆黒/g },
  { replace: 'StormBlood', match: /紅蓮エリア|紅蓮えりあ|紅蓮/g },
  { replace: '$1$2 hunts train', match: /(A)?(\d+)?体?連戦/g },
  { replace: '$1$2 tour', match: /(A)?(\d+)?体?ツアー/g },
  { replace: 'Instance', match: /インス(タンス)?|いんす(たんす)?/g }];

//Mana
aToursBot.addRule(
  '807729013396471879/839851638075949126',
  [{
    id: '807729013396471879/807732845761265714',
    mentionIds: ['809123745209909250'],
  }, {
    id: '807729013396471879/839851265001521162',
    mentionIds: ['809123745209909250'],
    translate: true
  }],
  replaceList.concat(replaceListMana)
);

//Gaia
aToursBot.addRule(
  '807729013396471879/807733736270594050',
  [{
    id: '807729013396471879/809112790798565397',
    mentionIds: ['809125167754117130'],
  },{
    id: '807729013396471879/840753867037605889',
    mentionIds: ['809125167754117130'],
    translate: true
  }],
  replaceList.concat(replaceListGaia)
);

//Elemental
aToursBot.addRule(
  '807729013396471879/807734958050770955',
  [{
    id: '807729013396471879/809112741771739197',
    mentionIds: ['809125177060884551'],
  }]
);

aToursBot.login();
