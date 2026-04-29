import React, { useEffect, useRef, useState } from 'react';
import './CustomerKiosk.css';
import { API_BASE } from '../../config/api.js';

const LANGUAGES = [
  { code: "en", label: "English", country: "us" },
  { code: "es", label: "Español", country: "es" },
  { code: "fr", label: "Français", country: "fr" },
  { code: "zh", label: "中文", country: "cn" },
  { code: "ja", label: "日本語", country: "jp" },
  { code: "ko", label: "한국어", country: "kr" },
  { code: "vi", label: "Tiếng Việt", country: "vn" }
];

const TRANSLATIONS = {
  "All": {
    es: "Todo", fr: "Tous", zh: "全部",
    ja: "すべて", ko: "전체", vi: "Tất cả"
  },
  "Coffee": {
    es: "Café", fr: "Café", zh: "咖啡",
    ja: "コーヒー", ko: "커피", vi: "Cà phê"
  },
  "Seasonal": {
    es: "Estacional", fr: "Saisonnier", zh: "季节性的",
    ja: "季節の", ko: "계절의", vi: "Theo mùa"
  },
  "Special Tea": {
    es: "Té especial", fr: "Thé spécial", zh: "特制茶",
    ja: "特選茶", ko: "특별 차", vi: "Trà đặc biệt"
  },
  "Milk Tea": {
    es: "Té con leche", fr: "Thé au lait", zh: "奶茶",
    ja: "ミルクティー", ko: "밀크티", vi: "Trà sữa"
  },
  "Fruit Tea": {
    es: "Té de fruta", fr: "Thé aux fruits", zh: "水果茶",
    ja: "フルーツティー", ko: "과일차", vi: "Trà trái cây"
  },
  "Slushies": {
    es: "Granizados", fr: "Granités", zh: "冰沙",
    ja: "スラッシー", ko: "슬러시", vi: "Đá xay"
  },

  "Boba Bytes": {
    es: "Boba Bytes", fr: "Boba Bytes", zh: "Boba Bytes",
    ja: "Boba Bytes", ko: "Boba Bytes", vi: "Boba Bytes"
  },
  "Boba Buddy": {
    es: "Boba Buddy", fr: "Boba Buddy", zh: "Boba Buddy",
    ja: "Boba Buddy", ko: "Boba Buddy", vi: "Boba Buddy"
  },
  "You": {
    es: "Tú", fr: "Vous", zh: "你",
    ja: "あなた", ko: "당신", vi: "Bạn"
  },
  "Text Size": {
    es: "Tamaño de Texto", fr: "Taille du texte", zh: "文字大小",
    ja: "文字サイズ", ko: "글자 크기", vi: "Cỡ chữ"
  },
  "Decrease text size": {
    es: "Reducir tamaño de texto", fr: "Diminuer la taille du texte", zh: "减小字号",
    ja: "文字を小さく", ko: "글자 크기 줄이기", vi: "Giảm cỡ chữ"
  },
  "Increase text size": {
    es: "Aumentar tamaño de texto", fr: "Augmenter la taille du texte", zh: "放大字号",
    ja: "文字を大きく", ko: "글자 크기 늘리기", vi: "Tăng cỡ chữ"
  },
  "Speaker On": {
    es: "Audio Activado", fr: "Audio Activé", zh: "音频开启",
    ja: "音声オン", ko: "음성 켜짐", vi: "Bật loa"
  },
  "Speaker Off": {
    es: "Audio Desactivado", fr: "Audio Désactivé", zh: "音频关闭",
    ja: "音声オフ", ko: "음성 꺼짐", vi: "Tắt loa"
  },
  "Keyboard On": {
    es: "Teclado Activado", fr: "Clavier Activé", zh: "键盘开启",
    ja: "キーボードオン", ko: "키보드 켜짐", vi: "Bật bàn phím"
  },
  "Keyboard Off": {
    es: "Teclado Desactivado", fr: "Clavier Désactivé", zh: "键盘关闭",
    ja: "キーボードオフ", ko: "키보드 꺼짐", vi: "Tắt bàn phím"
  },
  "Your Cart": {
    es: "Tu Carrito", fr: "Votre Panier", zh: "您的购物车",
    ja: "カート", ko: "장바구니", vi: "Giỏ hàng"
  },
  "Tap any drink to start your order": {
    es: "Toca una bebida para comenzar tu orden",
    fr: "Touchez une boisson pour commencer votre commande",
    zh: "点击任意饮品开始下单",
    ja: "ドリンクをタップして注文を開始",
    ko: "음료를 탭하여 주문을 시작하세요",
    vi: "Chạm vào đồ uống để bắt đầu đặt hàng"
  },
  "Total": {
    es: "Total", fr: "Total", zh: "总计",
    ja: "合計", ko: "합계", vi: "Tổng"
  },
  "Place Order": {
    es: "Realizar Pedido", fr: "Passer la commande", zh: "下单",
    ja: "注文する", ko: "주문하기", vi: "Đặt hàng"
  },
  "Customize": {
    es: "Personalizar", fr: "Personnaliser", zh: "定制",
    ja: "カスタマイズ", ko: "맞춤 설정", vi: "Tùy chỉnh"
  },
  "Size": {
    es: "Tamaño", fr: "Taille", zh: "尺寸",
    ja: "サイズ", ko: "크기", vi: "Cỡ"
  },
  "Temperature": {
    es: "Temperatura", fr: "Température", zh: "温度",
    ja: "温度", ko: "온도", vi: "Nhiệt độ"
  },
  "Hot": {
    es: "Caliente", fr: "Chaud", zh: "热",
    ja: "ホット", ko: "핫", vi: "Nóng"
  },
  "Cold": {
    es: "Frío", fr: "Froid", zh: "冷",
    ja: "コールド", ko: "차가움", vi: "Lạnh"
  },
  "Edit": {
    es: "Editar", fr: "Modifier", zh: "编辑",
    ja: "編集", ko: "수정", vi: "Sửa"
  },
  "Ice": {
    es: "Hielo", fr: "Glace", zh: "冰量",
    ja: "氷", ko: "얼음", vi: "Đá"
  },
  "Sugar": {
    es: "Azúcar", fr: "Sucre", zh: "糖度",
    ja: "砂糖", ko: "당도", vi: "Đường"
  },
  "Toppings": {
    es: "Toppings", fr: "Garnitures", zh: "配料",
    ja: "トッピング", ko: "토핑", vi: "Topping"
  },
  "Add to Cart": {
    es: "Agregar al Carrito", fr: "Ajouter au panier", zh: "加入购物车",
    ja: "カートに追加", ko: "장바구니에 담기", vi: "Thêm vào giỏ"
  },
  "Save Changes": {
    es: "Guardar Cambios", fr: "Enregistrer", zh: "保存更改",
    ja: "変更を保存", ko: "변경 저장", vi: "Lưu thay đổi"
  },
  "Cancel": {
    es: "Cancelar", fr: "Annuler", zh: "取消",
    ja: "キャンセル", ko: "취소", vi: "Hủy"
  },
  "Language": {
    es: "Idioma", fr: "Langue", zh: "语言",
    ja: "言語", ko: "언어", vi: "Ngôn ngữ"
  },
  "Send": {
    es: "Enviar", fr: "Envoyer", zh: "发送",
    ja: "送信", ko: "보내기", vi: "Gửi"
  },
  "Tell me the weather, allergies, diet ...": {
    es: "Dime el clima, alergias, dieta...",
    fr: "Dites-moi la météo, allergies, régime...",
    zh: "告诉我天气、过敏、饮食...",
    ja: "天気、アレルギー、食事を教えて...",
    ko: "날씨, 알레르기, 식단을 알려주세요...",
    vi: "Cho tôi biết thời tiết, dị ứng, chế độ ăn..."
  },
  "Thinking of a drink for you...": {
    es: "Pensando en una bebida para ti...",
    fr: "Je réfléchis à une boisson pour vous...",
    zh: "正在为您挑选饮品...",
    ja: "ドリンクを考えています...",
    ko: "음료를 생각 중이에요...",
    vi: "Đang nghĩ đồ uống cho bạn..."
  },
  "Checking today's weather...": {
    es: "Comprobando el clima de hoy...",
    fr: "Vérification de la météo d'aujourd'hui...",
    zh: "正在查看今天的天气...",
    ja: "今日の天気を確認しています...",
    ko: "오늘 날씨를 확인 중입니다...",
    vi: "Đang kiểm tra thời tiết hôm nay..."
  },
  "It's hot today! Try a refreshing fruit tea like Mango Green Tea or Lychee Oolong.": {
    es: "¡Hace calor hoy! Prueba un té de fruta refrescante como el té verde de mango o el oolong de lichi.",
    fr: "Il fait chaud aujourd'hui ! Essayez un thé aux fruits rafraîchissant comme le thé vert à la mangue ou l'oolong au litchi.",
    zh: "今天很热！试试清爽的水果茶，比如芒果绿茶或荔枝乌龙。",
    ja: "今日は暑いですね！マンゴーグリーンティーやライチウーロンのような爽やかなフルーツティーがおすすめです。",
    ko: "오늘은 덥네요! 망고 그린티나 리치 우롱 같은 시원한 과일차를 드셔보세요.",
    vi: "Hôm nay trời nóng! Hãy thử trà trái cây mát lạnh như Trà xanh xoài hoặc Trà ô long vải."
  },
  "It's chilly outside. A warm drink like Thai Milk Tea or Roasted Oolong Milk Tea would be perfect.": {
    es: "Hace frío afuera. Una bebida caliente como el té tailandés con leche o el té oolong tostado con leche sería perfecta.",
    fr: "Il fait frais dehors. Une boisson chaude comme le thé thaï au lait ou le thé au lait oolong torréfié serait parfaite.",
    zh: "外面有点冷。泰式奶茶或烘焙乌龙奶茶这样的热饮会很合适。",
    ja: "外は少し肌寒いです。タイミルクティーや焙煎ウーロンミルクティーのような温かい飲み物がぴったりです。",
    ko: "밖이 쌀쌀하네요. 타이 밀크티나 로스팅 우롱 밀크티 같은 따뜻한 음료가 좋습니다.",
    vi: "Bên ngoài hơi lạnh. Một thức uống ấm như Trà sữa Thái hoặc Trà sữa ô long rang sẽ rất hợp."
  },
  "Rainy weather calls for something cozy - maybe a Classic Milk Tea.": {
    es: "El clima lluvioso pide algo reconfortante: quizá un té de leche clásico.",
    fr: "Le temps pluvieux appelle quelque chose de réconfortant — peut-être un thé au lait classique.",
    zh: "下雨天适合来点温暖舒适的饮品——也许是一杯经典奶茶。",
    ja: "雨の日はほっとするものがいいですね。クラシックミルクティーはいかがでしょう。",
    ko: "비 오는 날엔 포근한 음료가 좋죠 — 클래식 밀크티가 어울립니다.",
    vi: "Trời mưa hợp với một món ấm cúng — có lẽ là Trà sữa cổ điển."
  },
  "Weather looks nice today! Pick anything you like.": {
    es: "¡El clima está agradable hoy! Elige lo que quieras.",
    fr: "La météo est agréable aujourd'hui ! Choisissez ce que vous voulez.",
    zh: "今天天气很好！随你喜欢点吧。",
    ja: "今日はいい天気ですね！お好きなものをどうぞ。",
    ko: "오늘 날씨가 좋네요! 원하는 걸 골라보세요.",
    vi: "Hôm nay thời tiết đẹp! Hãy chọn món bạn thích."
  },

  "Unknown": {
    es: "Desconocido", fr: "Inconnu", zh: "未知",
    ja: "不明", ko: "알 수 없음", vi: "Không rõ"
  },
  "College Station, Texas": {
    es: "College Station, Texas", fr: "College Station, Texas", zh: "德克萨斯州大学城",
    ja: "テキサス州カレッジステーション", ko: "텍사스주 칼리지스테이션", vi: "College Station, Texas"
  },
  "College Station Texas": {
    es: "College Station, Texas", fr: "College Station, Texas", zh: "德克萨斯州大学城",
    ja: "テキサス州カレッジステーション", ko: "텍사스주 칼리지스테이션", vi: "College Station, Texas"
  },
  "College, Station Texas": {
    es: "College Station, Texas", fr: "College Station, Texas", zh: "德克萨斯州大学城",
    ja: "テキサス州カレッジステーション", ko: "텍사스주 칼리지스테이션", vi: "College Station, Texas"
  },
  "College Station": {
    es: "College Station", fr: "College Station", zh: "College Station",
    ja: "College Station", ko: "College Station", vi: "College Station"
  },
  "Feels": {
    es: "Sensación", fr: "Ressenti", zh: "体感",
    ja: "体感", ko: "체감", vi: "Cảm giác"
  },
  "Humidity": {
    es: "Humedad", fr: "Humidité", zh: "湿度",
    ja: "湿度", ko: "습도", vi: "Độ ẩm"
  },
  "Wind": {
    es: "Viento", fr: "Vent", zh: "风速",
    ja: "風", ko: "바람", vi: "Gió"
  },

  // Drink names
  "classic milk tea": {
    es: "Té de leche clásico", fr: "Thé au lait classique", zh: "经典奶茶",
    ja: "クラシックミルクティー", ko: "클래식 밀크티", vi: "Trà sữa cổ điển"
  },
  "thai milk tea": {
    es: "Té de leche Thai", fr: "Thé au lait thaï", zh: "泰式奶茶",
    ja: "タイミルクティー", ko: "타이 밀크티", vi: "Trà sữa Thái"
  },
  "taro milk tea": {
    es: "Té de leche de taro", fr: "Thé au lait de taro", zh: "芋头奶茶",
    ja: "タロイモミルクティー", ko: "타로 밀크티", vi: "Trà sữa khoai môn"
  },
  "matcha milk tea": {
    es: "Té de leche de matcha", fr: "Thé au lait matcha", zh: "抹茶奶茶",
    ja: "抹茶ミルクティー", ko: "말차 밀크티", vi: "Trà sữa matcha"
  },
  "okinawa brown sugar milk tea": {
    es: "Té de leche con azúcar morena de Okinawa",
    fr: "Thé au lait sucre brun d'Okinawa",
    zh: "冲绳黑糖奶茶",
    ja: "沖縄黒糖ミルクティー",
    ko: "오키나와 흑당 밀크티",
    vi: "Trà sữa đường nâu Okinawa"
  },
  "honey green milk tea": {
    es: "Té verde con miel y leche",
    fr: "Thé vert au miel et lait",
    zh: "蜂蜜绿奶茶",
    ja: "ハニーグリーンミルクティー",
    ko: "허니 그린 밀크티",
    vi: "Trà xanh mật ong sữa"
  },
  "wintermelon milk tea": {
    es: "Té de leche de melón de invierno",
    fr: "Thé au lait de melon d'hiver",
    zh: "冬瓜奶茶",
    ja: "冬瓜ミルクティー",
    ko: "동과 밀크티",
    vi: "Trà sữa bí đao"
  },
  "coffee milk tea": {
    es: "Té de leche con café", fr: "Thé au lait au café", zh: "咖啡奶茶",
    ja: "コーヒーミルクティー", ko: "커피 밀크티", vi: "Trà sữa cà phê"
  },
  "mango green tea": {
    es: "Té verde de mango", fr: "Thé vert à la mangue", zh: "芒果绿茶",
    ja: "マンゴーグリーンティー", ko: "망고 녹차", vi: "Trà xanh xoài"
  },
  "strawberry fruit tea": {
    es: "Té de fruta de fresa", fr: "Thé aux fraises", zh: "草莓水果茶",
    ja: "ストロベリーフルーツティー", ko: "딸기 과일차", vi: "Trà trái cây dâu"
  },
  "peach black tea": {
    es: "Té negro de durazno", fr: "Thé noir à la pêche", zh: "蜜桃红茶",
    ja: "ピーチブラックティー", ko: "복숭아 홍차", vi: "Trà đen đào"
  },
  "lychee oolong tea": {
    es: "Té oolong de lichi", fr: "Thé oolong au litchi", zh: "荔枝乌龙茶",
    ja: "ライチウーロン茶", ko: "리치 우롱차", vi: "Trà ô long vải"
  },
  "additional boba": {
    es: "Boba adicional", fr: "Boba supplémentaire", zh: "额外珍珠",
    ja: "追加タピオカ", ko: "추가 버블", vi: "Thêm trân châu"
  },
  "coffee fruit tea": {
    es: "Té de fruta con café", fr: "Thé aux fruits et café", zh: "咖啡水果茶",
    ja: "コーヒーフルーツティー", ko: "커피 과일차", vi: "Trà trái cây cà phê"
  },
  "mango milk tea": {
    es: "Té de leche de mango", fr: "Thé au lait à la mangue", zh: "芒果奶茶",
    ja: "マンゴーミルクティー", ko: "망고 밀크티", vi: "Trà sữa xoài"
  },
  "kiwi fruit tea": {
    es: "Té de kiwi", fr: "Thé au kiwi", zh: "奇异果水果茶",
    ja: "キウイフルーツティー", ko: "키위 과일차", vi: "Trà trái cây kiwi"
  },
  "passionfruit green tea": {
    es: "Té verde de maracuyá", fr: "Thé vert aux fruits de la passion",
    zh: "百香果绿茶", ja: "パッションフルーツグリーンティー",
    ko: "패션프루트 녹차", vi: "Trà xanh chanh dây"
  },

  // Toppings
  "boba": {
    es: "Boba", fr: "Boba", zh: "珍珠",
    ja: "タピオカ", ko: "버블", vi: "Trân châu"
  },
  "coffee jelly": {
    es: "Jalea de café", fr: "Gelée de café", zh: "咖啡冻",
    ja: "コーヒーゼリー", ko: "커피 젤리", vi: "Thạch cà phê"
  },
  "ice cream": {
    es: "Helado", fr: "Crème glacée", zh: "冰淇淋",
    ja: "アイスクリーム", ko: "아이스크림", vi: "Kem"
  },
  "taro balls": {
    es: "Bolas de taro", fr: "Boules de taro", zh: "芋圆",
    ja: "タロイモボール", ko: "타로 볼", vi: "Viên khoai môn"
  },
  "rainbow jelly": {
    es: "Gelatina arcoíris", fr: "Gelée arc-en-ciel", zh: "彩虹椰果",
    ja: "レインボーゼリー", ko: "레인보우 젤리", vi: "Thạch cầu vồng"
  },
  "red bean": {
    es: "Frijol rojo", fr: "Haricot rouge", zh: "红豆",
    ja: "あずき", ko: "팥", vi: "Đậu đỏ"
  },

  // New drinks (ticket SCRUM-63)
  "caramel macchiato": {
    es: "Caramel Macchiato", fr: "Caramel Macchiato", zh: "焦糖玛奇朵",
    ja: "キャラメルマキアート", ko: "카라멜 마키아토", vi: "Caramel Macchiato"
  },
  "hazelnut latte": {
    es: "Latte de avellana", fr: "Latte noisette", zh: "榛果拿铁",
    ja: "ヘーゼルナッツラテ", ko: "헤이즐넛 라떼", vi: "Latte hạt dẻ"
  },
  "vietnamese iced coffee": {
    es: "Café helado vietnamita", fr: "Café glacé vietnamien", zh: "越南冰咖啡",
    ja: "ベトナムアイスコーヒー", ko: "베트남식 아이스커피", vi: "Cà phê sữa đá"
  },
  "roasted oolong milk tea": {
    es: "Té de leche de oolong tostado", fr: "Thé au lait oolong torréfié",
    zh: "烘焙乌龙奶茶", ja: "焙煎ウーロンミルクティー",
    ko: "로스팅 우롱 밀크티", vi: "Trà sữa ô long rang"
  },
  "vanilla milk tea": {
    es: "Té de leche de vainilla", fr: "Thé au lait vanille", zh: "香草奶茶",
    ja: "バニラミルクティー", ko: "바닐라 밀크티", vi: "Trà sữa vani"
  },
  "chocolate milk tea": {
    es: "Té de leche de chocolate", fr: "Thé au lait au chocolat",
    zh: "巧克力奶茶", ja: "チョコレートミルクティー",
    ko: "초콜릿 밀크티", vi: "Trà sữa socola"
  },
  "pumpkin spice milk tea": {
    es: "Té de leche de especias de calabaza",
    fr: "Thé au lait aux épices de citrouille",
    zh: "南瓜香料奶茶", ja: "パンプキンスパイスミルクティー",
    ko: "펌킨 스파이스 밀크티", vi: "Trà sữa bí ngô gia vị"
  },
  "cherry blossom tea": {
    es: "Té de flor de cerezo", fr: "Thé à la fleur de cerisier",
    zh: "樱花茶", ja: "桜茶",
    ko: "벚꽃차", vi: "Trà hoa anh đào"
  },
  "brown sugar oolong tea": {
    es: "Té oolong con azúcar morena", fr: "Thé oolong au sucre brun",
    zh: "黑糖乌龙茶", ja: "黒糖ウーロン茶",
    ko: "흑당 우롱차", vi: "Trà ô long đường nâu"
  },
  "jasmine green tea": {
    es: "Té verde de jazmín", fr: "Thé vert au jasmin", zh: "茉莉绿茶",
    ja: "ジャスミングリーンティー", ko: "재스민 녹차", vi: "Trà xanh hoa nhài"
  },
  "Hot Drinks": {
    es: "Bebidas Calientes", fr: "Boissons Chaudes", zh: "热饮",
    ja: "ホットドリンク", ko: "핫 드링크", vi: "Đồ uống nóng"
  },
  // Hot Drinks & Slushies — drink names
  "hot caramel latte": {
    es: "Latte de Caramelo Caliente", fr: "Latte Caramel Chaud", zh: "热焦糖拿铁",
    ja: "ホットキャラメルラテ", ko: "핫 카라멜 라떼", vi: "Latte caramel nóng"
  },
  "hot mocha": {
    es: "Moca Caliente", fr: "Moka Chaud", zh: "热摩卡",
    ja: "ホットモカ", ko: "핫 모카", vi: "Mocha nóng"
  },
  "espresso": {
    es: "Espresso", fr: "Espresso", zh: "浓缩咖啡",
    ja: "エスプレッソ", ko: "에스프레소", vi: "Espresso"
  },
  "vanilla chai latte": {
    es: "Chai Latte de Vainilla", fr: "Chai Latte Vanille", zh: "香草茶拿铁",
    ja: "バニラチャイラテ", ko: "바닐라 차이 라떼", vi: "Latte chai vani"
  },
  "masala chai": {
    es: "Chai Masala", fr: "Chai Masala", zh: "马萨拉奶茶",
    ja: "マサラチャイ", ko: "마살라 차이", vi: "Trà masala"
  },
  "london fog": {
    es: "London Fog", fr: "London Fog", zh: "伦敦雾",
    ja: "ロンドンフォグ", ko: "런던 포그", vi: "London Fog"
  },
  "mango slushie": {
    es: "Granizado de Mango", fr: "Granité Mangue", zh: "芒果冰沙",
    ja: "マンゴースラッシー", ko: "망고 슬러시", vi: "Đá xay xoài"
  },
  "strawberry slushie": {
    es: "Granizado de Fresa", fr: "Granité Fraise", zh: "草莓冰沙",
    ja: "ストロベリースラッシー", ko: "딸기 슬러시", vi: "Đá xay dâu"
  },
  "blue raspberry slushie": {
    es: "Granizado de Frambuesa Azul", fr: "Granité Framboise Bleue", zh: "蓝莓冰沙",
    ja: "ブルーラズベリースラッシー", ko: "블루 라즈베리 슬러시", vi: "Đá xay mâm xôi xanh"
  },
  // Hot Drinks & Slushies — descriptions
  "Velvety steamed milk with rich caramel and a bold espresso shot.": {
    es: "Leche vaporizada aterciopelada con rico caramelo y un shot de espresso intenso.",
    fr: "Lait vapeur velouté avec caramel riche et un shot d'espresso corsé.",
    zh: "丝滑蒸奶搭配浓郁焦糖与浓缩咖啡。",
    ja: "滑らかなスチームミルクにリッチなキャラメルとエスプレッソ。",
    ko: "부드러운 스팀 밀크에 진한 캐러멜과 에스프레소 샷.",
    vi: "Sữa hấp mượt mà với caramel đậm và một shot espresso."
  },
  "Rich chocolate and espresso blended with steamed milk and cocoa.": {
    es: "Chocolate intenso y espresso con leche vaporizada y cacao.",
    fr: "Chocolat riche et espresso mélangés avec lait vapeur et cacao.",
    zh: "浓郁巧克力与浓缩咖啡融合蒸奶和可可。",
    ja: "濃厚なチョコレートとエスプレッソをスチームミルクとココアで。",
    ko: "진한 초콜릿과 에스프레소를 스팀 밀크와 코코아로.",
    vi: "Socola đậm và espresso hòa quyện sữa hấp và cacao."
  },
  "A clean, intense shot of pure espresso with a golden crema.": {
    es: "Un shot limpio e intenso de espresso puro con crema dorada.",
    fr: "Un shot pur et intense d'espresso avec une crema dorée.",
    zh: "一杯纯净浓烈的浓缩咖啡，顶部金色油脂。",
    ja: "ゴールデンクレマが美しい純粋で力強いエスプレッソ。",
    ko: "황금빛 크레마의 깔끔하고 강렬한 순수 에스프레소.",
    vi: "Một shot espresso thuần khiết, đậm đà với lớp crema vàng."
  },
  "Creamy vanilla-infused chai with warming spices and frothy milk.": {
    es: "Chai cremoso con vainilla, especias cálidas y leche espumosa.",
    fr: "Chai crémeux à la vanille avec épices chaudes et lait mousseux.",
    zh: "香草风味茶饮配温暖香料与泡沫牛奶。",
    ja: "バニラ香るチャイにスパイスとフォームミルク。",
    ko: "바닐라 향 차이에 따뜻한 향신료와 거품 우유.",
    vi: "Chai vani béo ngậy với gia vị ấm và sữa bọt."
  },
  "Traditional Indian spiced tea with cardamom, cinnamon, and ginger.": {
    es: "Té indio tradicional con cardamomo, canela y jengibre.",
    fr: "Thé indien traditionnel aux cardamome, cannelle et gingembre.",
    zh: "传统印度香料茶，含豆蔻、肉桂和生姜。",
    ja: "カルダモン、シナモン、ジンジャーの伝統インドチャイ。",
    ko: "카다몬, 시나몬, 생강의 전통 인도 스파이스 차.",
    vi: "Trà Ấn Độ truyền thống với thảo quả, quế và gừng."
  },
  "Earl Grey tea with vanilla, steamed milk, and a hint of lavender.": {
    es: "Té Earl Grey con vainilla, leche vaporizada y un toque de lavanda.",
    fr: "Thé Earl Grey avec vanille, lait vapeur et une pointe de lavande.",
    zh: "伯爵茶搭配香草、蒸奶与淡淡薰衣草。",
    ja: "アールグレイにバニラ、スチームミルク、ラベンダーの香り。",
    ko: "얼 그레이 티에 바닐라, 스팀 밀크, 라벤더 향.",
    vi: "Trà Earl Grey với vani, sữa hấp và chút oải hương."
  },
  "Frozen mango blended into a thick, icy tropical slush.": {
    es: "Mango congelado en un granizado tropical espeso y helado.",
    fr: "Mangue glacée mixée en granité tropical épais et givré.",
    zh: "冷冻芒果搅拌成浓郁热带冰沙。",
    ja: "凍ったマンゴーを濃厚なトロピカルスラッシュに。",
    ko: "얼린 망고를 진하고 차가운 열대 슬러시로.",
    vi: "Xoài đông lạnh xay thành đá xay nhiệt đới đặc sánh."
  },
  "Sweet strawberry puree swirled into a frosty, refreshing slush.": {
    es: "Puré de fresa dulce en un granizado helado y refrescante.",
    fr: "Purée de fraises sucrée en granité givré et rafraîchissant.",
    zh: "甜草莓酱融入冰爽清新冰沙。",
    ja: "甘いストロベリーピューレの爽やかなフロストスラッシュ。",
    ko: "달콤한 딸기 퓨레가 어우러진 시원한 슬러시.",
    vi: "Mứt dâu ngọt hòa quyện trong đá xay mát lạnh."
  },
  "Tangy blue raspberry blended into a vibrant frozen slushie.": {
    es: "Frambuesa azul ácida en un granizado helado vibrante.",
    fr: "Framboise bleue acidulée mixée en granité glacé vibrant.",
    zh: "酸甜蓝莓搅拌成鲜艳冰沙。",
    ja: "爽やかなブルーラズベリーの鮮やかなフローズンスラッシー。",
    ko: "상큼한 블루 라즈베리의 선명한 프로즌 슬러시.",
    vi: "Mâm xôi xanh chua ngọt xay thành đá xay rực rỡ."
  },


  // New descriptions (ticket SCRUM-63)
  "Rich espresso layered with silky vanilla milk and buttery caramel drizzle.": {
    es: "Espresso intenso sobre leche de vainilla sedosa con un toque de caramelo mantecoso.",
    fr: "Expresso riche en couches avec un lait vanillé soyeux et un filet de caramel beurré.",
    zh: "浓郁浓缩咖啡配丝滑香草牛奶和奶油焦糖酱。",
    ja: "濃厚なエスプレッソに滑らかなバニラミルクとバターキャラメル。",
    ko: "진한 에스프레소에 부드러운 바닐라 우유와 버터 캐러멜 드리즐.",
    vi: "Espresso đậm đà xếp lớp với sữa vani mượt và siro caramel bơ."
  },
  "Smooth espresso with nutty hazelnut syrup and creamy steamed milk.": {
    es: "Espresso suave con jarabe de avellanas y leche vaporizada cremosa.",
    fr: "Expresso onctueux avec sirop noisette et lait vapeur crémeux.",
    zh: "丝滑浓缩咖啡搭配榛果糖浆与浓郁蒸奶。",
    ja: "滑らかなエスプレッソにヘーゼルナッツシロップとクリーミーなスチームミルク。",
    ko: "부드러운 에스프레소에 고소한 헤이즐넛 시럽과 크리미한 스팀 밀크.",
    vi: "Espresso mượt với siro hạt dẻ thơm và sữa hấp béo."
  },
  "Strong dark roast poured over sweet condensed milk, chilled over ice.": {
    es: "Café oscuro fuerte vertido sobre leche condensada dulce, con hielo.",
    fr: "Café torréfié fort versé sur du lait concentré sucré, glacé.",
    zh: "浓郁深焙咖啡倒入甜炼乳中，冰镇享用。",
    ja: "濃いダークローストを甘い練乳にのせ、氷で冷やしたコーヒー。",
    ko: "진한 다크 로스트를 달콤한 연유 위에 부어 얼음과 함께 차갑게.",
    vi: "Cà phê rang đậm rót lên sữa đặc ngọt, uống lạnh với đá."
  },
  "Toasty roasted oolong balanced with creamy milk for a nutty finish.": {
    es: "Oolong tostado equilibrado con leche cremosa y un final de sabor a nuez.",
    fr: "Oolong torréfié équilibré avec du lait crémeux, finale noisetée.",
    zh: "烘焙乌龙香气与奶香平衡，带有坚果尾韵。",
    ja: "香ばしい焙煎ウーロンにクリーミーなミルクでナッツの余韻。",
    ko: "고소한 로스팅 우롱에 크리미한 우유, 견과류 여운.",
    vi: "Ô long rang thơm hòa quyện sữa béo, hậu vị bùi hạt."
  },
  "Classic black milk tea infused with sweet Madagascar vanilla.": {
    es: "Té negro clásico con leche infusionado con dulce vainilla de Madagascar.",
    fr: "Thé noir au lait classique infusé à la vanille douce de Madagascar.",
    zh: "经典黑奶茶融入甘甜的马达加斯加香草。",
    ja: "クラシックなブラックミルクティーに甘いマダガスカルバニラ。",
    ko: "클래식 블랙 밀크티에 달콤한 마다가스카르 바닐라.",
    vi: "Trà đen sữa cổ điển hòa quyện vani Madagascar ngọt ngào."
  },
  "Rich cocoa blended with creamy milk tea for a dessert-like sip.": {
    es: "Cacao intenso mezclado con té de leche cremoso, como un postre.",
    fr: "Cacao riche mélangé au thé au lait crémeux, comme un dessert.",
    zh: "浓郁可可与奶茶融合，宛如甜点一般。",
    ja: "濃厚なココアとクリーミーなミルクティーがデザート感覚。",
    ko: "진한 코코아와 크리미한 밀크티가 디저트 같은 한 모금.",
    vi: "Ca cao đậm đà quyện trà sữa béo, ngọt như món tráng miệng."
  },
  "Warm pumpkin, cinnamon and nutmeg swirled into cozy milk tea.": {
    es: "Calabaza, canela y nuez moscada en un té de leche reconfortante.",
    fr: "Potiron, cannelle et muscade fondus dans un thé au lait réconfortant.",
    zh: "温暖南瓜、肉桂与肉豆蔻融入温馨奶茶。",
    ja: "かぼちゃ、シナモン、ナツメグを温かいミルクティーに。",
    ko: "따뜻한 호박, 계피, 넛맥이 아늑한 밀크티에 어우러짐.",
    vi: "Bí ngô ấm, quế và nhục đậu khấu hòa trong trà sữa ấm áp."
  },
  "Delicate sakura and white tea for a lightly floral spring sip.": {
    es: "Sakura delicada y té blanco para un sorbo floral de primavera.",
    fr: "Sakura délicat et thé blanc pour une gorgée florale de printemps.",
    zh: "细腻樱花与白茶，轻盈花香的春日一饮。",
    ja: "繊細な桜とホワイトティーで春の花の香り。",
    ko: "섬세한 벚꽃과 백차로 가벼운 봄 꽃 한 모금.",
    vi: "Hoa anh đào tinh tế và trà trắng, hương hoa xuân nhẹ nhàng."
  },
  "Caramelized brown sugar drizzled over fragrant roasted oolong.": {
    es: "Azúcar morena caramelizada sobre oolong tostado y fragante.",
    fr: "Sucre brun caramélisé sur un oolong torréfié parfumé.",
    zh: "焦糖黑糖淋在香气四溢的烘焙乌龙上。",
    ja: "キャラメライズした黒糖を香ばしい焙煎ウーロンに。",
    ko: "캐러멜라이즈드 흑당이 향긋한 로스팅 우롱에.",
    vi: "Đường nâu caramen rưới lên ô long rang thơm nức."
  },
  "Fragrant jasmine petals steeped with fresh green tea leaves.": {
    es: "Pétalos de jazmín fragantes infusionados con hojas de té verde.",
    fr: "Pétales de jasmin parfumés infusés avec des feuilles de thé vert frais.",
    zh: "芬芳茉莉花瓣与新鲜绿茶叶一同冲泡。",
    ja: "香り高いジャスミンの花と新鮮な緑茶葉を一緒に。",
    ko: "향긋한 재스민 꽃잎과 신선한 녹차 잎을 함께.",
    vi: "Hoa nhài thơm ngát ủ cùng lá trà xanh tươi."
  },
  "Chewy fruit-flavored jellies that add a burst of color and taste.": {
    es: "Gelatinas masticables con sabor a frutas que añaden color y sabor.",
    fr: "Gelées fruitées moelleuses qui apportent couleur et saveur.",
    zh: "嚼劲十足的水果味果冻，带来色彩与风味。",
    ja: "フルーツ味のもちもちゼリーで色と味が弾ける。",
    ko: "쫀득한 과일 맛 젤리로 색과 맛이 팡!",
    vi: "Thạch trái cây dai đầy màu sắc và hương vị."
  },
  "Sweet simmered azuki red beans with a soft, creamy bite.": {
    es: "Frijoles azuki dulces cocidos, suaves y cremosos.",
    fr: "Haricots rouges azuki sucrés mijotés, tendres et crémeux.",
    zh: "甜煮红豆，口感柔软绵密。",
    ja: "甘く煮たあずきの柔らかくクリーミーな食感。",
    ko: "달콤하게 졸인 팥, 부드럽고 크리미한 식감.",
    vi: "Đậu đỏ azuki ninh ngọt mềm mịn."
  },

  // Descriptions
  "Smooth black tea with creamy milk for a rich, classic boba taste.": {
    es: "Té negro suave con leche cremosa para un sabor clásico.",
    fr: "Thé noir onctueux avec du lait crémeux pour un goût boba classique.",
    zh: "顺滑红茶配奶香十足的牛奶，经典浓郁的波霸口味。",
    ja: "滑らかな紅茶にクリーミーなミルクが合わさったクラシックな味わい。",
    ko: "부드러운 홍차와 크리미한 우유가 어우러진 클래식한 맛.",
    vi: "Trà đen mượt với sữa béo tạo nên hương vị boba cổ điển."
  },
  "Bold Thai tea with sweet cream notes and a fragrant spiced finish.": {
    es: "Té Thai intenso con notas dulces y un final especiado.",
    fr: "Thé thaï intense aux notes crémeuses et épicées.",
    zh: "浓郁泰式茶，香甜奶香与香料尾韵。",
    ja: "濃厚なタイティーに甘いクリームとスパイシーな余韻。",
    ko: "진한 타이티에 달콤한 크림과 향긋한 향신료 여운.",
    vi: "Trà Thái đậm đà với vị kem ngọt và hậu vị thơm gia vị."
  },
  "Nutty taro flavor blended with milk for a sweet and velvety drink.": {
    es: "Sabor a taro mezclado con leche para una bebida dulce y aterciopelada.",
    fr: "Saveur de taro mélangée au lait pour une boisson douce et veloutée.",
    zh: "芋香浓郁与牛奶融合，甜美柔滑。",
    ja: "ナッツのようなタロイモとミルクが織りなす甘くてベルベットのような飲み物。",
    ko: "고소한 타로와 우유가 어우러진 달콤하고 부드러운 음료.",
    vi: "Vị khoai môn bùi béo kết hợp với sữa tạo nên thức uống ngọt mượt."
  },
  "Earthy matcha and creamy milk balanced into a refreshing green tea latte.": {
    es: "Matcha terroso con leche cremosa en un refrescante latte de té verde.",
    fr: "Matcha terreux et lait crémeux dans un latte de thé vert rafraîchissant.",
    zh: "抹茶醇香与牛奶融合，清爽的绿茶拿铁。",
    ja: "抹茶の風味とミルクのバランスが爽やかなグリーンティーラテ。",
    ko: "구수한 말차와 크리미한 우유가 어우러진 상쾌한 녹차 라떼.",
    vi: "Matcha đậm vị hòa quyện sữa tạo nên latte trà xanh mát lạnh."
  },
  "Caramel-like brown sugar syrup mixed into creamy milk tea.": {
    es: "Jarabe de azúcar morena con sabor a caramelo mezclado con té de leche.",
    fr: "Sirop de sucre brun façon caramel mélangé au thé au lait crémeux.",
    zh: "焦糖般的黑糖糖浆融入奶香浓郁的奶茶。",
    ja: "キャラメルのような黒糖シロップをクリーミーなミルクティーに。",
    ko: "캐러멜 같은 흑당 시럽이 크리미한 밀크티에 어우러짐.",
    vi: "Siro đường nâu vị caramel hòa quyện trong trà sữa béo."
  },
  "Light green tea and milk with a mellow honey sweetness.": {
    es: "Té verde ligero con leche y un toque suave de miel.",
    fr: "Thé vert léger et lait avec une douceur de miel subtile.",
    zh: "清爽绿茶搭配牛奶与柔和蜂蜜香。",
    ja: "軽い緑茶とミルクに優しい蜂蜜の甘さ。",
    ko: "가벼운 녹차와 우유에 은은한 꿀의 달콤함.",
    vi: "Trà xanh thanh nhẹ với sữa và vị mật ong dịu ngọt."
  },
  "Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.": {
    es: "Jarabe tradicional de melón de invierno con té de leche y dulzor tostado.",
    fr: "Sirop traditionnel de melon d'hiver et thé au lait avec une douceur grillée.",
    zh: "传统冬瓜糖浆与奶茶，带有烘烤甜香。",
    ja: "伝統的な冬瓜シロップとミルクティーの香ばしい甘さ。",
    ko: "전통 동과 시럽과 밀크티의 부드럽고 구수한 단맛.",
    vi: "Siro bí đao truyền thống cùng trà sữa vị ngọt dịu."
  },
  "A coffee-forward milk tea with creamy body and a gentle caffeine kick.": {
    es: "Té de leche con sabor a café, cuerpo cremoso y un toque de cafeína.",
    fr: "Un thé au lait au goût de café, crémeux avec une touche de caféine.",
    zh: "咖啡风味浓郁的奶茶，奶香醇厚带有温和咖啡因。",
    ja: "コーヒー風味が際立つクリーミーなミルクティー。",
    ko: "커피 향이 진한 크리미한 밀크티.",
    vi: "Trà sữa vị cà phê đậm đà, béo ngậy với chút caffeine."
  },
  "Crisp green tea with juicy mango flavor for a bright tropical sip.": {
    es: "Té verde refrescante con sabor a mango jugoso.",
    fr: "Thé vert croquant avec une saveur juteuse de mangue tropicale.",
    zh: "清爽绿茶搭配多汁芒果，热带风味十足。",
    ja: "爽やかな緑茶とジューシーなマンゴーのトロピカルな一杯。",
    ko: "상쾌한 녹차와 과즙 가득한 망고의 열대 풍미.",
    vi: "Trà xanh thanh mát với vị xoài nhiệt đới ngọt ngào."
  },
  "Fruity strawberry tea that is sweet, vibrant, and refreshing.": {
    es: "Té de fresa afrutado, dulce y refrescante.",
    fr: "Thé à la fraise fruité, sucré et rafraîchissant.",
    zh: "果香草莓茶，甜美鲜活又清爽。",
    ja: "フルーティーで甘くて爽やかなストロベリーティー。",
    ko: "과일향 가득한 달콤하고 상쾌한 딸기차.",
    vi: "Trà dâu trái cây ngọt ngào và sảng khoái."
  },
  "Classic black tea infused with ripe peach flavor.": {
    es: "Té negro clásico infusionado con sabor a durazno maduro.",
    fr: "Thé noir classique infusé à la pêche mûre.",
    zh: "经典红茶融入成熟蜜桃香。",
    ja: "熟した桃の香りを加えたクラシックな紅茶。",
    ko: "잘 익은 복숭아 향이 어우러진 클래식 홍차.",
    vi: "Trà đen cổ điển với hương đào chín."
  },
  "Floral oolong tea paired with delicate lychee sweetness.": {
    es: "Té oolong floral combinado con dulzor delicado de lichi.",
    fr: "Thé oolong floral associé à la douceur délicate du litchi.",
    zh: "花香乌龙茶配以细腻荔枝甜香。",
    ja: "花の香りのウーロン茶と繊細なライチの甘さ。",
    ko: "꽃향기 가득한 우롱차와 섬세한 리치의 달콤함.",
    vi: "Trà ô long hương hoa với vị vải ngọt dịu."
  }
};


