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
  { key: '100', replace: 'Anima', match: /(Anima|アニマ|あにま|アニミャ|あにみゃ)鯖?/gi },
  { key: '101', replace: 'Asura', match: /(Asura|アスラ|あすら)鯖?/gi },
  { key: '102', replace: 'Belias', match: /(Belias|ベリ(アス)?|べり(あす)?)鯖?/gi },
  { key: '103', replace: 'Chocobo', match: /(Chocobo|チョコボ?|ちょこぼ?|馬鳥)鯖?/gi },
  { key: '104', replace: 'Hades', match: /(Hades|ハデス|はです|ハーデス|はーです)鯖?/gi },
  { key: '105', replace: 'Ixion', match: /(Ixion|イクシ(オン)?|いくし(おん)?)鯖?/gi },
  { key: '106', replace: 'Mandragora', match: /(Mandra(gora)?|マンドラ(ゴラ)?|まんどら(ごら)?)鯖?/gi },
  { key: '107', replace: 'Masamune', match: /(Masamune|マサムネ|まさむね|正宗|政宗)鯖?/gi },
  { key: '108', replace: 'Pandaemonium', match: /(Pandaemo(nium)?|Pandemo(nium)?|パンデモ(ニウム)?|ぱんでも(にうむ)?)鯖?/gi },
  { key: '109', replace: 'Shinryu', match: /(Shinryu|シンリュ(ウ|ー)|しんりゅ(う|ー)|((真|神)(竜|龍)))鯖?/gi },
  { key: '110', replace: 'Titan', match: /(Titan|タイタン|たいたん)鯖?|タコ鯖|たこ鯖/gi }];

const replaceListGaia = [
  { key: '100', replace: 'Alexander', match: /(Alexander|アレキ(サンダー)?|あれき(さんだー)?)鯖?/gi },
  { key: '101', replace: 'Bahamut', match: /(Bahamut|バハ(ムート)?|ばは(むーと)?)鯖?/gi },
  { key: '102', replace: 'Durandal', match: /(Durandal|デュラ(ンダル)?|でゅら(んだる)?)鯖?/gi },
  { key: '103', replace: 'Fenrir', match: /(Fenrir|フェンリル|ふぇんりる)鯖?|狼鯖/gi },
  { key: '104', replace: 'Ifrit', match: /(Ifrit|イフ(リート)?|いふ(りーと)?)鯖?/gi },
  { key: '105', replace: 'Ridill', match: /(Ridill|リディル|りでぃる)鯖?/gi },
  { key: '106', replace: 'Tiamat', match: /(Tiamat|ティアマット|てぃあまっと)鯖?/gi },
  { key: '107', replace: 'Ultima', match: /(Ultima|アルテマ|あるてま)鯖?/gi },
  { key: '108', replace: 'Valefor', match: /(Valefor|ヴァル(フレア)?|ヴぁる(ふれあ)?)鯖?/gi },
  { key: '109', replace: 'Yojimbo', match: /(Yojimbo|ヨウジンボウ|ようじんぼう|用心棒)鯖?/gi },
  { key: '110', replace: 'Zeromus', match: /(Zeromus|ゼロムス|ぜろむす)鯖?/gi }];

