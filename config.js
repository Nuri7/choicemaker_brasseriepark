// BRASSERIE PARK KEUZE MAKER — Configuration
const DEFAULT_QUIZ_QUESTIONS = [
  { id: 'moment', question: 'Wat voor moment is het?', emoji: '⏰', options: [
    { label: 'Ontbijt', emoji: '☀️' }, { label: 'Lunch', emoji: '🥗' },
    { label: 'Borrel', emoji: '🍻' }, { label: 'Diner', emoji: '🍽️' }
  ]},
  { id: 'mood', question: 'Hoe voelt je humeur?', emoji: '😊', options: [
    { label: 'Relaxed', emoji: '😌' }, { label: 'Gezellig', emoji: '🥳' },
    { label: 'Energiek', emoji: '⚡' }, { label: 'Avontuurlijk', emoji: '🗺️' }
  ]},
  { id: 'group', question: 'Met hoeveel personen?', emoji: '👥', options: [
    { label: 'Solo', emoji: '👤' }, { label: '2-4', emoji: '👫' }, { label: '5+ groep', emoji: '👨‍👩‍👧‍👦' }
  ]},
  { id: 'hunger', question: 'Hoe hongerig ben je?', emoji: '🍽️', options: [
    { label: 'Lichte snack', emoji: '🍿' }, { label: 'Delen & proeven', emoji: '🫕' }, { label: 'Vol diner', emoji: '🍖' }
  ]},
  { id: 'taste', question: 'Smaakvoorkeur?', emoji: '👨‍🍳', options: [
    { label: 'Frans klassiek', emoji: '🇫🇷' }, { label: 'Aziatisch', emoji: '🌏' },
    { label: 'Van de BBQ', emoji: '🥩' }, { label: 'Vegetarisch', emoji: '🥬' }
  ]},
  { id: 'drink', question: 'Drink voorkeur?', emoji: '🥤', options: [
    { label: 'Koffie/thee', emoji: '☕' }, { label: 'Fris/sap', emoji: '🥤' },
    { label: 'Wijn', emoji: '🍷' }, { label: 'Bier', emoji: '🍺' }, { label: 'Cocktail', emoji: '🍸' }
  ]}
];

const DEFAULT_SCORING_RULES = {
  moment: {
    'Ontbijt':  { breakfast: 12, 'coffee-tea': 8, light: 5, sweet: 4 },
    'Lunch':    { sandwich: 9, salad: 7, warm: 7, lunch: 8, soup: 5, snack: 3 },
    'Borrel':   { snack: 12, beer: 8, wine: 7, cocktail: 6, shared: 8, borrel: 10 },
    'Diner':    { dinner: 12, starter: 6, main: 10, wine: 7, cocktail: 5, dessert: 4 }
  },
  mood: {
    'Relaxed':      { wine: 5, 'coffee-tea': 6, light: 5, salad: 4, 'wine-rose': 3 },
    'Gezellig':     { shared: 8, beer: 6, cocktail: 5, snack: 6, borrel: 5, bubbels: 3 },
    'Energiek':     { fresh: 5, salad: 3, lunch: 4, 'coffee-tea': 5, smoothie: 4 },
    'Avontuurlijk': { asian: 8, adventurous: 8, cocktail: 5, starter: 4, 'wine-orange': 3 }
  },
  group: {
    'Solo':     { 'coffee-tea': 5, light: 4, sandwich: 4, breakfast: 3, soft: 2 },
    '2-4':      { shared: 5, wine: 4, dinner: 4, cocktail: 3 },
    '5+ groep': { shared: 10, group: 10, beer: 5, snack: 6, borrel: 5 }
  },
  hunger: {
    'Lichte snack':    { snack: 10, light: 8, sweet: 5, side: 4, breakfast: 3 },
    'Delen & proeven': { shared: 12, starter: 8, snack: 5, borrel: 6 },
    'Vol diner':       { main: 12, filling: 10, dinner: 8, sandwich: 4, warm: 5 }
  },
  taste: {
    'Frans klassiek':  { classic: 10, comfort: 6, wine: 4, dinner: 3, 'wine-red': 3 },
    'Aziatisch':       { asian: 12, adventurous: 6, fresh: 4, spicy: 5 },
    'Van de BBQ':      { bge: 12, meat: 8, filling: 5, comfort: 4, beer: 3 },
    'Vegetarisch':     { vegan: 8, vegetarian: 10, fresh: 6, salad: 4, smoothie: 3 }
  },
  drink: {
    'Koffie/thee':  { 'coffee-tea': 18, warm: 3 },
    'Fris/sap':     { soft: 14, smoothie: 10, fresh: 5 },
    'Wijn':         { wine: 14, 'wine-red': 5, 'wine-white': 5 },
    'Bier':         { beer: 18, 'beer-0': 5 },
    'Cocktail':     { cocktail: 14, mocktail: 8 }
  }
};