function CustomerKiosk() {
  const [language, setLanguage] = useState("en");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);

  const t = (key) => {
    if (language === "en") return key;
    return (TRANSLATIONS[key] && TRANSLATIONS[key][language]) || key;
  };

  const translateText = (value) =>
    typeof value === "string" ? t(value) : value;

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1.2);
  const [speakMode, setSpeakMode] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [currentDrink, setCurrentDrink] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedHotness, setSelectedHotness] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: t(
        "Hi, I am Boba Buddy! Tell me the weather, any allergies or diet needs, and I will recommend a drink."
      ),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const itemRefs = useRef([]);
  const menuGridRef = useRef(null);
  const categoryRefs = useRef([]);
  const synth = window.speechSynthesis;

  const normalizeName = (value = "") =>
    value.toLowerCase().trim().replace(/\s+/g, " ");

  const localImageByName = {
    "classic milk tea": "/images/menu/classic_milk_tea.png",
    "thai milk tea": "/images/menu/thai_milk_tea.png",
    "taro milk tea": "/images/menu/taro_milk_tea.png",
    "matcha milk tea": "/images/menu/matcha_milk_tea.png",
    "okinawa brown sugar milk tea": "/images/menu/okinawa_brown_sugar_milk_tea.png",
    "honey green milk tea": "/images/menu/honey_green_milk_tea.png",
    "wintermelon milk tea": "/images/menu/wintermelon_milk_tea.png",
    "winter melon milk tea": "/images/menu/wintermelon_milk_tea.png",
    "coffee milk tea": "/images/menu/coffee_milk_tea.png",
    "mango green tea": "/images/menu/mango_green_tea.png",
    "strawberry fruit tea": "/images/menu/strawberry_fruit_tea.png",
    "peach black tea": "/images/menu/peach_black_tea.png",
    "lychee oolong tea": "/images/menu/lychee_oolong_tea.png",
    "additional boba": "/images/menu/additional_boba.png",
    "caramel macchiato": "/images/menu/caramel_macchiato.png",
    "hazelnut latte": "/images/menu/hazelnut_latte.png",
    "vietnamese iced coffee": "/images/menu/vietnamese_iced_coffee.png",
    "roasted oolong milk tea": "/images/menu/roasted_oolong_milk_tea.png",
    "vanilla milk tea": "/images/menu/vanilla_milk_tea.png",
    "chocolate milk tea": "/images/menu/chocolate_milk_tea.png",
    "pumpkin spice milk tea": "/images/menu/pumpkin_spice_milk_tea.png",
    "cherry blossom tea": "/images/menu/cherry_blossom_tea.png",
    "brown sugar oolong tea": "/images/menu/brown_sugar_oolong_tea.png",
    "jasmine green tea": "/images/menu/jasmine_green_tea.png",
    "passionfruit green tea": "/images/menu/passionfruit_green_tea.png",
    "kiwi fruit tea": "/images/menu/kiwi_fruit_tea.png",
    "mango milk tea": "/images/menu/mango_milk_tea.png",
    "coffee fruit tea": "/images/menu/coffee_fruit_tea.png",
    "hot caramel latte": "/images/menu/hot_caramel_latte.png",
    "hot mocha": "/images/menu/hot_mocha.png",
    "espresso": "/images/menu/espresso.png",
    "vanilla chai latte": "/images/menu/vanilla_chai_latte.png",
    "masala chai": "/images/menu/masala_chai.png",
    "london fog": "/images/menu/london_fog.png",
    "mango slushie": "/images/menu/mango_slushie.png",
    "strawberry slushie": "/images/menu/strawberry_slushie.png",
    "blue raspberry slushie": "/images/menu/blue_raspberry_slushie.png",

  };

  const generatedDescriptionByName = {
    "classic milk tea": "Smooth black tea with creamy milk for a rich, classic boba taste.",
    "thai milk tea": "Bold Thai tea with sweet cream notes and a fragrant spiced finish.",
    "taro milk tea": "Nutty taro flavor blended with milk for a sweet and velvety drink.",
    "matcha milk tea": "Earthy matcha and creamy milk balanced into a refreshing green tea latte.",
    "okinawa brown sugar milk tea": "Caramel-like brown sugar syrup mixed into creamy milk tea.",
    "honey green milk tea": "Light green tea and milk with a mellow honey sweetness.",
    "wintermelon milk tea": "Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.",
    "winter melon milk tea": "Traditional wintermelon syrup and milk tea with a smooth, toasty sweetness.",
    "coffee milk tea": "A coffee-forward milk tea with creamy body and a gentle caffeine kick.",
    "mango green tea": "Crisp green tea with juicy mango flavor for a bright tropical sip.",
    "passionfruit green tea": "Zesty passionfruit and green tea combine for a bright, tangy tropical sip.",
    "kiwi fruit tea": "Refreshing kiwi fruit tea with lively sweetness and a clean citrusy finish.",
    "coffee fruit tea": "Bold coffee notes meet fruit tea for a smooth, refreshing flavor contrast.",
    "mango milk tea": "Creamy milk tea blended with ripe mango for a rich tropical treat.",
    "strawberry fruit tea": "Fruity strawberry tea that is sweet, vibrant, and refreshing.",
    "peach black tea": "Classic black tea infused with ripe peach flavor.",
    "lychee oolong tea": "Floral oolong tea paired with delicate lychee sweetness.",
    "additional boba": "Chewy tapioca pearls to add extra texture to your drink.",
    "caramel macchiato": "Rich espresso layered with silky vanilla milk and buttery caramel drizzle.",
    "hazelnut latte": "Smooth espresso with nutty hazelnut syrup and creamy steamed milk.",
    "vietnamese iced coffee": "Strong dark roast poured over sweet condensed milk, chilled over ice.",
    "roasted oolong milk tea": "Toasty roasted oolong balanced with creamy milk for a nutty finish.",
    "vanilla milk tea": "Classic black milk tea infused with sweet Madagascar vanilla.",
    "chocolate milk tea": "Rich cocoa blended with creamy milk tea for a dessert-like sip.",
    "pumpkin spice milk tea": "Warm pumpkin, cinnamon and nutmeg swirled into cozy milk tea.",
    "cherry blossom tea": "Delicate sakura and white tea for a lightly floral spring sip.",
    "brown sugar oolong tea": "Caramelized brown sugar drizzled over fragrant roasted oolong.",
    "jasmine green tea": "Fragrant jasmine petals steeped with fresh green tea leaves.",
    "rainbow jelly": "Chewy fruit-flavored jellies that add a burst of color and taste.",
    "red bean": "Sweet simmered azuki red beans with a soft, creamy bite.",
    "hot caramel latte": "Velvety steamed milk with rich caramel and a bold espresso shot.",
    "hot mocha": "Rich chocolate and espresso blended with steamed milk and cocoa.",
    "espresso": "A clean, intense shot of pure espresso with a golden crema.",
    "vanilla chai latte": "Creamy vanilla-infused chai with warming spices and frothy milk.",
    "masala chai": "Traditional Indian spiced tea with cardamom, cinnamon, and ginger.",
    "london fog": "Earl Grey tea with vanilla, steamed milk, and a hint of lavender.",
    "mango slushie": "Frozen mango blended into a thick, icy tropical slush.",
    "strawberry slushie": "Sweet strawberry puree swirled into a frosty, refreshing slush.",
    "blue raspberry slushie": "Tangy blue raspberry blended into a vibrant frozen slushie.",

  };

  const placeholderSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420"><rect width="100%" height="100%" fill="#f5c4a1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5c3d2e" font-size="28" font-family="Arial, sans-serif">Boba Bytes</text></svg>'
    );

  const getItemImageSrc = (item) => {
    const normalized = normalizeName(item.item_name);
    const localImage = localImageByName[normalized];
    if (localImage) return localImage;
    if (item.image) return item.image;
    return placeholderSvg;
  };

  const getTranslatedDrinkName = (item) => {
    const key = normalizeName(item.item_name);
    if (language !== "en" && TRANSLATIONS[key]?.[language]) {
      return TRANSLATIONS[key][language];
    }
    return item.item_name;
  };

  const translateItemName = (name) => {
    if (!name) return name;
    const key = normalizeName(name);
    if (language !== "en" && TRANSLATIONS[key]?.[language]) {
      return TRANSLATIONS[key][language];
    }
    return name;
  };

  const getItemDescription = (item) => {
    const english = item.item_description?.trim()
      ? item.item_description
      : generatedDescriptionByName[normalizeName(item.item_name)];
    if (language !== "en" && TRANSLATIONS[english]?.[language]) {
      return TRANSLATIONS[english][language];
    }
    return english;
  };

  const speak = (text) => {
    if (!speakMode || !text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      vi: "vi-VN",
    };
    utterance.lang = langMap[language] || "en-US";
    synth.speak(utterance);
  };

  const speakKey = (key) => speak(t(key));

  const speakDrinkName = (item) => speak(getTranslatedDrinkName(item));

  const getToppingPriceByName = (name) => {
    const tTop = TOPPINGS.find((x) => x.name === name);
    return tTop ? tTop.price : 0;
  };

  // Load menu
  useEffect(() => {
    async function loadMenu() {
      try {
        const itemsRes = await fetch(`${API_BASE}/menu/items`);
        const items = await itemsRes.json();
        const catsRes = await fetch(`${API_BASE}/menu/categories`);
        let cats = await catsRes.json();

        if (!cats || cats.length === 0) {
          cats = [...new Set(items.map((item) => item.item_type).filter((x) => !!x))];
        }

        const CATEGORY_LABELS = {
          all: "All",
          coffee: "Coffee",
          "milk tea": "Milk Tea",
          "fruit tea": "Fruit Tea",
          seasonal: "Seasonal",
          "seasonal tea": "Seasonal Tea",
          "special tea": "Special Tea",
          special: "Special Tea",
          "hot drinks": "Hot Drinks",
          "slushies": "Slushies",

          toppings: "Toppings",
        };

        const normalizedCategories = ["All", ...cats.filter((c) => c !== "Toppings")];

        setMenuItems(items);
        setCategories(
          normalizedCategories.map((cat) => {
            const key = String(cat).trim().toLowerCase();
            return CATEGORY_LABELS[key] || cat;
          })
        );
      } catch (error) {
        alert(t("Network error"));
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const browseableMenuItems = menuItems.filter((item) => item.item_type !== "Toppings");

  const TOPPINGS = menuItems
    .filter((item) => item.item_type === "Toppings")
    .map((item) => ({
      name: item.item_name,
      price: Number(item.item_cost),
    }));

  const filteredItems =
    selectedCategory === "All"
      ? browseableMenuItems
      : browseableMenuItems.filter((item) => item.item_type === selectedCategory);

  // Touch navigation
  useEffect(() => {
    if (!menuGridRef.current) return;

    let startX = 0;
    let startY = 0;
    let holdTimer = null;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      holdTimer = setTimeout(() => {
        const item = filteredItems[focusIndex];
        if (item) {
          speakDrinkName(item);
          openCustomization(item);
        }
      }, 600);
    };

    const handleTouchEnd = (e) => {
      clearTimeout(holdTimer);
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < 30 && absY < 30) return;

      if (absX > absY) {
        if (dx > 0 && focusIndex > 0) {
          const prev = focusIndex - 1;
          setFocusIndex(prev);
          itemRefs.current[prev]?.focus();
          speakDrinkName(filteredItems[prev]);
        } else if (dx < 0 && focusIndex < filteredItems.length - 1) {
          const next = focusIndex + 1;
          setFocusIndex(next);
          itemRefs.current[next]?.focus();
          speakDrinkName(filteredItems[next]);
        }
      } else {
        if (dy > 0 && focusIndex < filteredItems.length - 1) {
          const next = focusIndex + 1;
          setFocusIndex(next);
          itemRefs.current[next]?.focus();
          speakDrinkName(filteredItems[next]);
        } else if (dy < 0 && focusIndex > 0) {
          const prev = focusIndex - 1;
          setFocusIndex(prev);
          itemRefs.current[prev]?.focus();
          speakDrinkName(filteredItems[prev]);
        }
      }
    };

    const grid = menuGridRef.current;
    grid.addEventListener("touchstart", handleTouchStart, { passive: true });
    grid.addEventListener("touchend", handleTouchEnd);

    return () => {
      grid.removeEventListener("touchstart", handleTouchStart);
      grid.removeEventListener("touchend", handleTouchEnd);
    };
  }, [filteredItems, focusIndex, language, speakMode]);

  const drinksMatch = (a, b) => {
    const aT = (a.toppings || []).map((t) => t.name).sort((x, y) => x.localeCompare(y));
    const bT = (b.toppings || []).map((t) => t.name).sort((x, y) => x.localeCompare(y));

    return (
      a.menu_item_id === b.menu_item_id &&
      a.size === b.size &&
      a.hotness === b.hotness &&
      a.ice === b.ice &&
      a.sugar === b.sugar &&
      JSON.stringify(aT) === JSON.stringify(bT)
    );
  };

  const openCustomization = (item, index = null) => {
    setCurrentDrink(item);
    setEditingIndex(index);
    if (index !== null) {
      const existing = cart[index];
      setSelectedSize(existing.size);
      setSelectedHotness(existing.hotness || "Cold");
      setSelectedIce(existing.ice);
      setSelectedSugar(existing.sugar);
      setSelectedToppings(existing.toppings || []);
    } else {
      setSelectedSize(null);
      setSelectedHotness("Cold");
      setSelectedIce(null);
      setSelectedSugar(null);
      setSelectedToppings([]);
    }
    setCustomModalOpen(true);
  };

  const handleItemClick = (item) => {
    openCustomization(item);
    speakDrinkName(item);
  };

  const computeToppingsCostPerDrink = (toppings) =>
    (toppings || []).reduce((sum, topping) => {
      const toppingName = typeof topping === "string" ? topping : topping?.name;
      const rawPrice =
        typeof topping === "object" && topping !== null
          ? topping.price ?? getToppingPriceByName(toppingName)
          : getToppingPriceByName(toppingName);
      const price = Number(rawPrice);
      return sum + (Number.isFinite(price) ? price : 0);
    }, 0);

  const saveDrink = () => {
    const rawBasePrice = currentDrink?.base_cost ?? currentDrink?.item_cost ?? 0;
    const basePrice = Number.isFinite(Number(rawBasePrice)) ? Number(rawBasePrice) : 0;
    const toppingsCost = computeToppingsCostPerDrink(selectedToppings);

    const drinkOrder = {
      cart_item_id: editingIndex !== null
        ? cart[editingIndex].cart_item_id
        : Math.random().toString(36).substring(2, 9),
      menu_item_id: currentDrink.menu_item_id,
      item_name: currentDrink.item_name,
      item_type: currentDrink.item_type,
      size: selectedSize || "Medium",
      hotness: selectedHotness || "Cold",
      ice: (selectedHotness || "Cold") === "Hot" ? "No Ice" : selectedIce || "Regular Ice",
      sugar: selectedSugar || "100%",
      toppings: selectedToppings,
      quantity: editingIndex !== null ? cart[editingIndex].quantity : 1,
      base_cost: basePrice,
      toppings_cost_per_drink: toppingsCost,
    };

    if (editingIndex !== null) {
      const updated = [...cart];
      updated[editingIndex] = drinkOrder;
      setCart(updated);
    } else {
      setCart((prev) => {
        const existingIndex = prev.findIndex((c) => drinksMatch(c, drinkOrder));
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }
        return [...prev, drinkOrder];
      });
    }

    setCustomModalOpen(false);
    setEditingIndex(null);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const duplicateDrink = (cartItemId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cart_item_id === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const totalPrice = cart.reduce((total, item) => {
    const perDrink = Number(item.base_cost) + computeToppingsCostPerDrink(item.toppings);
    return total + perDrink * item.quantity;
  }, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    speak(t("Order submitted successfully"));
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_type: "kiosk",
          items: cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
          })),
          total: totalPrice,
        }),
      });
      if (response.ok) {
        alert(t("Order submitted successfully"));
        setCart([]);
      } else {
        alert(t("Failed to submit order"));
      }
    } catch (error) {
      alert(t("Network error"));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardMode) return;

    const handleKey = (e) => {
      const totalCategories = categories.length;
      const totalItems = filteredItems.length;

      const activeCategory = categoryRefs.current.findIndex(
        (el) => el === document.activeElement
      );
      const activeItem = itemRefs.current.findIndex(
        (el) => el === document.activeElement
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (activeCategory !== -1) {
          setFocusIndex(0);
          itemRefs.current[0]?.focus();
          speakDrinkName(filteredItems[0]);
          return;
        }
        if (focusIndex < totalItems - 1) {
          const next = focusIndex + 1;
          setFocusIndex(next);
          itemRefs.current[next]?.focus();
          speakDrinkName(filteredItems[next]);
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (focusIndex > 0) {
          const prev = focusIndex - 1;
          setFocusIndex(prev);
          itemRefs.current[prev]?.focus();
          speakDrinkName(filteredItems[prev]);
        } else {
          categoryRefs.current[0]?.focus();
          speakKey("Category");
        }
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeCategory > 0) {
          const prevCat = activeCategory - 1;
          categoryRefs.current[prevCat]?.focus();
          const cat = categories[prevCat];
          speak(`${t("Category")}: ${t(cat)}`);
          return;
        }
        if (activeItem > 0) {
          const prev = activeItem - 1;
          setFocusIndex(prev);
          itemRefs.current[prev]?.focus();
          speakDrinkName(filteredItems[prev]);
        }
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (activeCategory !== -1 && activeCategory < totalCategories - 1) {
          const nextCat = activeCategory + 1;
          categoryRefs.current[nextCat]?.focus();
          const cat = categories[nextCat];
          speak(`${t("Category")}: ${t(cat)}`);
          return;
        }
        if (activeItem !== -1 && activeItem < totalItems - 1) {
          const next = activeItem + 1;
          setFocusIndex(next);
          itemRefs.current[next]?.focus();
          speakDrinkName(filteredItems[next]);
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (activeCategory !== -1) {
          const cat = categories[activeCategory];
          setSelectedCategory(cat);
          speak(`${t("Category")}: ${t(cat)}`);
          return;
        }
        const item = filteredItems[focusIndex];
        if (item) {
          speakDrinkName(item);
          handleItemClick(item);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [keyboardMode, filteredItems, focusIndex, categories, language]);

  // Language menu close
  useEffect(() => {
    if (!languageMenuOpen) return;

    const handleClickOutside = (e) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target)) {
        setLanguageMenuOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setLanguageMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [languageMenuOpen]);

  // Chatbot Escape support
  useEffect(() => {
    const handleChatEsc = (e) => {
      if (e.key === "Escape" && chatOpen) {
        setChatOpen(false);
      }
    };
    document.addEventListener("keydown", handleChatEsc);
    return () => document.removeEventListener("keydown", handleChatEsc);
  }, [chatOpen]);

  // Focus scroll
  useEffect(() => {
    if (keyboardMode && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex].focus();
      itemRefs.current[focusIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusIndex, keyboardMode]);

  const isToppingSelected = (name) =>
    selectedToppings.some((t) => t.name === name);

  const toggleTopping = (name) => {
    setSelectedToppings((prev) => {
      if (prev.some((t) => t.name === name)) {
        return prev.filter((t) => t.name !== name);
      }
      const price = getToppingPriceByName(name);
      return [...prev, { name, price }];
    });
  };

  // Weather Logic
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch(`${API_BASE}/weather`);
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.log("Weather error", err);
      }
    }
    loadWeather();
  }, []);

  const getWeatherRecommendation = () => {
    if (!weather) return null;
    if (weather.temp >= 85) return "It's hot today! Try a refreshing fruit tea like Mango Green Tea or Lychee Oolong.";
    if (weather.temp <= 50) return "It's chilly outside. A warm drink like Thai Milk Tea or Roasted Oolong Milk Tea would be perfect.";
    if (weather.condition === "Rain") return "Rainy weather calls for something cozy - maybe a Classic Milk Tea.";
    return "Weather looks nice today! Pick anything you like.";
  };

  const getWeatherIcon = (condition = "") => {
    const normalized = String(condition).toLowerCase();
    if (normalized.includes("rain") || normalized.includes("drizzle")) return "🌧️";
    if (normalized.includes("snow")) return "❄️";
    if (normalized.includes("storm") || normalized.includes("thunder")) return "⛈️";
    if (normalized.includes("cloud")) return "☁️";
    if (normalized.includes("clear") || normalized.includes("sun")) return "☀️";
    return "🌤️";
  };

  const weatherCondition = weather?.condition || "Unknown";
  const weatherTemp = Number.isFinite(Number(weather?.temp)) ? `${Math.round(Number(weather.temp))} F` : "-- F";
  const weatherFeelsLike = Number.isFinite(Number(weather?.raw?.main?.feels_like))
    ? `${Math.round(Number(weather.raw.main.feels_like))} F` : "--";
  const weatherHumidity = Number.isFinite(Number(weather?.raw?.main?.humidity))
    ? `${Math.round(Number(weather.raw.main.humidity))}%` : "--";
  const weatherWind = Number.isFinite(Number(weather?.raw?.wind?.speed))
    ? `${Number(weather.raw.wind.speed).toFixed(1)} mph` : "--";
  const weatherLocation = [weather?.raw?.name, weather?.raw?.sys?.country].filter(Boolean).join(", ");
  const weatherMessage = t(getWeatherRecommendation() || "Checking today's weather...");

  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const newMessages = [...chatMessages, { role: "user", content: trimmed }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    if (trimmed.toLowerCase().includes("weather")) {
      const rec = getWeatherRecommendation();
      if (rec) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: rec }]);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, menu: menuItems }),
      });
      const data = await res.json();
      if (data && data.reply) {
        setChatMessages((prev) => [...prev, data.reply]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("Sorry, I had trouble answering. Please try again.") },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div className="kiosk-loading">Loading menu...</div>;
  }

  return (
    <div className="kiosk-container" style={{ "--scale": fontScale }} aria-live="polite">
      {/* WCAG Fix: Main heading for screen readers */}
      <h1 className="sr-only">Customer Ordering Kiosk</h1>

      <header className="kiosk-top-header">
        <div className="kiosk-header-small">
          <img
            src="/images/logo.png"
            alt="Boba Bytes Logo"
            className="kiosk-logo ml-5 h-20 w-auto max-w-45 rounded-2xl border border-[#ecddd0] bg-white/90 p-1 shadow-md object-contain"
          />
          <div className="kiosk-header-actions">
            <div className="category-bar" role="tablist" aria-label={t("Drink categories")}>
              {categories.map((cat, index) => {
                const label = t(cat);
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat ?? index}
                    ref={(el) => (categoryRefs.current[index] = el)}
                    tabIndex={keyboardMode ? 0 : -1}
                    onClick={() => {
                      setSelectedCategory(cat);
                      speak(`${t("Category")}: ${label}`);
                    }}
                    className={`category-btn ${isActive ? "active" : ""}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${t("Select category")} ${label}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="accessibility-bar" aria-label={t("Accessibility controls")}>
              <label>{t("Text Size")}:</label>
              <button className="size-btn" onClick={() => setFontScale((prev) => Math.max(0.6, prev - 0.1))} aria-label={t("Decrease text size")}>−</button>
              <button className="size-btn" onClick={() => setFontScale((prev) => Math.min(1.6, prev + 0.1))} aria-label={t("Increase text size")}>+</button>

              <button
                className={`access-btn ${speakMode ? "active" : ""}`}
                onClick={() => {
                  const next = !speakMode;
                  setSpeakMode(next);
                  speak(next ? t("Speaker On") : t("Speaker Off"));
                }}
                aria-pressed={speakMode}
              >
                {speakMode ? t("Speaker On") : t("Speaker Off")}
              </button>

              <button
                className={`access-btn ${keyboardMode ? "active" : ""}`}
                onClick={() => {
                  const next = !keyboardMode;
                  setKeyboardMode(next);
                  speak(next ? t("Keyboard On") : t("Keyboard Off"));
                }}
                aria-pressed={keyboardMode}
              >
                {keyboardMode ? t("Keyboard On") : t("Keyboard Off")}
              </button>

              <label className="language-label">{t("Language")}:</label>
              <div className="language-dropdown" ref={languageMenuRef}>
                <button
                  type="button"
                  className="language-toggle"
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={languageMenuOpen}
                  aria-label={t("Language")}
                >
                  {(() => {
                    const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
                    return (
                      <>
                        <img className="language-flag" src={`https://flagcdn.com/w40/${current.country}.png`} srcSet={`https://flagcdn.com/w80/${current.country}.png 2x`} alt="" aria-hidden="true" />
                        <span className="language-current-label">{current.label}</span>
                        <span className={`language-caret ${languageMenuOpen ? "open" : ""}`} aria-hidden="true">▾</span>
                      </>
                    );
                  })()}
                </button>

                {languageMenuOpen && (
                  <ul className="language-menu" role="listbox" aria-label={t("Select language")}>
                    {LANGUAGES.map((lang) => (
                      <li
                        key={lang.code}
                        role="option"
                        aria-selected={language === lang.code}
                        tabIndex={0}
                        className={`language-menu-item ${language === lang.code ? "active" : ""}`}
                        onClick={() => { setLanguage(lang.code); setLanguageMenuOpen(false); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setLanguage(lang.code);
                            setLanguageMenuOpen(false);
                          }
                        }}
                      >
                        <img className="language-flag" src={`https://flagcdn.com/w40/${lang.country}.png`} srcSet={`https://flagcdn.com/w80/${lang.country}.png 2x`} alt="" aria-hidden="true" />
                        <span>{lang.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Weather Banner */}
      <div className="mx-5 mt-3 rounded-2xl border border-[#ecddd0] bg-[#fff4b8]/95 px-4 py-3 shadow-md">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <p className="flex-1 text-sm font-semibold leading-snug text-[#5c3d2e] md:text-xl lg:text-2xl" aria-label="Weather recommendation">
            {weatherMessage}
          </p>

          <div className="flex items-center justify-end gap-8 self-end xl:self-auto xl:gap-20">
            <div className="flex h-24 w-md shrink-0 items-center gap-4 rounded-2xl border border-[#ecddd0] bg-white/90 px-4 py-3 text-[#5c3d2e] shadow-sm" role="group" aria-label="Weather summary">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-200 text-3xl shadow-inner">
                {getWeatherIcon(weatherCondition)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#8a5e4b]">
                  {t(weatherLocation || "Unknown")}
                </div>
                <div className="text-2xl font-extrabold leading-none text-[#5c3d2e] lg:text-3xl">
                  {weatherTemp}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right text-[0.65rem] font-semibold text-[#6f4a3a] lg:text-xs">
                <div>{t("Feels")} {weatherFeelsLike}</div>
                <div>{t("Humidity")} {weatherHumidity}</div>
                <div>{t("Wind")} {weatherWind}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="ml-2 h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#ecddd0] bg-white/90 p-0 shadow-md transition-transform duration-200 hover:scale-105"
              aria-label="Open Boba Buddy chatbot"
            >
              <img src="/images/chatbot.png" alt="Chatbot" className="h-full w-full rounded-full object-cover" />
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* FIXED: Menu Grid */}
        <div
          className="menu-grid"
          ref={menuGridRef}
          role="list"
          aria-label={t("Drink menu")}
          tabIndex={keyboardMode ? 0 : -1}
        >
          {filteredItems.map((item, index) => (
            <div
              key={item.menu_item_id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`menu-card ${keyboardMode && focusIndex === index ? "focused" : ""}`}
              onClick={() => handleItemClick(item)}
              role="listitem"
              tabIndex={keyboardMode ? 0 : -1}
              aria-label={`${t("Add")} ${getTranslatedDrinkName(item)} ${t("to cart")}`}
            >
              <img
                src={getItemImageSrc(item)}
                alt={getTranslatedDrinkName(item)}
                className="item-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholderSvg;
                }}
              />
              <div className="item-info">
                <h3>{getTranslatedDrinkName(item)}</h3>
                <p className="item-description">{getItemDescription(item)}</p>
                <p className="price">${Number(item.item_cost).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FIXED: Cart Sidebar */}
        <div
          className={`cart-sidebar ${cart.length === 0 ? "is-empty" : ""}`}
          aria-live="polite"
          role="complementary"
          tabIndex={0}
          aria-label={t("Your Cart")}
        >
          <h2>{t("Your Cart")} ({cart.length})</h2>
          {cart.length === 0 ? (
            <p className="empty-cart">{t("Tap any drink to start your order")}</p>
          ) : (
            cart.map((item, index) => {
              const perDrink = Number(item.base_cost) + computeToppingsCostPerDrink(item.toppings);
              return (
                <div key={item.cart_item_id} className={`cart-item ${editingIndex === index ? "editing" : ""}`}>
                  <div style={{ flex: 1 }}>
                    <div>
                      <span>{getTranslatedDrinkName(item)}</span>
                      <span className="qty"> x {item.quantity}</span>
                    </div>
                    <div className="topping-items">
                      <div>{t("Size")}: {item.size}</div>
                      <div>{t("Temperature")}: {t(item.hotness || "Cold")}</div>
                      {(item.hotness || "Cold") !== "Hot" && <div>{t("Ice")}: {item.ice}</div>}
                      <div>{t("Sugar")}: {item.sugar}</div>
                      {item.toppings?.length > 0 && item.toppings.map((top, idx) => (
                        <div key={idx}>+{translateItemName(top.name)}</div>
                      ))}
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-price">${(perDrink * item.quantity).toFixed(2)}</span>
                    <div className="cart-item-actions">
                      <button onClick={() => { openCustomization(item, index); speak(`${t("Edit")} ${getTranslatedDrinkName(item)}`); }} className="edit-btn" aria-label={`${t("Edit")} ${getTranslatedDrinkName(item)}`}>Edit</button>
                      <button onClick={() => { duplicateDrink(item.cart_item_id); speak(`${t("Duplicate")} ${getTranslatedDrinkName(item)}`); }} className="remove-btn" aria-label={`${t("Duplicate")} ${getTranslatedDrinkName(item)}`}>+</button>
                      <button onClick={() => { removeFromCart(item.cart_item_id); speak(`${t("Remove")} ${getTranslatedDrinkName(item)}`); }} className="remove-btn" aria-label={`${t("Remove")} ${getTranslatedDrinkName(item)}`}>×</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div className="cart-total">
            <span>{t("Total")}</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button onClick={submitOrder} className="submit-order-btn" disabled={cart.length === 0} aria-disabled={cart.length === 0}>
            {t("Place Order")}
          </button>
        </div>
      </div>

      {/* FULL Customization Modal */}
      {customModalOpen && currentDrink && (
        <div className="topping-modal-overlay" role="dialog" aria-modal="true" aria-label={`${t("Customize")} ${getTranslatedDrinkName(currentDrink)}`}>
          <div className={`topping-modal-content ${editingIndex !== null ? "editing-mode" : ""}`}>
            <h2>{t("Customize")} {getTranslatedDrinkName(currentDrink)}</h2>

            <div className="custom-section">
              <label>{t("Size")}</label>
              <div className="option-group" role="radiogroup">
                {["Small", "Medium", "Large"].map((s) => (
                  <button key={s} className={`option-btn ${selectedSize === s ? "active" : ""}`} onClick={() => { setSelectedSize(s); speak(`${t("Size")}: ${s}`); }} aria-pressed={selectedSize === s} aria-label={`${t("Size")}: ${s}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>{t("Temperature")}</label>
              <div className="option-group" role="radiogroup">
                {["Cold", "Hot"].map((temp) => (
                  <button key={temp} className={`option-btn ${selectedHotness === temp ? "active" : ""}`} onClick={() => { setSelectedHotness(temp); if (temp === "Hot") setSelectedIce("No Ice"); speak(`${t("Temperature")}: ${t(temp)}`); }} aria-pressed={selectedHotness === temp} aria-label={`${t("Temperature")}: ${t(temp)}`}>{t(temp)}</button>
                ))}
              </div>
            </div>

            {selectedHotness !== "Hot" && (
              <div className="custom-section">
                <label>{t("Ice")}</label>
                <div className="option-group" role="radiogroup">
                  {["No Ice", "Less Ice", "Regular Ice", "Extra Ice"].map((i) => (
                    <button key={i} className={`option-btn ${selectedIce === i ? "active" : ""}`} onClick={() => { setSelectedIce(i); speak(`${t("Ice")}: ${i}`); }} aria-pressed={selectedIce === i} aria-label={`${t("Ice")}: ${i}`}>{i}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="custom-section">
              <label>{t("Sugar")}</label>
              <div className="option-group" role="radiogroup">
                {["0%", "25%", "50%", "75%", "100%", "125%", "150%"].map((s) => (
                  <button key={s} className={`option-btn ${selectedSugar === s ? "active" : ""}`} onClick={() => { setSelectedSugar(s); speak(`${t("Sugar")}: ${s}`); }} aria-pressed={selectedSugar === s} aria-label={`${t("Sugar")}: ${s}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="custom-section">
              <label>{t("Toppings")}</label>
              <div className="topping-checkbox-list">
                {TOPPINGS.map((top) => {
                  const translated = translateItemName(top.name);
                  const selected = isToppingSelected(top.name);
                  return (
                    <button
                      type="button"
                      key={top.name}
                      className={`topping-checkbox-row ${selected ? "selected" : ""}`}
                      onClick={() => { toggleTopping(top.name); speak(`${selected ? t("Remove") : t("Add")} ${translated}`); }}
                      aria-pressed={selected}
                      aria-label={`${selected ? t("Remove") : t("Add")} ${translated}`}
                    >
                      <span>{translated}</span>
                      <span className="topping-checkbox-price">+${top.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="confirm-btn" onClick={saveDrink}>
              {editingIndex !== null ? t("Save Changes") : t("Add to Cart")}
            </button>
            <button className="cancel-btn" onClick={() => { setCustomModalOpen(false); setEditingIndex(null); }}>
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}

      {/* FIXED: Chatbot */}
      {chatOpen && (
        <div className="chatbot-overlay" role="dialog" aria-modal="true" aria-label="Boba Buddy Chatbot">
          <div className="chatbot-window" tabIndex={-1}>
            <button className="chatbot-close-btn" onClick={() => setChatOpen(false)} aria-label={t("Close chatbot")}>✕</button>

            <div className="chatbot-messages" aria-live="polite" aria-label="Chat conversation">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[92%] items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${m.role === "user" ? "bg-[#f9d98a] text-[#5c3d2e]" : "bg-[#f2e2d3] text-[#5c3d2e]"}`} aria-hidden="true">
                      {m.role === "user" ? "U" : "BB"}
                    </div>
                    <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                      <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#7b6b62]">
                        {m.role === "user" ? t("You") : t("Boba Buddy")}
                      </span>
                      <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${m.role === "user" ? "rounded-br-md bg-[#fff0ae] text-[#5c3d2e] border border-[#f0dfcf]" : "rounded-bl-md bg-white text-[#4e3a2f] border border-[#f0dfcf]"}`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex w-full justify-start">
                  <div className="flex max-w-[92%] items-end gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2e2d3] text-xs font-bold text-[#5c3d2e]">BB</div>
                    <div className="flex flex-col items-start">
                      <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#7b6b62]">{t("Boba Buddy")}</span>
                      <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-[#f0dfcf] bg-white px-3 py-2 text-sm leading-relaxed text-[#4e3a2f] shadow-sm">
                        {t("Thinking of a drink for you...")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chatbot-input-bar">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t("Tell me the weather, allergies, diet...")}
                aria-label={t("Type your message")}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendChatMessage(); } }}
              />
              <button onClick={sendChatMessage} aria-label={t("Send")}>{t("Send")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerKiosk;