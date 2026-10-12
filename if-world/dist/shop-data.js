// Fictional product types and 2020 reference prices. Never actual listings or brand quotes.
export const SHOP_CATEGORIES=[{id:'home',name:'내 집 마련',subtitle:'어떤 집에서 살고 싶었나요?'},{id:'car',name:'드림카',subtitle:'차고에 내가 고른 차 한 대.'},{id:'luxury',name:'명품과 취향',subtitle:'늘 구경만 하던 물건을 내 것으로.'},{id:'experience',name:'여행과 경험',subtitle:'물건보다 오래 남을 순간.'}];
export const SHOP_ITEMS=[
 {id:'home-cozy',type:'home',name:'나만의 첫 아파트',tag:'전용 59㎡ · 약 18평',description:'밝은 거실, 작은 서재, 내 이름으로 된 집. 부담을 줄이고 일상의 안정부터 챙겨요.',factor:.8,monthly:180000,happy:6,icon:'apartment'},
 {id:'home-family',type:'home',name:'여유로운 가족 아파트',tag:'전용 84㎡ · 약 25평',description:'함께 사는 사람을 위한 방과 넉넉한 식탁. 가족과 보내는 일상을 바꿔요.',factor:1,monthly:250000,happy:8,icon:'apartment'},
 {id:'home-view',type:'home',name:'탁 트인 전망의 고층 아파트',tag:'전용 114㎡ · 약 34평',description:'창밖을 바라보며 시작하는 아침. 넓은 거실과 별도 취미 공간을 갖춰요.',factor:1.65,monthly:400000,happy:10,icon:'tower'},
 {id:'home-penthouse',type:'home',name:'테라스가 있는 펜트하우스',tag:'전용 165㎡ · 약 50평',description:'테라스에서 쉬고 친구를 초대하는 집. 구매비뿐 아니라 관리비도 더 커져요.',factor:2.6,monthly:750000,happy:12,icon:'tower'},
 {id:'home-garden',type:'home',name:'작은 정원이 있는 단독주택',tag:'주거 공간 99㎡ · 약 30평',description:'나만의 마당에서 느긋하게 보내는 주말. 손이 많이 가는 관리까지 함께 선택해요.',factor:1.35,monthly:500000,happy:10,icon:'garden'},
 {id:'car-compact',type:'car',name:'국산 준중형 세단',tag:'일상의 첫 차',description:'장보기와 가까운 여행이 편해져요. 가볍게 시작하는 나만의 이동 수단.',price:28000000,monthly:250000,happy:4,decay:.15,icon:'sedan'},
 {id:'car-family',type:'car',name:'넉넉한 패밀리 SUV',tag:'가족과 떠나는 주말',description:'사람과 짐을 여유롭게 싣는 차. 가족 여행이 기다려지는 생활을 만들어요.',price:55000000,monthly:450000,happy:6,decay:.15,icon:'suv'},
 {id:'car-premium',type:'car',name:'수입 프리미엄 세단',tag:'내가 꿈꾸던 출근길',description:'조용한 실내와 편안한 승차감. 늘 구경하던 차를 직접 운전해요.',price:85000000,monthly:700000,happy:8,decay:.18,icon:'sedan'},
 {id:'car-sport',type:'car',name:'주말을 위한 스포츠 쿠페',tag:'드라이브가 취미가 되는 차',description:'한 번쯤 타보고 싶었던 낮고 날렵한 차. 높은 유지비까지 확인하고 골라요.',price:160000000,monthly:1200000,happy:10,decay:.18,icon:'sport'},
 {id:'car-luxury',type:'car',name:'플래그십 럭셔리 세단',tag:'여유를 위한 선택',description:'공간과 편안함에 집중한 큰 세단. 가격만큼 보유 비용도 중요한 선택이에요.',price:240000000,monthly:1600000,happy:11,decay:.2,icon:'sedan'},
 {id:'car-electric',type:'car',name:'프리미엄 전기 SUV',tag:'2016년 이후 열림 · 게임 기준',description:'새로운 이동 방식으로 일상을 바꿔요. 출시 시점과 비용은 게임에서 정한 가정이에요.',price:110000000,monthly:500000,happy:8,decay:.18,minYear:2016,icon:'suv'},
 {id:'lux-bag',type:'luxury',name:'클래식 디자이너 가방',tag:'늘 눈여겨보던 첫 명품',description:'매장에서 구경만 하던 가방. 특별한 날뿐 아니라 평소에도 내 취향을 즐겨요.',price:8000000,monthly:0,happy:5,resale:.45,decay:.05,icon:'bag'},
 {id:'lux-watch',type:'luxury',name:'스위스 기계식 시계',tag:'오래 간직할 물건',description:'한 번쯤 손목에 올려보고 싶었던 시계. 내 인생의 새로운 시작을 기념해요.',price:18000000,monthly:0,happy:6,resale:.6,decay:.04,icon:'watch'},
 {id:'lux-jewelry',type:'luxury',name:'나를 위한 주얼리',tag:'목걸이와 반지 세트',description:'누군가의 선물만 기다리지 않아도 돼요. 내가 고른 반짝임을 일상에 더해요.',price:12000000,monthly:0,happy:5,resale:.5,decay:.03,icon:'jewelry'},
 {id:'lux-wardrobe',type:'luxury',name:'취향으로 채운 옷장',tag:'코트·신발·액세서리',description:'내가 좋아하는 스타일로 옷장을 새로 채워요. 큰 소비와 낮은 중고 가치를 함께 확인해요.',price:10000000,monthly:0,happy:5,resale:.2,decay:.1,icon:'wardrobe'},
 {id:'lux-audio',type:'luxury',name:'홈 오디오와 취미 공간',tag:'집에서 즐기는 작은 공연장',description:'좋아하는 음악을 제대로 듣는 공간. 다른 사람보다 나의 취향을 위한 소비예요.',price:15000000,monthly:0,happy:6,resale:.35,decay:.08,icon:'audio'},
 {id:'trip-domestic',type:'experience',name:'둘이 떠나는 국내 휴가',tag:'3박 4일 · 숙박·교통 가정',description:'좋은 숙소에서 쉬고 맛있는 음식을 먹는 여행. 짧은 휴가를 오래 기억해요.',price:1500000,monthly:0,happy:5,icon:'travel'},
 {id:'trip-overseas',type:'experience',name:'편안한 일주일 해외여행',tag:'일주일 · 항공·숙박 가정',description:'일정에 쫓기지 않고 새로운 도시를 걸어요. 휴가를 다녀오는 것 자체가 목표예요.',price:8000000,monthly:0,happy:8,overseas:true,icon:'travel'},
 {id:'trip-long',type:'experience',name:'한 달 살아보기',tag:'한 달 · 항공·생활비 가정',description:'잠시 다른 도시에서 살아보는 경험. 일상으로 돌아온 뒤에도 새로운 기억이 남아요.',price:20000000,monthly:0,happy:10,overseas:true,icon:'travel'}
];
export const SHOP_BY_ID=Object.fromEntries(SHOP_ITEMS.map(x=>[x.id,x]));