const SECTION_TAG_MAP = {
  'ONTBIJT':                ['food','breakfast','light'],
  'TAARTEN':                ['food','sweet','dessert','light','breakfast'],
  'LUNCH - PARK SPECIALS':  ['food','lunch','warm','filling'],
  'SANDWICHES':             ['food','sandwich','lunch'],
  'SOEPEN':                 ['food','soup','warm','lunch'],
  'MAALTIJD SALADES':       ['food','salad','fresh','lunch'],
  'DESSERTS':               ['food','dessert','sweet'],
  'BORREL - PLANKEN':       ['food','shared','snack','borrel','group'],
  'HAPPEN':                 ['food','snack','borrel'],
  'COMFORT VOORGERECHT':    ['food','dinner','starter','comfort'],
  'COMFORT HOOFDGERECHT':   ['food','dinner','main','filling','comfort'],
  'GENIET VOORGERECHT':     ['food','dinner','starter','classic'],
  'GENIET HOOFDGERECHT':    ['food','dinner','main','filling','classic'],
  'PAK UIT VOORGERECHT':    ['food','dinner','starter','premium','adventurous'],
  'PAK UIT HOOFDGERECHT':   ['food','dinner','main','filling','premium','adventurous'],
  'TUSSENGERECHT':          ['food','dinner','soup'],
  'BIJGERECHTEN':           ['food','side','dinner'],
  'KOFFIE & THEE':          ['drink','coffee-tea','non-alcoholic','warm'],
  'WARME SPECIALITEITEN':   ['drink','coffee-tea','non-alcoholic','warm'],
  'KOUDE DRANKEN':          ['drink','soft','non-alcoholic'],
  'SMOOTHIES':              ['drink','smoothie','non-alcoholic','fresh'],
  'SAPPEN':                 ['drink','smoothie','non-alcoholic','fresh'],
  'BIER TAP':               ['drink','beer','alcohol'],
  'BIER FLES':              ['drink','beer','alcohol'],
  'ALCOHOLVRIJ BIER':       ['drink','beer-0','non-alcoholic'],
  'GIN & TONIC':            ['drink','cocktail','gin-tonic','alcohol'],
  'COCKTAILS':              ['drink','cocktail','alcohol'],
  'MOCKTAILS':              ['drink','mocktail','non-alcoholic'],
  'WITTE WIJN':             ['drink','wine','wine-white','alcohol'],
  'ROSÉ':                   ['drink','wine','wine-rose','alcohol'],
  'RODE WIJN':              ['drink','wine','wine-red','alcohol'],
  'BUBBELS':                ['drink','wine','bubbels','alcohol'],
  'DESSERTWIJN':            ['drink','wine','dessert-wine','alcohol','sweet'],
  'CIDER':                  ['drink','beer','alcohol']
};

