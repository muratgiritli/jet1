export interface Product {
  id: string;
  name: string;
  price: number;
  img?: string;
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
      { id: "wa1", name: "Vancat Aktif karbon 10 LT", price: 350, img: "https://static.wixstatic.com/media/63853e_9384878436614e8aaa93e64135617aa6~mv2.webp" },
      { id: "wa2", name: "Proplan Aktif karbon 10 LT", price: 340, img: "https://static.wixstatic.com/media/63853e_ee9c5edda98844a09668acf9f2d475ef~mv2.webp" },
      { id: "wa3", name: "Proline Lavanta 10 LT", price: 250, img: "https://static.wixstatic.com/media/63853e_d2838986016d4a77aa0f2eedf5a4548c~mv2.webp" },
      { id: "wa4", name: "Proline sade 10 LT", price: 250, img: "https://static.wixstatic.com/media/63853e_f1790a1876104a51adb5250e4d1fb7fb~mv2.webp" },
      { id: "wa5", name: "Proline Bebek Pudralı 10 LT", price: 250, img: "https://static.wixstatic.com/media/63853e_76cc0cfeddca4efd93c4682d469da7c3~mv2.webp" },
      { id: "wa6", name: "Proline Marsilya sabun 10 LT", price: 250, img: "https://static.wixstatic.com/media/63853e_7bf1b1aa19e040608515ccaab0f11b28~mv2.webp" },
      { id: "wa7", name: "Slika Kedi Kumu", price: 250, img: "https://static.wixstatic.com/media/63853e_57f2dd224aa142bba67e4b0baa4e959b~mv2.webp" },
      { id: "wa8", name: "Biokats Sade 5 LT", price: 450, img: "https://static.wixstatic.com/media/63853e_52add4318e304a16abb3518e9668dad6~mv2.webp" },
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

export function getAllProducts(): Product[] {
  return [...MAIN_PRODUCTS, ...CATEGORIES.flatMap((c) => c.items)];
}
