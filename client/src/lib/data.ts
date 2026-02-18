export interface Product {
  id: string;
  name: string;
  price: number;
  img?: string;
  skt?: string;
  originalPrice?: number;
}

export interface Category {
  title: string;
  items: Product[];
}

export interface PaymentOption {
  id: string;
  name: string;
  disc: number;
  tag: string;
}

export const CONFIG = {
  phone: "+908508403959",
  shipLimit: 1000,
  minLimit: 500,
  shipFee: 89,
  bankInfo:
    "\n\n*BANKA HESAP NO :* TR54 0006 2001 0550 0006 2959 82 \n*BANKA HESAP ADI :* SİZPA İNTERNET TİCARET LİMİTED ŞİRKETİ",
};

export const MAIN_PRODUCTS: Product[] = [
  { id: "rc15", name: "Brit Kitten (yavru) 2 Kg", price: 1260 },
];

export const CATEGORIES: Category[] = [
  {
    title: "KEDİ KUMU",
    items: [
      { id: "kk1", name: "Van Cat Naturel Kokusuz İnce Taneli Kedi Kumu 10 Lt", price: 218, img: "https://www.mamatoptancisi.com/van-cat-naturel-kokusuz-ince-taneli-topaklanan-bentonit-kedi-kumu-10-lt-1065633-10-O.jpg" },
      { id: "kk2", name: "Ever Clean Multi Kristal Koku Önleyici Kedi Kumu 6 Lt", price: 715, img: "https://www.mamatoptancisi.com/ever-clean-multi-kristal-koku-onleyici-kedi-kumu-6-lt-1068122-10-O.jpg" },
      { id: "kk3", name: "Kiko Cat Premium Litter Grey Karbon 10 Lt Kedi Kumu", price: 219 },
      { id: "kk4", name: "Lindocat Super Premium Bikarbonatlı Koku Önleyici 10 lt", price: 268, img: "https://www.mamatoptancisi.com/lindocat-super-premium-bikarbonatli-koku-onleyici-ve-extra-guclu-topaklanan-kedi-kumu-10-lt-9952-1062266-99-O.jpg" },
      { id: "kk5", name: "Lindocat Advanced Super Premium Pudra Kokulu 10 Lt", price: 241 },
      { id: "kk6", name: "Lindocat Advanced Super Premium Kokusuz 10 Lt", price: 239 },
      { id: "kk7", name: "Ever Clean Extra Strong Kokusuz 10 lt", price: 970, img: "https://www.mamatoptancisi.com/ever-clean-extra-strong-kokusuz-kedi-kumu-10-lt-1066946-97-O.jpg" },
      { id: "kk8", name: "Feles Aktif Karbonlu Tozsuz Topaklanan 10 lt X 2 Adet", price: 484 },
      { id: "kk9", name: "Feles Aktif Karbonlu Tozsuz Topaklanan 10 lt", price: 269 },
      { id: "kk10", name: "Toi Moi Aktif Karbonlu İnce Taneli 10 kg", price: 201, img: "https://www.mamatoptancisi.com/toi-moi-aktif-karbonlu-ince-taneli-topaklanan-bentonit-kedi-kumu-10-lt-1065845-93-O.jpg" },
      { id: "kk11", name: "Toi Moi Kokusuz İnce Taneli 10 kg", price: 182, img: "https://www.mamatoptancisi.com/toi-moi-kokusuz-ince-taneli-topaklanan-bentonit-kedi-kumu-10-lt-1068294-93-O.jpg" },
      { id: "kk12", name: "Toi Moi Bebek Pudralı İnce Taneli 10 kg", price: 182, img: "https://www.mamatoptancisi.com/toi-moi-bebek-pudrali-ince-taneli-topaklanan-bentonit-kedi-kumu-10-lt-1067177-93-O.jpg" },
      { id: "kk13", name: "Toi Moi Marsilya Sabunlu İnce Taneli 10 kg", price: 182 },
      { id: "kk14", name: "Lindocat Advanced Pudra Kokulu Bentonit 10 Lt", price: 339 },
      { id: "kk15", name: "Lindocat Advanced Multicat İnce Taneli 12 Lt", price: 345 },
      { id: "kk16", name: "Lindocat Super Premium Bikarbonatlı 10 Lt", price: 385 },
      { id: "kk17", name: "Lindocat Marsilya Sabun Kokulu İnce Taneli 10 Lt", price: 195 },
      { id: "kk18", name: "Lindocat Prestige Bebek Pudra Kokulu İnce Taneli 10 Lt", price: 195 },
      { id: "kk19", name: "Lindocat Charme Amber Kokulu Kalın Taneli 10 Lt", price: 216 },
      { id: "kk20", name: "Lindocat Advanced Probiotic Bakteri Önleyici 10 Lt", price: 214 },
      { id: "kk21", name: "Ever Clean Spring Garden Çiçek Kokulu 10 lt", price: 970 },
      { id: "kk22", name: "Ever Clean Extra Strong Kokulu 10 lt", price: 970 },
      { id: "kk23", name: "Ever Clean Multiple Cat 10 lt", price: 968 },
      { id: "kk24", name: "Ever Clean LitterFree Paws İz Bırakmayan 10 lt", price: 970 },
      { id: "kk25", name: "Ever Clean Fast Acting 10 lt", price: 953 },
      { id: "kk26", name: "Ever Clean LitterFree Paws İz Bırakmayan 6 lt", price: 710 },
      { id: "kk27", name: "Biokats Micro Bianco Fresh 6 lt", price: 150 },
      { id: "kk28", name: "Ever Clean Extra Strong Kokulu İnce Taneli 6 lt", price: 666 },
      { id: "kk29", name: "Proline Bebek Pudralı İnce Taneli 10 lt", price: 170 },
      { id: "kk30", name: "Proline Kokusuz İnce Taneli 10 lt", price: 170 },
      { id: "kk31", name: "Van Cat Aktif Karbonlu İnce Taneli 10 Lt", price: 243 },
      { id: "kk32", name: "Sandy Max Triple Action 10 lt", price: 453 },
      { id: "kk33", name: "Biokat's Bianco Extra 10 lt", price: 105 },
      { id: "kk34", name: "Pisipisi Sabun Kokulu İnce Taneli 10 kg", price: 287 },
      { id: "kk35", name: "Pisipisi Pudra Kokulu İnce Taneli 10 kg", price: 287 },
      { id: "kk36", name: "Feles Ultra Light Aktif Karbonlu 8 lt", price: 263 },
      { id: "kk37", name: "Lindocat Prestige Bebek Pudra Kokulu 5 Lt", price: 109 },
      { id: "kk38", name: "Lindocat Advanced Kokusuz Bentonit 10 Lt", price: 349 },
      { id: "kk39", name: "Lindocat Original İnce Taneli Kokusuz 10 Lt", price: 195 },
      { id: "kk40", name: "Cats Best Original Natural 10+2 lt", price: 745 },
      { id: "kk41", name: "Sanicat Clumping White Oksijen Kontrol 8 lt", price: 301 },
      { id: "kk42", name: "Sanicat Active White Oxygen Control 10 lt", price: 398 },
      { id: "kk43", name: "Sanicat Strong Clumps İnce Taneli 10 lt", price: 613 },
      { id: "kk44", name: "Sanicat Natura Activa Çam Peleti 10 lt", price: 676 },
      { id: "kk45", name: "Natura Natural Sensitive Kokusuz 10 lt", price: 360 },
      { id: "kk46", name: "Proline Kokusuz 20 lt", price: 289 },
      { id: "kk47", name: "Proline Aktif Karbonlu İnce Taneli 20 lt", price: 322 },
      { id: "kk48", name: "Natura Scented Slim Aloe Vera 10 lt", price: 332 },
      { id: "kk49", name: "Biokat's Bianco Fresh 10 lt", price: 119 },
      { id: "kk50", name: "Proline Lavanta Kokulu İnce Taneli 10 lt", price: 130 },
      { id: "kk51", name: "Ever Clean Lavanta Kokulu 10 lt", price: 970 },
      { id: "kk52", name: "Ever Clean Total Cover Koku Önleyici 10 lt", price: 969 },
      { id: "kk53", name: "Ever Clean Multi Kristal 10 lt", price: 920 },
      { id: "kk54", name: "Sanicat Active Oksijen Marsilya Sabun 10 lt", price: 278 },
      { id: "kk55", name: "Sanicat Duo Vanilya ve Mandalina 10 lt", price: 267 },
      { id: "kk56", name: "Biokat's Bianco Fresh Mandalina 10 lt", price: 115 },
      { id: "kk57", name: "Ever Clean Naturally Parfümsüz 10 lt", price: 967 },
      { id: "kk58", name: "Proline Marsilya Sabun Kokulu İnce Taneli 10 lt", price: 170 },
      { id: "kk59", name: "Cats Best Original 5 L", price: 702 },
      { id: "kk60", name: "Trendline Silika Kristal 3.6 lt", price: 90 },
    ],
  },
  {
    title: "KEDİ ÖDÜLLERİ",
    items: [
      { id: "wc1", name: "ME-O Yengeç paket", price: 35, img: "https://static.wixstatic.com/media/63853e_244373b7cfe94e5c8d6c2ce0ddeaa0bb~mv2.webp" },
      { id: "wc2", name: "ME-O Orkinos Balık paket", price: 35, img: "https://static.wixstatic.com/media/63853e_39b435ffed3a40f1821f61f48e8d900e~mv2.webp" },
      { id: "wc3", name: "ME-O Füme ton balıklı paket", price: 35, img: "https://static.wixstatic.com/media/63853e_25d9ffa681be49e782b787a30e7976ef~mv2.webp" },
      { id: "wc4", name: "ME-O Tavuklu paket", price: 35, img: "https://static.wixstatic.com/media/63853e_cdff668ac9944183b7edd84a4b00720a~mv2.webp" },
      { id: "wc5", name: "Miamor Cream Malt-peynir 6x15 Gr", price: 35, img: "https://static.wixstatic.com/media/63853e_20328be60e5b4ff98eb9115448f617e9~mv2.webp" },
      { id: "wc6", name: "Miamor Cream Malt 6x15 Gr", price: 35, img: "https://static.wixstatic.com/media/63853e_ba117db862744e86b15e8fa70654edf6~mv2.webp" },
      { id: "wc7", name: "Crocus Yengeçli 4x15gr", price: 35, img: "https://static.wixstatic.com/media/63853e_cf6117c2e4b6457da66e43176b09cc83~mv2.webp" },
      { id: "wc8", name: "WANPY Karışık 50 adet", price: 35, img: "https://static.wixstatic.com/media/63853e_0932e49c4edc46c38e699048afd58e29~mv2.webp" },
    ],
  },
  {
    title: "KEDİ MALT",
    items: [
      { id: "malt1", name: "GimCat Malt Soft Extra 20 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_1d07a5ac4ba84a57b7f622fbd659d54c~mv2.webp" },
      { id: "malt2", name: "GimCat Malt Soft Extra 100 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_d93c9373b6464c29b4b37ca27ad40fcb~mv2.webp" },
      { id: "malt3", name: "GimCat Multivitamin 20 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_0e8cb84c60164adfb032ffa702e6a2b4~mv2.webp" },
      { id: "malt4", name: "GimCat Multivitamin 100 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_9708b1a240ca4b4ea02e75ecc8f48f71~mv2.webp" },
      { id: "malt5", name: "GimCat Anti-Hairball Peynirli 50gr", price: 35, img: "https://static.wixstatic.com/media/63853e_8bb8fe589e38402f9f9f65b03dd0eb7a~mv2.webp" },
      { id: "malt6", name: "GimCat Anti-Hairball Tavuk 50gr", price: 35, img: "https://static.wixstatic.com/media/63853e_5f4d130ebe9c4f3fa8b06cd0ab2a12e4~mv2.webp" },
      { id: "malt7", name: "GimCat Cheese Biotin Paste 50gr", price: 35, img: "https://static.wixstatic.com/media/63853e_860c64a06f544841ae7f8affa933d6d8~mv2.webp" },
      { id: "malt8", name: "Gimcat Kedi Macunu Derma Paste 50gr", price: 35, img: "https://static.wixstatic.com/media/63853e_4aa4dc8d05084af7921f8aa7938c4571~mv2.webp" },
      { id: "malt9", name: "Gimcat Kedi Macunu Relax Paste 50gr", price: 35, img: "https://static.wixstatic.com/media/63853e_114548e2d85844d58136395b1c41c912~mv2.webp" },
      { id: "malt10", name: "GimCat Kedi Macunu Taurin Paste Extra 50gr", price: 35, img: "https://static.wixstatic.com/media/63853e_65f5d188aee54d1d9438fcca4a659358~mv2.webp" },
      { id: "malt11", name: "Spectrum Malt Paste Macun 30 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_cbbacb35516b4709b5b61d83bda0e423~mv2.webp" },
      { id: "malt12", name: "Spectrum Malt Paste Macun 100 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_114548e2d85844d58136395b1c41c912~mv2.webp" },
      { id: "malt13", name: "Dr.Clauders Malt 100 GR", price: 35, img: "https://static.wixstatic.com/media/63853e_483056456e4649a48009fcaa44a140e3~mv2.webp" },
      { id: "malt14", name: "Single Malt Paste 100 gr", price: 35, img: "https://static.wixstatic.com/media/63853e_84703e87216e48eaaa9c8ff5caf1282e~mv2.webp" },
    ],
  },
  {
    title: "KEDİ YAŞ MAMASI",
    items: [
      { id: "ym1", name: "Proplan yavru yaş mama", price: 35, img: "https://static.wixstatic.com/media/63853e_26b590fe701c4ca3a2dfa8e636d0d0a0~mv2.webp" },
      { id: "ym2", name: "Proplan Adult Tavuklu", price: 35, img: "https://static.wixstatic.com/media/63853e_3e1f871338284c54adc3c4f8e5c2a6e7~mv2.png" },
      { id: "ym3", name: "Proplan kısır yaş mama", price: 35, img: "https://static.wixstatic.com/media/63853e_516bafdef93c4d3b8cb8d05675278d8c~mv2.webp" },
      { id: "ym4", name: "Proplan Delicate", price: 35, img: "https://static.wixstatic.com/media/63853e_fba74f727181409e89f53da0ed0d82d0~mv2.webp" },
      { id: "ym5", name: "Gourmet Ton Balıklı Püre", price: 35, img: "https://static.wixstatic.com/media/63853e_0daffe01618148baa58f15e27e7bb5e9~mv2.webp" },
      { id: "ym6", name: "Gourmet Sığır etli püre", price: 35, img: "https://static.wixstatic.com/media/63853e_7f12a63f285743bca4ae6029fc29a1c3~mv2.webp" },
      { id: "ym7", name: "Gourmet Tavuklu püre", price: 35, img: "https://static.wixstatic.com/media/63853e_bb403555c79748769f00e7722369ff00~mv2.webp" },
      { id: "ym8", name: "Gourmet Hindili püre", price: 35, img: "https://static.wixstatic.com/media/63853e_9ec21e46bc9a4fee9419cd2c3bb69ea3~mv2.png" },
      { id: "ym9", name: "Gourmet Sığır etli parçalı", price: 35, img: "https://static.wixstatic.com/media/63853e_bfe4380af5d14e8f8efcb31c93bdaf5d~mv2.png" },
      { id: "ym10", name: "Felix Balıklı 4 lü paket", price: 35, img: "https://static.wixstatic.com/media/63853e_ea741bbbccb94588bb4474802b6f6b2a~mv2.webp" },
      { id: "ym11", name: "Felix sığır etli 4 lü paket", price: 35, img: "https://static.wixstatic.com/media/63853e_391b065853354f3189e16dd19d6c5740~mv2.webp" },
      { id: "ym12", name: "Felix Tavuklu 4 lü paket", price: 35, img: "https://static.wixstatic.com/media/63853e_391b065853354f3189e16dd19d6c5740~mv2.webp" },
      { id: "ym13", name: "Felix balıklı", price: 35, img: "https://static.wixstatic.com/media/63853e_dd5e5da1df5e454199d6aed14e2ee2b3~mv2.webp" },
      { id: "ym14", name: "Whiskas Yavru", price: 35, img: "https://static.wixstatic.com/media/63853e_34e6862ce457433ca338ca21ecc7d3b4~mv2.webp" },
      { id: "ym15", name: "Whiskas somonlu", price: 35, img: "https://static.wixstatic.com/media/63853e_57576c52a8f642db9862af5c7b18433a~mv2.webp" },
      { id: "ym16", name: "Whiskas tavuklu", price: 35, img: "https://static.wixstatic.com/media/63853e_9728768fd19a453f9c777814c9aa065c~mv2.webp" },
      { id: "ym17", name: "Whiskas 4 lü paket", price: 35, img: "https://static.wixstatic.com/media/63853e_0db3e0a784af43718970e7fe1a04caf3~mv2.webp" },
      { id: "ym18", name: "Royal canin light weight", price: 35, img: "https://static.wixstatic.com/media/63853e_c69fcd7a7d3c4270a47bff9523b88e0e~mv2.webp" },
      { id: "ym19", name: "Royal canin mother baby", price: 35, img: "https://static.wixstatic.com/media/63853e_de5049ec9e974190a42b8cb2be8228bc~mv2.webp" },
      { id: "ym20", name: "Royal canin kısır", price: 35, img: "https://static.wixstatic.com/media/63853e_1084369d1650446cbd48920526ed7be4~mv2.webp" },
      { id: "ym21", name: "Royal canin digest", price: 35, img: "https://static.wixstatic.com/media/63853e_61b9402cbf40406d9f6d54860835080e~mv2.webp" },
      { id: "ym22", name: "Royal canin yavru", price: 35, img: "https://static.wixstatic.com/media/63853e_56cd7e547910466883608157a2caba5e~mv2.webp" },
      { id: "ym23", name: "Royal canin persian", price: 35, img: "https://static.wixstatic.com/media/63853e_e5ea8ec709b54542803facdeb4a312b4~mv2.webp" },
      { id: "ym23b", name: "Royal canin british", price: 35, img: "https://static.wixstatic.com/media/63853e_b3c7a4bd6c004662a2685ecf39813c4d~mv2.webp" },
      { id: "ym24", name: "Royal canin hair skin", price: 35, img: "https://static.wixstatic.com/media/63853e_94a7b08aa0354421861919c5f0caf1a1~mv2.webp" },
      { id: "ym25", name: "Proplan Yavru", price: 35, img: "https://static.wixstatic.com/media/63853e_801d049f36044c729e520523c3cbf57d~mv2.webp" },
      { id: "ym26", name: "Proplan Kısır", price: 35, img: "https://static.wixstatic.com/media/63853e_aa4eefba0d3c4e29b85c60cf20cfa0ac~mv2.webp" },
      { id: "ym27", name: "Proplan Delicate", price: 35, img: "https://static.wixstatic.com/media/63853e_38763e9570074c2681264de15f56cf2e~mv2.webp" },
      { id: "ym28", name: "Hills Yavru balık", price: 35, img: "https://static.wixstatic.com/media/63853e_1f1e81c902db41dc92ed47f4bcf789ce~mv2.webp" },
      { id: "ym28b", name: "Hills Yavru Tavuk", price: 35, img: "https://static.wixstatic.com/media/63853e_41682154d6354c2eb3268bdace6b5991~mv2.webp" },
      { id: "ym29", name: "Hills kısır tavuk", price: 35, img: "https://static.wixstatic.com/media/63853e_f5fbb1f0d5fb4dbd928558822fdfb6b1~mv2.webp" },
      { id: "ym30", name: "Hills kısır somon", price: 35, img: "https://static.wixstatic.com/media/63853e_edf3a331394b4492a22978bbb85a0059~mv2.webp" },
      { id: "ym31", name: "Hills Biftekli", price: 35, img: "https://static.wixstatic.com/media/63853e_ed67312f72314e6e995d86d0061c1c41~mv2.webp" },
      { id: "ym32", name: "Hills kısır hindi", price: 35, img: "https://static.wixstatic.com/media/63853e_c8db9d41b1b64bbcb26758619889d59a~mv2.webp" },
      { id: "ym33", name: "Hills Balıklı", price: 35, img: "https://static.wixstatic.com/media/63853e_7582e1e9a3074d3ab72072859fa2a7fd~mv2.webp" },
    ],
  },
  {
    title: "BAKIM VE AKSESUAR",
    items: [
      { id: "ac1", name: "Kedi Kum Paspası", price: 150, img: "https://static.wixstatic.com/media/63853e_e361ac120a1741f8819d190f9848e966~mv2.webp" },
      { id: "ac2", name: "Tuvalet Elekli Torba", price: 140, img: "https://static.wixstatic.com/media/63853e_4374ed6a587b45c3a6b1a1e5ecc68b8e~mv2.webp" },
      { id: "ac3", name: "Kedi Kumu Paspası Büyük", price: 320, img: "https://static.wixstatic.com/media/63853e_362139b8f1594ad486829e546007e5ff~mv2.webp" },
      { id: "ac4", name: "Kedi Çimi", price: 120, img: "https://static.wixstatic.com/media/63853e_a50200ac42b24d359c2bee76f7429afa~mv2.webp" },
      { id: "ac5", name: "Parmak Diş Fırçası", price: 75, img: "https://static.wixstatic.com/media/63853e_20754be9f2e34752ae9492daef23c426~mv2.webp" },
      { id: "ac6", name: "Diş Macunu", price: 165, img: "https://static.wixstatic.com/media/63853e_5fa753fe4ff542a2b73a272c699cbe80~mv2.webp" },
      { id: "ac7", name: "Tüy toplama eldiveni", price: 180, img: "https://static.wixstatic.com/media/63853e_8728ca4f19c24e888cdfcce5f5c8e9c6~mv2.webp" },
      { id: "ac8", name: "Biberon", price: 80, img: "https://static.wixstatic.com/media/63853e_9bd5f4040be1448aab53663eb171e57a~mv2.webp" },
      { id: "ac9", name: "Yavru Kedi Süt Tozu", price: 250, img: "https://static.wixstatic.com/media/63853e_5ee7aa68527547f58cf0fcc07a011688~mv2.webp" },
      { id: "ac10", name: "Tüy Toplama büyük eldiven", price: 150, img: "https://static.wixstatic.com/media/63853e_546477b894c64e59a55333ce694f9ce9~mv2.webp" },
      { id: "ac11", name: "Bit Pire Tarağı", price: 80, img: "https://static.wixstatic.com/media/63853e_bc123a57e085418c8831fda209763e47~mv2.webp" },
      { id: "ac12", name: "Tırnak Makası", price: 125, img: "https://static.wixstatic.com/media/63853e_00712ac4e8b04bb4bf5218cad74e342a~mv2.webp" },
      { id: "ac13", name: "Crystal Göz Kulak Damlası", price: 420, img: "https://static.wixstatic.com/media/63853e_21104844a4c94febbd79721e33d8945e~mv2.webp" },
      { id: "ac14", name: "Dış Parazit Damlası", price: 180, img: "https://static.wixstatic.com/media/63853e_586e0943c2db4f4ebbb3c29665e0b94c~mv2.webp" },
      { id: "ac15", name: "Lazer", price: 125, img: "https://static.wixstatic.com/media/63853e_8f8cddbfb7ea4bbd9780377fd581cd2c~mv2.webp" },
      { id: "ac16", name: "Kedi Kumu Torbası", price: 420, img: "https://static.wixstatic.com/media/63853e_424a308beb89493cabbfcfbd867e39a1~mv2.webp" },
      { id: "ac17", name: "Kaşıma Aparatı", price: 180, img: "https://static.wixstatic.com/media/63853e_af771fe95149426dae46307a4ad35ed2~mv2.webp" },
      { id: "ac18", name: "Basmalı Tarak", price: 150, img: "https://static.wixstatic.com/media/63853e_f3c3fee937eb4e438b19cbe73dc4c834~mv2.webp" },
      { id: "ac19", name: "Buharlı Tarak", price: 140, img: "https://static.wixstatic.com/media/63853e_529c3ea3a7294684909b1264e7549151~mv2.webp" },
      { id: "ac20", name: "Somon Yağı", price: 320, img: "https://static.wixstatic.com/media/63853e_21504bc42ebb4f148798384c370564ba~mv2.webp" },
      { id: "ac21", name: "Şırınga hap yutturucu", price: 120, img: "https://static.wixstatic.com/media/63853e_46c1a65aefea46d5ad9f03092801caaf~mv2.webp" },
      { id: "ac22", name: "Matatabi diş çubuğu", price: 75, img: "https://static.wixstatic.com/media/63853e_fc5c988157444bfab7d877a390f57664~mv2.webp" },
      { id: "ac23", name: "Kedi Nanesi", price: 165, img: "https://static.wixstatic.com/media/63853e_8e3195c8eef7482f93cf450ae8612134~mv2.webp" },
      { id: "ac24", name: "Kedi Nanesi otu", price: 150, img: "https://static.wixstatic.com/media/63853e_1b35ef9c7ace4d4d95a34125b7ed4299~mv2.webp" },
      { id: "ac25", name: "Probiyotik Kedi İçin", price: 80, img: "https://static.wixstatic.com/media/63853e_381bd0962d9d4d9f897da55df0a07ea2~mv2.webp" },
      { id: "ac26", name: "Tiftik tüy toplayıcı", price: 165, img: "https://static.wixstatic.com/media/63853e_88e0a4610c444a60b5df72ea2c0ce3f4~mv2.webp" },
      { id: "ac27", name: "Koltuk Tüy toplayıcı", price: 150, img: "https://static.wixstatic.com/media/63853e_0d1124e5986d46ab80c8a10de5f27ec8~mv2.webp" },
    ],
  },
];

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "nakit", name: "Kapıda Nakit", disc: 0.1, tag: "%10 İndirim" },
  { id: "eft", name: "Banka Havalesi", disc: 0, tag: "Net" },
  { id: "qr", name: "Kapıda QR Ödeme", disc: 0, tag: "Net" },
  { id: "pos", name: "Kapıda Kredi Kartı", disc: 0, tag: "Net" },
];