const KEYWORD_TAGS = [
  { pattern: /vegan|plant/i, tags: ['vegan','vegetarian','fresh'] },
  { pattern: /vega|vegetarisch/i, tags: ['vegetarian'] },
  { pattern: /miso|dashi|paksoi|soja|pokébowl|asian|gember|sesam|zeewier|tom kha|wasabi|yuzu/i, tags: ['asian','adventurous'] },
  { pattern: /big green egg|BGE|gegrilld|gegrilde/i, tags: ['bge','meat','comfort'] },
  { pattern: /rundvlees|kalfsmuis|varken|ibérico|angus|steak|spek/i, tags: ['meat','filling'] },
  { pattern: /zalm|zeewolf|tonijn|gamba|vis|kreeft|garnaal|rivierkreeft/i, tags: ['fish','dinner'] },
  { pattern: /truffel|parmesan|parmezaan|burrata|kaas|camembert|cheddar/i, tags: ['comfort','classic'] },
  { pattern: /chocolade|éclair|mousse|cheesecake|taart|blondie|macaron/i, tags: ['sweet','dessert','comfort'] },
  { pattern: /bitterballen|kroket|bittergarnituur|chicken bites|kaastengels/i, tags: ['classic','snack','comfort','borrel'] },
  { pattern: /friet|boerenfriet/i, tags: ['comfort','filling','side'] },
  { pattern: /salade|sla|spinazie|avocado/i, tags: ['fresh','salad'] },
  { pattern: /soep|pastinaak/i, tags: ['soup','warm','comfort'] },
  { pattern: /burger/i, tags: ['bge','filling','comfort','lunch'] },
  { pattern: /waldorf|klassiek|vitello|supreme/i, tags: ['classic'] },
  { pattern: /sriracha|harissa|chili|wasabi|kimchi/i, tags: ['spicy','adventurous','asian'] },
  { pattern: /cappuccino|latte|espresso|flat white|koffie/i, tags: ['coffee-tea'] },
  { pattern: /prosecco|champagne|crémant/i, tags: ['bubbels'] },
  { pattern: /IPA|pale ale|weizen|pilsener|blond/i, tags: ['beer'] },
  { pattern: /smoothie|juice|jus|sap/i, tags: ['fresh','smoothie'] },
  { pattern: /gin|martini|spritz|aperol/i, tags: ['cocktail'] },
  { pattern: /gyoza/i, tags: ['asian','adventurous'] }
];

const MOMENT_COPY = {
  'Ontbijt':  'Een perfecte start van je ochtend bij Brasserie Park! ☀️',
  'Lunch':    'Heerlijk middagmoment in de Houtkamp. Lekker luchtig! 🌤️',
  'Borrel':   'Borreltijd! Gezelligheid staat voorop bij het Park. 🍻',
  'Diner':    'Een avond vol smaak in de huiskamer van Leiderdorp. ✨'
};
const MOOD_COPY = {
  'Relaxed':      'Lekker rustig aan — precies de Park vibe.',
  'Gezellig':     'Gezelligheid is onze tweede natuur!',
  'Energiek':     'Vol energie? Wij geven je precies de juiste boost.',
  'Avontuurlijk': 'Ga voor iets nieuws — wij dagen je uit!'
};
const HUNGER_COPY = {
  'Lichte snack':    'Een klein hapje erbij — perfect om te delen of solo te snacken.',
  'Delen & proeven': 'Samen tafelen, samen genieten — precies zoals het hoort.',
  'Vol diner':       'Je hebt trek — en wij hebben precies wat je nodig hebt.'
};
const DRINK_COPY = {
  'Koffie/thee':  'Een goed kopje, dat is de basis. ☕',
  'Fris/sap':     'Iets fris en verfrissends — onze smoothies en sappen zijn top!',
  'Wijn':         'Onze wijnen zijn met liefde geselecteerd. 🍷',
  'Bier':         'Van huisbiertje Frisse Neus tot Belgisch speciaal — wij hebben \'m!',
  'Cocktail':     'Onze bartenders shaken iets moois voor je. 🍸'
};

const MENU_FILES = ['menu/dagkaart.md', 'menu/dinerkaart.md', 'menu/dranken.md'];