const replaceList = [
  { key: '000', replace: 'Lakeland', match: /レイクランド|れいくらんど/g },
  { key: '001', replace: 'Kholusia', match: /コルシア|こるしあ/g },
  { key: '002', replace: 'Amh Araeng', match: /アム・?アレーン|あむ・?あれーん/g },
  { key: '003', replace: 'Il Mheg', match: /イル・?メグ|いる・?めぐ/g },
  {
    key: '004', replace: 'The Rak\'tika Greatwood', match: /(ラケティカ|らけてぃか)(大森林)?/g
  },
  { key: '005', replace: 'The Tempest', match: /テンペスト|てんぺすと/g },
  { key: '006', replace: 'The Fringes', match: /(ギラバニア辺境|ぎらばにあ辺境)(地帯)?/g },
  { key: '007', replace: 'The Peaks', match: /(ギラバニア山岳|ぎらばにあ山岳)(地帯)?/g },
  { key: '008', replace: 'The Lochs', match: /(ギラバニア湖畔|ぎらばにあ湖畔)(地帯)?/g },
  { key: '009', replace: 'The Ruby Sea', match: /紅玉海?/g },
  { key: '010', replace: 'Yanxia', match: /ヤンサ|やんさ/g },
  { key: '011', replace: 'The Azim Steppe', match: /アジム(ステップ)?|あじむ(ステップ)?/g },
  { key: '012', replace: 'Fort Jobb', match: /(ジョッブ|じょっぶ|ジョップ|じょっぷ)砦?/g },
  { key: '013', replace: 'Ostall', match: /(オスタル|おすたる)(厳命城|城)?/g },
  { key: '014', replace: 'Silltide', match: /スティルタイド|すてぃるたいど/g },
  { key: '015', replace: 'Wright', match: /(ライト|らいと)村?/g },
  { key: '016', replace: 'Tomra', match: /(トメラ|とめら)(の?村)?/g },
  { key: '017', replace: 'Mord Souq', match: /モルド・?スーク|もるど・?すーく/g },
  {
    key: '018', replace: 'The Inn at Journey\'s Head', match: /旅立ちの宿/g
  },
  { key: '019', replace: 'Twine', match: /トゥワイン|とぅわいん/g },
  { key: '020', replace: 'Lydha Lran', match: /リダ・?ラーン|りだ・?らーん/g },
  { key: '021', replace: 'Pla Enni', match: /(プラ・?エンニ|ぷら・?えんに)(茸窟)?/g },
  { key: '022', replace: 'Wolekdorf', match: /ヴォレクドルフ|ヴぉれくどるふ/g },
  { key: '023', replace: 'Slitherbough', match: /スリザーバウ|すりざーばう/g },
  { key: '024', replace: 'Fanow', match: /ファノヴ(の里)?/g },
  { key: '025', replace: 'The Ondo Cups', match: /オンドの湖溜まり/g },
  { key: '026', replace: 'The Macarenses Angele', match: /マカレンサス広場|まかれんさす広場/g },
  { key: '027', replace: 'The Crystarium', match: /クリスタリウム|くりすたりうむ/g },
  { key: '028', replace: 'Eulmore', match: /ユールモア|ゆーるもあ/g },
  {
    key: '029', replace: 'Rhalgr\'s Reach', match: /ラールガーズリーチ|らーるがーずりーち/g
  },
  { key: '030', replace: 'Castrum Oriens', match: /カストルム・?オリエンス|かすとるむ・?おりえんす/g },
  { key: '031', replace: 'The Peering Stones', match: /ピーリングストーンズ|ぴーりんぐすとーんず/g },
  { key: '032', replace: 'Ala Gannha', match: /アラガー?ナ|あらがー?な/g },
  { key: '033', replace: 'Ala Ghiri', match: /アラギリ|あらぎり/g },
  { key: '034', replace: 'Porta Praetoria', match: /ポルタ・?プレトリア|ぽるた・?ぷれとりあ/g },
  { key: '035', replace: 'The Ala Mhigan Quarter', match: /アラミガン・?クォーター|あらみがん・?くぉーたー/g },
  { key: '036', replace: 'Kugane', match: /クガネ|くがね/g },
  { key: '037', replace: 'Tamamizu', match: /(碧の)?(タマミズ|たまみず)/g },
  { key: '038', replace: 'Onokoro', match: /(オノコロ|おのころ)島?/g },
  { key: '039', replace: 'Namai', match: /(ナマイ|なまい)村?/g },
  { key: '040', replace: 'The House of the Fierce', match: /レッシアン|れっしあん|烈士庵/g },
  { key: '041', replace: 'Reunion', match: /再会の市|再開の市/g },
  { key: '042', replace: 'The Dawn Throne', match: /明けの玉座/g },
  { key: '043', replace: 'Dhoro Iloh', match: /ドーロ・?イロー|どーろ・?いろー/g },
  { key: '044', replace: 'The Domain Enclave', match: /ドマ町人地|どま町人地/g },
  { key: '045', replace: 'ShB', match: /漆黒エリア|漆黒えりあ|漆黒/g },
  { key: '046', replace: 'StormBlood', match: /紅蓮エリア|紅蓮えりあ|紅蓮/g },
  { key: '047', replace: 'hunts train', match: /体?連戦/g },
  { key: '048', replace: 'tour', match: /体?ツアー/g },
  { key: '049', replace: 'Instance', match: /インス(タンス)?|いんす(たんす)?/g }];

//Mana
aToursBot.addRule(
  '807729013396471879/839851638075949126',
  [{
    id: '807729013396471879/807732845761265714',
    mentionIds: ['809123745209909250'],
  }, {
    id: '807729013396471879/839851265001521162',
    mentionIds: [],
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
    mentionIds: [],
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