export interface BrandProductCategory {
  brandName: string;
  brandSlug: string;
  animal: string;
  subcategory: string;
  products: Product[];
}

export const BRAND_PRODUCTS: BrandProductCategory[] = [
  {
    brandName: "Brit Care",
    brandSlug: "brit-care",
    animal: "kedi",
    subcategory: "kedi-mamasi",
    products: [
      { id: "bc1", name: "Brit Care Tahılsız Tavuk Etli Kısırlaştırılmış Üriner Destekli Yetişkin Kedi Maması 2 kg", price: 968.37, originalPrice: 1320, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-tavuk-etli-kisirlastirilmis-uriner-destekli-yetiskin-kedi-mamasi-2-kg-1066453-98-O.jpg" },
      { id: "bc2", name: "Brit Care Urinary Tavuklu Tahılsız Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2425.23, originalPrice: 2640, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-urinary-tavuklu-tahilsiz-kisirlastirilmis-yetiskin-kedi-mamasi-7-kg-1043638-98-O.jpg" },
      { id: "bc3", name: "Brit Care Sensitive Hipoalerjenik Hindili ve Somonlu Tahılsız Yetişkin Kedi Maması 2 kg", price: 930.62, originalPrice: 1320, skt: "06.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-fresh-hypoallergenic-hindili-ve-somonlu-kedi-mamasi-2-kg-1054420-18-O.jpg" },
      { id: "bc4", name: "Brit Care Immunity Prebiotik İçerikli Domuzlu Kısırlaştırılmış Kedi Maması 7 kg", price: 2480.17, originalPrice: 2860, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-care-immunity-prebiotik-icerikli-domuzlu-kisirlastirilmis-kedi-mamasi-7-kg-1043687-11-O.jpg" },
      { id: "bc5", name: "Brit Care Immunity Prebiotik İçerikli Domuzlu Kısırlaştırılmış Kedi Maması 2 kg", price: 1007.21, originalPrice: 1072.50, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-care-immunity-prebiotik-icerikli-domuzlu-kisirlastirilmis-kedi-mamasi-2-kg-1066475-11-O.jpg" },
      { id: "bc6", name: "Brit Care Tahılsız Indoor Anti Stress Tavuklu Kedi Maması 2 kg", price: 935.52, originalPrice: 979, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-indoor-anti-stress-tavuklu-kedi-mamasi-2-kg-1066474-10-O.jpg" },
      { id: "bc7", name: "Brit Care Haircare Hipoalerjenik Deri ve Tüy Sağlığı için Tahılsız Yetişkin Kedi Maması 2 kg", price: 935.04, originalPrice: 1385.89, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-care-haircare-hypo-allergenic-deri-ve-tuy-sagligi-icin-tahilsiz-yetiskin-kedi-mamasi-2-kg-1066175-98-O.jpg" },
      { id: "bc8", name: "Brit Care Tahılsız Senior Weight Control Tavuklu Yaşlı Kedi Maması 2 kg", price: 879.37, originalPrice: 979, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-senior-weight-control-tavuklu-yasli-kedi-mamasi-2-kg-1061769-98-O.jpg" },
      { id: "bc9", name: "Brit Care Sensitive Hipoalerjenik Böcek Proteinli Tahılsız Yetişkin Kedi Maması 7 kg", price: 2392.47, originalPrice: 2860, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-hypo-allergenic-bocek-proteinli-tahilsiz-yetiskin-kedi-mamasi-7-kg-1066110-65-O.jpg" },
      { id: "bc10", name: "Brit Premium Hipoalerjenik Sensitive Kuzu Etli Yetişkin Kedi Maması 8 kg", price: 2076.10, originalPrice: 2585, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-hypo-allergenic-sensitive-kuzu-etli-yetiskin-kedi-mamasi-8-kg-1055109-62-O.jpg" },
      { id: "bc11", name: "Brit Premium Tavuk Etli Kısırlaştırılmış Yetişkin Kedi Maması 8 kg", price: 1895.11, originalPrice: 2420, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-kisirlastirilmis-tavuk-etli-yetiskin-kedi-mamasi-8-kg-1056623-61-O.jpg" },
      { id: "bc12", name: "Brit Care Hindili ve Somonlu Tahılsız Yetişkin Kedi Maması 7 kg", price: 2530.25, originalPrice: 2860, skt: "09.2026", img: "https://www.mamatoptancisi.com/brit-care-hindili-ve-somonlu-tahilsiz-yetiskin-kedi-mamasi-7-kg-1067621-59-O.jpg" },
      { id: "bc13", name: "Brit Care Tahılsız Tavşan Etli Kısırlaştırılmış Yetişkin Kedi Maması 2 kg", price: 1034.31, originalPrice: 1078, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-tavsan-etli-kisirlastirilmis-yetiskin-kedi-mamasi-2-kg-1066468-58-O.jpg" },
      { id: "bc14", name: "Brit Care Deri ve Tüy Sağlığı İçin Tahılsız Kedi Maması 7 kg", price: 2542.01, originalPrice: 2860, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-deri-ve-tuy-sagligi-icin-tahilsiz-kedi-mamasi-7-kg-1055844-58-O.jpg" },
      { id: "bc15", name: "Brit Care Sensitive Tavşanlı Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2604.18, originalPrice: 2970, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sterilised-sensitive-tavsanli-yetiskin-kedi-mamasi-7-kg-1033811-56-O.jpg" },
      { id: "bc16", name: "Brit Premium Tavuklu Yavru Kedi Maması 8 kg", price: 1957.28, originalPrice: 2200, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-premium-tavuklu-yavru-kedi-mamasi-8-kg-1043762-55-O.jpg" },
      { id: "bc17", name: "Brit Premium Kuzu Etli Kısırlaştırılmış Yetişkin Kedi Maması 8 kg", price: 2241.52, originalPrice: 2585, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-kisirlastirilmis-kuzu-etli-yetiskin-kedi-mamasi-8-kg-1065059-55-O.jpg" },
      { id: "bc18", name: "Brit Care Tahılsız Ördek ve Hindi Etli Kısırlaştırılmış Diyet Yetişkin Kedi Maması 2 kg", price: 901.21, originalPrice: 979, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-ordek-ve-hindi-etli-kisirlastirilmis-diyet-yetiskin-kedi-mamasi-2-kg-1058354-48-O.jpg" },
      { id: "bc19", name: "Brit Care Ördekli Kilo Kontrollü Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2425.23, originalPrice: 2640, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-ordekli-kisirlastririlmis-kilo-kontrollu-yetiskin-kedi-mamasi-7-kg-1063572-48-O.jpg" },
      { id: "bc20", name: "Brit Care Gıda Toleransı Olan Kediler İçin Larva Proteinli Tahılsız Yetişkin Kedi Maması 2 kg", price: 891.13, originalPrice: 1034, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-allerji-kontrolu-tahilsiz-yetiskin-kedi-mamasi-2-kg-1043637-45-O.jpg" },
    ],
  },
];

export function getBrandProducts(animal: string, subcategory: string, brandSlug: string): BrandProductCategory | undefined {
  return BRAND_PRODUCTS.find(
    (bp) => bp.animal === animal && bp.subcategory === subcategory && bp.brandSlug === brandSlug
  );
}

export function getAllProducts(): Product[] {
  return [...MAIN_PRODUCTS, ...CATEGORIES.flatMap((c) => c.items), ...BRAND_PRODUCTS.flatMap((bp) => bp.products)];
}
