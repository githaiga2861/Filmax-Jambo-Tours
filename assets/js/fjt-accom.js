/* ═══════════════════════════════════════════════════════════════
   FJT DAY ACCOMMODATION SELECTOR — Aerial Kenya
   Renders per-day lodge options into .fjt-accom-mount[data-day]
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // delta: 'flat' (Included/default), 'up' (Premium upgrade), 'down' (Lower cost)
  var DATA = {
    1: [
      { name:'Mara Plains Camp', type:'Ultra-Luxury Tented', delta:'flat',
        img:'assets/maasaimara.webp',
        getting:'Private charter Wilson Airport to Mara airstrip, then 20-min game-drive transfer to camp.',
        gettingFull:'Your journey begins at Nairobi\'s Wilson Airport where a private light aircraft awaits. The 45-minute scenic flight crosses the Great Rift Valley escarpment before descending onto the Mara airstrip. From there, a 20-minute game-drive transfer brings you to camp — your first wildlife sightings happen before you even check in.',
        acts:'Afternoon game drive · Photographer briefing · Sundowner on the plains.',
        actsFull:['Afternoon game drive as the savannah turns gold','Personal photographer briefing and equipment setup','Private sundowner cocktails overlooking the plains','Welcome dinner under the stars'],
        desc:'Mara Plains Camp is a flagship ultra-luxury property of just seven tents on a private conservancy bordering the reserve. Raised on timber decks above the Ntiakitiak River, each suite blends contemporary design with deep-bush authenticity. Exceptional guiding, exclusive traversing rights, and unmatched access to big cats.',
        facts:[['Suites','7 tented suites'],['Setting','Olare Motorogi Conservancy'],['Standout','Private river deck'],['Board','All-inclusive premium']] },
      { name:'Governors\' Camp', type:'Classic Luxury Tented', delta:'down',
        img:'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&auto=format&fit=crop',
        getting:'Charter to Musiara airstrip, 10-min transfer to camp on the Mara River.',
        gettingFull:'A private charter flight from Wilson Airport lands at Musiara airstrip in the heart of the reserve. The camp is just a 10-minute transfer away, set directly on the banks of the Mara River where hippo and elephant are regular visitors to the camp frontage.',
        acts:'Riverside game drive · Hippo pool walk · Bush dinner.',
        actsFull:['Game drive along the Mara River','Guided hippo pool walk with an armed ranger','Riverside bush dinner','Optional early-evening birding walk'],
        desc:'Governors\' Camp is the original Mara safari camp, established in 1972 in a prime riverside location once reserved for visiting governors. Classic East-African safari style with en-suite tents facing the river. Lower price point, legendary location, consistently excellent guiding.',
        facts:[['Tents','37 tents'],['Setting','Mara River frontage'],['Standout','Historic prime location'],['Board','Full board + drinks']] },
      { name:'Angama Mara', type:'Designer Cliff Lodge', delta:'up',
        img:'https://images.unsplash.com/photo-1621414050946-1b4b7e5c5a5a?w=800&q=80&auto=format&fit=crop',
        getting:'Charter to Angama airstrip, short transfer up the Oloololo escarpment.',
        gettingFull:'Private charter to the dedicated Angama airstrip, followed by a short transfer up onto the Oloololo escarpment. The lodge sits 300 metres above the Mara floor, with one of the most celebrated views in all of Africa — the panorama from Out of Africa.',
        acts:'Escarpment sundowner · Out of Africa picnic site · Photographic studio.',
        actsFull:['Game drive descending onto the Mara floor','Out of Africa picnic at the original film location','Sundowner on the escarpment edge','Visit to the on-site photographic studio and beadwork workshop'],
        desc:'Angama Mara is a design icon — its name means "suspended in mid-air" in Swahili, and the glass-fronted suites deliver exactly that, floating above the Mara Triangle. Floor-to-ceiling views, a dedicated photographic studio, and a beadwork atelier supporting the local community.',
        facts:[['Suites','30 glass-fronted suites'],['Setting','Oloololo escarpment, 300m up'],['Standout','The most famous view in Africa'],['Board','All-inclusive premium']] }
    ],
    2: [
      { name:'Mara Plains Camp', type:'Ultra-Luxury Tented', delta:'flat',
        img:'assets/maasaimara.webp',
        getting:'Remain at camp — no transfer. Full day in the conservancy.',
        gettingFull:'No transfer today. You remain at Mara Plains Camp for a full immersive day, allowing your guide and photographer to plan around the light and the movements of the wildlife rather than logistics.',
        acts:'Dawn big-cat drive · Balloon safari · Photographic session.',
        actsFull:['Pre-dawn departure for big cats in first light','Hot-air balloon safari over the Mara at sunrise','Champagne bush breakfast','Dedicated photographic session with your guide'],
        desc:'A second night at Mara Plains lets you settle into the rhythm of the conservancy. With exclusive traversing rights and very few other vehicles, the big-cat photography here is among the finest in Kenya.',
        facts:[['Suites','7 tented suites'],['Setting','Olare Motorogi Conservancy'],['Standout','Exclusive big-cat traversing'],['Board','All-inclusive premium']] },
      { name:'Kicheche Mara Camp', type:'Eco Luxury Tented', delta:'down',
        img:'https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=800&q=80&auto=format&fit=crop',
        getting:'Short conservancy transfer if switching from Day 1 camp.',
        gettingFull:'If you select Kicheche for this leg, a short 30-minute conservancy transfer brings you across to the camp, set in a quiet valley of the Mara North Conservancy.',
        acts:'Walking safari · Dawn drive · Conservation talk.',
        actsFull:['Guided walking safari with a Maasai naturalist','Dawn game drive in Mara North','Evening conservation talk on predator monitoring','Night drive (conservancy permits)'],
        desc:'Kicheche Mara Camp is an intimate, eco-conscious camp of just eight tents in the Mara North Conservancy. Multiple-award-winning for its photographic guiding and low-impact ethos. Excellent value within the premium tier.',
        facts:[['Tents','8 tents'],['Setting','Mara North Conservancy'],['Standout','Award-winning photo guiding'],['Board','Full board + drinks']] },
      { name:'Angama Mara', type:'Designer Cliff Lodge', delta:'up',
        img:'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80&auto=format&fit=crop',
        getting:'Remain on the escarpment, or transfer up if switching.',
        gettingFull:'Stay perched on the Oloololo escarpment for a second day, or transfer up if you selected a different lodge for Day 1. Descents onto the Mara Triangle floor for game drives take around 20 minutes.',
        acts:'Balloon over the Triangle · Studio session · Sundowner.',
        actsFull:['Balloon safari over the Mara Triangle','Photographic studio editing session','Mara Triangle full-day game drive','Escarpment-edge sundowner'],
        desc:'A second day at Angama maximises the photographic potential of the Mara Triangle — the least-crowded, most game-rich sector of the reserve, accessed directly from the lodge.',
        facts:[['Suites','30 glass-fronted suites'],['Setting','Oloololo escarpment'],['Standout','Mara Triangle access'],['Board','All-inclusive premium']] }
    ],
    3: [
      { name:'Tortilis Camp', type:'Luxury Tented · Amboseli', delta:'flat',
        img:'assets/amboseli.webp',
        getting:'Light aircraft Mara to Amboseli airstrip, 15-min transfer to camp.',
        gettingFull:'A private aircraft carries you from the Mara across to Amboseli airstrip (roughly 1 hour 15 minutes with a brief Nairobi touchdown). From the airstrip, a 15-minute transfer delivers you to camp, with Kilimanjaro filling the horizon as you arrive.',
        acts:'Afternoon elephant drive · Kilimanjaro sundowner.',
        actsFull:['Afternoon game drive among Amboseli\'s great elephant herds','Sundowner with Kilimanjaro as the backdrop','Evening Maasai cultural welcome','Stargazing dinner'],
        desc:'Tortilis Camp is named for the umbrella acacia and enjoys arguably the finest private Kilimanjaro view in Amboseli. Set in its own conservancy on the park boundary, it combines classic tented luxury with strong eco-credentials and excellent elephant access.',
        facts:[['Tents','17 tents + private house'],['Setting','Kitirua Conservancy'],['Standout','Best private Kili view'],['Board','Full board + drinks']] },
      { name:'Ol Tukai Lodge', type:'Classic Lodge · In-Park', delta:'down',
        img:'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80&auto=format&fit=crop',
        getting:'Amboseli airstrip, 10-min transfer to the lodge in the park core.',
        gettingFull:'Land at Amboseli airstrip and transfer just 10 minutes to Ol Tukai, positioned in the heart of the national park between the Enkongo Narok and Olkenya swamps — prime elephant territory.',
        acts:'Swamp game drive · Observation Hill.',
        actsFull:['Game drive along the elephant swamps','Observation Hill panoramic sunset','Evening film on Amboseli\'s elephant research','Buffet dinner with mountain views'],
        desc:'Ol Tukai Lodge sits in the park core amid yellow-barked acacia, with chalet-style rooms and sweeping lawns frequented by elephant. A reliable classic at a friendlier price, with unbeatable in-park location for early starts.',
        facts:[['Rooms','80 chalet rooms'],['Setting','Amboseli park core'],['Standout','Central swamp access'],['Board','Full board']] },
      { name:'angama Amboseli', type:'Designer Suites', delta:'up',
        img:'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80&auto=format&fit=crop',
        getting:'Amboseli airstrip, 25-min transfer to Kimana Sanctuary.',
        gettingFull:'From Amboseli airstrip, a 25-minute transfer brings you to the Kimana Sanctuary — a vital wildlife corridor between Amboseli and Tsavo. The newest designer property in the region.',
        acts:'Big-tusker tracking · Treehouse hide · Sundowner.',
        actsFull:['Tracking Amboseli\'s legendary big-tusker elephants','Photographic hide session at the waterhole','Treehouse sundowner','Private dinner overlooking Kilimanjaro'],
        desc:'Angama Amboseli is the region\'s most recent design statement, set in the Kimana Sanctuary, home to some of Africa\'s last great "tusker" elephants. Floor-to-ceiling Kilimanjaro views, an elevated photographic hide, and a treehouse.',
        facts:[['Suites','10 suites'],['Setting','Kimana Sanctuary'],['Standout','Big-tusker elephants'],['Board','All-inclusive premium']] }
    ],
    4: [
      { name:'Tortilis Camp', type:'Luxury Tented · Amboseli', delta:'flat',
        img:'assets/amboseli.webp',
        getting:'Remain at camp — full day in Amboseli.',
        gettingFull:'No transfer today. A full day in Amboseli allows for both the clearest dawn Kilimanjaro views and the rich late-afternoon light on the elephant herds.',
        acts:'Dawn Kili shoot · Swamp drive · Maasai village.',
        actsFull:['Pre-dawn Kilimanjaro photographic session','Game drive through the elephant swamps','Maasai village cultural visit','Bush dinner under the acacias'],
        desc:'A second day at Tortilis lets you photograph Kilimanjaro at its clearest — typically just after dawn — and explore the conservancy on foot, an option not available inside the national park.',
        facts:[['Tents','17 tents + private house'],['Setting','Kitirua Conservancy'],['Standout','Walking safaris permitted'],['Board','Full board + drinks']] },
      { name:'Kibo Safari Camp', type:'Value Tented', delta:'down',
        img:'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80&auto=format&fit=crop',
        getting:'Short in-park transfer if switching lodges.',
        gettingFull:'A short transfer within the Amboseli area brings you to Kibo Safari Camp, just outside the park\'s Kimana gate.',
        acts:'Full-day game drive · Pool afternoon.',
        actsFull:['Full-day game drive with picnic lunch','Afternoon by the pool with mountain views','Evening cultural dance','Buffet dinner'],
        desc:'Kibo Safari Camp offers comfortable en-suite tents at the most accessible price point in Amboseli, with a large pool and reliable game access through the Kimana gate. Ideal for travellers prioritising value.',
        facts:[['Tents','70 tents'],['Setting','Kimana gate'],['Standout','Best value in Amboseli'],['Board','Full board']] },
      { name:'angama Amboseli', type:'Designer Suites', delta:'up',
        img:'https://images.unsplash.com/photo-1604005950576-7d6a3a1c1c79?w=800&q=80&auto=format&fit=crop',
        getting:'Remain in Kimana Sanctuary, or transfer if switching.',
        gettingFull:'Stay within the Kimana Sanctuary for a second day, or transfer across (25 min) if you selected a different lodge for Day 3.',
        acts:'Hide photography · Tusker tracking · Spa.',
        actsFull:['Dawn session in the elevated photographic hide','Continued big-tusker tracking','In-suite spa treatment','Private chef dinner'],
        desc:'A second day at Angama Amboseli deepens your time with the sanctuary\'s tusker elephants and makes full use of the photographic hide for eye-level waterhole imagery.',
        facts:[['Suites','10 suites'],['Setting','Kimana Sanctuary'],['Standout','Eye-level photo hide'],['Board','All-inclusive premium']] }
    ],
    5: [
      { name:'Sasaab', type:'Moroccan-Style Lodge · Samburu', delta:'flat',
        img:'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80&auto=format&fit=crop',
        getting:'Light aircraft Amboseli to Samburu airstrip, 20-min transfer.',
        gettingFull:'A private aircraft flies you north from Amboseli to Samburu (with a brief Nairobi connection), landing at the airstrip near the Westgate Conservancy. A 20-minute transfer brings you to the lodge above the Ewaso Ng\'iro River.',
        acts:'Afternoon Samburu Special Five drive · River sundowner.',
        actsFull:['Afternoon drive for the Samburu Special Five','Sundowner above the Ewaso Ng\'iro River','Samburu warrior cultural welcome','Star-bed dinner option'],
        desc:'Sasaab is a striking Moroccan-influenced lodge of nine open-fronted rooms, each with a private plunge pool, set high above the Ewaso Ng\'iro in the Westgate Conservancy. Camel rides, river access, and authentic Samburu cultural connection set it apart.',
        facts:[['Rooms','9 open rooms + pools'],['Setting','Westgate Conservancy'],['Standout','Private plunge pools'],['Board','All-inclusive premium']] },
      { name:'Samburu Intrepids', type:'Classic Tented · Riverside', delta:'down',
        img:'assets/zebra.webp',
        getting:'Samburu airstrip, 15-min transfer to the riverside camp.',
        gettingFull:'Land at Samburu airstrip and transfer 15 minutes to Intrepids, set directly on the banks of the Ewaso Ng\'iro within the national reserve itself.',
        acts:'Reserve game drive · River hippo watch.',
        actsFull:['Game drive in Samburu National Reserve','Riverside hippo and crocodile watching','Evening Samburu dance performance','Riverbank dinner'],
        desc:'Samburu Intrepids is a classic riverside tented camp inside the reserve, with elephants crossing the river in view of the dining area. Strong value and a prime in-reserve location for early game drives.',
        facts:[['Tents','27 tents'],['Setting','Ewaso Ng\'iro, in-reserve'],['Standout','River frontage'],['Board','Full board + drinks']] },
      { name:'Saruni Samburu', type:'Designer Rock Lodge', delta:'up',
        img:'https://images.unsplash.com/photo-1605448749334-9e1a6f7d8a3e?w=800&q=80&auto=format&fit=crop',
        getting:'Samburu airstrip, 45-min transfer to Kalama Conservancy.',
        gettingFull:'From Samburu airstrip a 45-minute transfer climbs into the Kalama Conservancy, where the lodge is built into a rocky kopje with vast views over the wilderness.',
        acts:'Conservancy drive · Singing wells · Infinity pool.',
        actsFull:['Game drive in the exclusive Kalama Conservancy','Visit to the Samburu singing wells','Infinity-pool sundowner over the valley','Stargazing with resident astronomer'],
        desc:'Saruni Samburu is an architectural lodge of six villas carved into a kopje in the private Kalama Conservancy, with a celebrated infinity pool and panoramic views. Exclusive, design-led, and deeply private.',
        facts:[['Villas','6 villas'],['Setting','Kalama Conservancy'],['Standout','Kopje infinity pool'],['Board','All-inclusive premium']] }
    ],
    6: [
      { name:'Sasaab', type:'Moroccan-Style Lodge · Samburu', delta:'flat',
        img:'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80&auto=format&fit=crop',
        getting:'Remain at lodge — full day in Samburu.',
        gettingFull:'No transfer today. A full day allows deeper exploration of the Westgate Conservancy and the reserve, plus time for the lodge\'s signature camel ride and cultural experiences.',
        acts:'Camel ride · Special Five drive · Cultural visit.',
        actsFull:['Morning camel ride along the river','Full game drive for the Samburu Special Five','Samburu village cultural immersion','Sundowner and bush dinner'],
        desc:'A second day at Sasaab opens up its signature experiences — camel-back exploration, a deeper cultural connection with the Samburu community, and unhurried river-valley game drives.',
        facts:[['Rooms','9 open rooms + pools'],['Setting','Westgate Conservancy'],['Standout','Camel safaris'],['Board','All-inclusive premium']] },
      { name:'Elephant Bedroom Camp', type:'Intimate Tented', delta:'down',
        img:'assets/Coolelephant.webp',
        getting:'Short reserve transfer if switching lodges.',
        gettingFull:'A short transfer into the national reserve brings you to Elephant Bedroom Camp, set among doum palms on the riverbank where elephants frequently wander between the tents.',
        acts:'River drive · Elephant watch · Plunge pool.',
        actsFull:['Riverside game drive','Elephants wandering through camp','Private plunge-pool relaxation','Bush breakfast on the sand'],
        desc:'Elephant Bedroom Camp is an intimate twelve-tent camp famous for the elephants that walk through it. Each tent has a private plunge pool. Characterful, well-priced, and unforgettable for its close elephant encounters.',
        facts:[['Tents','12 tents + plunge pools'],['Setting','Samburu Reserve riverbank'],['Standout','Elephants in camp'],['Board','Full board + drinks']] },
      { name:'Saruni Samburu', type:'Designer Rock Lodge', delta:'up',
        img:'https://images.unsplash.com/photo-1605448749334-9e1a6f7d8a3e?w=800&q=80&auto=format&fit=crop',
        getting:'Remain in Kalama, or transfer up if switching.',
        gettingFull:'Stay in the elevated Kalama Conservancy for a second day, or transfer up (45 min) if you chose a different lodge for Day 5.',
        acts:'Walking safari · Singing wells · Astronomy.',
        actsFull:['Guided walking safari in Kalama','Deeper visit to the Samburu singing wells','Infinity-pool afternoon','Astronomy session with telescope'],
        desc:'A second day at Saruni Samburu adds walking safaris and a richer cultural and astronomical programme, all from the privacy of the Kalama Conservancy kopje.',
        facts:[['Villas','6 villas'],['Setting','Kalama Conservancy'],['Standout','Walking safaris'],['Board','All-inclusive premium']] }
    ],
    7: [
      { name:'Giraffe Manor', type:'Iconic Boutique · Nairobi', delta:'flat',
        img:'assets/girraffefeeding.webp',
        getting:'Aircraft Samburu to Nairobi Wilson, 40-min transfer to Karen.',
        gettingFull:'A private aircraft returns you from Samburu to Nairobi\'s Wilson Airport, followed by a 40-minute transfer to the Karen suburb and the gates of Giraffe Manor.',
        acts:'Giraffe breakfast · Sheldrick elephants · Karen Blixen.',
        actsFull:['Breakfast with resident Rothschild\'s giraffes','David Sheldrick elephant orphanage private visit','Karen Blixen Museum tour','Farewell dinner at the Manor'],
        desc:'Giraffe Manor is one of the world\'s most photographed boutique hotels — a 1930s manor where a herd of Rothschild\'s giraffes pokes their heads through the windows at breakfast. Twelve elegant rooms and a once-in-a-lifetime farewell to Kenya.',
        facts:[['Rooms','12 rooms'],['Setting','Karen, Nairobi'],['Standout','Giraffes at breakfast'],['Board','Full board']] },
      { name:'Hemingways Nairobi', type:'Luxury City Hotel', delta:'down',
        img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop',
        getting:'Wilson Airport, 20-min transfer to Karen.',
        gettingFull:'From Wilson Airport, a 20-minute transfer brings you to Hemingways, a refined colonial-style hotel in Karen with views toward the Ngong Hills.',
        acts:'Sheldrick elephants · Spa · Karen shopping.',
        actsFull:['David Sheldrick elephant orphanage visit','Award-winning spa treatment','Karen craft and curio shopping','Fine-dining farewell dinner'],
        desc:'Hemingways Nairobi is a 45-suite luxury hotel blending colonial elegance with contemporary service, butler-attended throughout. A polished, lower-priced alternative for the final night, with an exceptional spa.',
        facts:[['Suites','45 suites'],['Setting','Karen, Nairobi'],['Standout','Butler service + spa'],['Board','Bed & breakfast']] },
      { name:'Hemingways House (Private)', type:'Exclusive Villa', delta:'up',
        img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop',
        getting:'Wilson Airport, private transfer to exclusive residence.',
        gettingFull:'A private transfer from Wilson Airport delivers you to an exclusive-use residence in Karen, staffed with a private chef and butler for your final night.',
        acts:'Private chef dinner · Sheldrick · Helicopter option.',
        actsFull:['Private chef tasting dinner','Exclusive after-hours Sheldrick experience','Optional Nairobi National Park helicopter flight','Personalised farewell ceremony'],
        desc:'For the ultimate finale, an exclusive-use private residence with full staff, a private chef, and bespoke experiences. Complete privacy and a tailored send-off from Kenya.',
        facts:[['Capacity','Exclusive-use villa'],['Setting','Karen, Nairobi'],['Standout','Private chef & staff'],['Board','All-inclusive bespoke']] }
    ],
    8: [
      { name:'Departure Lounge · Wilson', type:'Day-Use Suite', delta:'flat',
        img:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop',
        getting:'Karen transfer to Wilson, or onward to JKIA for international flights.',
        gettingFull:'A final transfer brings you from Karen to either Wilson Airport for a domestic connection or to Jomo Kenyatta International Airport (JKIA) for your onward international flight. Day-use lounge access is arranged for comfort before departure.',
        acts:'Final breakfast · Last-minute shopping · Lounge access.',
        actsFull:['Leisurely final breakfast','Optional last-minute curio shopping','Private airport lounge access','Assisted check-in and farewell'],
        desc:'Your journey concludes with an unhurried morning and seamless transfer to the airport, with private lounge access arranged so your final hours in Kenya are as relaxed as the rest of your safari.',
        facts:[['Service','Day-use lounge'],['Setting','Wilson / JKIA'],['Standout','Seamless departure'],['Board','Breakfast']] }
    ]
  };

  function deltaLabel(d){
    if(d==='flat') return { cls:'flat', text:'Included · Default' };
    if(d==='up')   return { cls:'up',   text:'Premium upgrade' };
    return { cls:'down', text:'Lower cost' };
  }
  function flagLabel(d, isDef){
    if(isDef) return { cls:'is-default', text:'Default Lodge' };
    return { cls:'', text:'Alternative' };
  }

  var TICK = '<svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l3.5 3.5L12 1" stroke="#080808" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW = '<svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s){ return (s||'').replace(/"/g,'&quot;'); }

  function cardHTML(day, idx, a){
    var isDef = (a.delta==='flat');
    var fl = flagLabel(a.delta, isDef);
    var dl = deltaLabel(a.delta);
    return ''+
    '<div class="fjt-accom-card'+(isDef?' selected':'')+'" data-day="'+day+'" data-idx="'+idx+'">'+
      '<div class="fjt-accom-card-imgwrap">'+
        '<img src="'+a.img+'" alt="'+esc(a.name)+'" loading="lazy">'+
        '<span class="fjt-accom-flag '+fl.cls+'">'+fl.text+'</span>'+
        '<span class="fjt-accom-delta '+dl.cls+'">'+dl.text+'</span>'+
        '<span class="fjt-accom-tick">'+TICK+'</span>'+
      '</div>'+
      '<div class="fjt-accom-card-body">'+
        '<div class="fjt-accom-name">'+a.name+'</div>'+
        '<div class="fjt-accom-type">'+a.type+'</div>'+
        '<div class="fjt-accom-mini">'+
          '<div class="fjt-accom-mini-head">📍 Getting There</div>'+
          '<div class="fjt-accom-mini-text">'+a.getting+'</div>'+
          '<button class="fjt-accom-mini-link" data-modal="getting" data-day="'+day+'" data-idx="'+idx+'">More details '+ARROW+'</button>'+
        '</div>'+
        '<div class="fjt-accom-mini">'+
          '<div class="fjt-accom-mini-head">✦ Activity Highlights</div>'+
          '<div class="fjt-accom-mini-text">'+a.acts+'</div>'+
          '<button class="fjt-accom-mini-link" data-modal="acts" data-day="'+day+'" data-idx="'+idx+'">More details '+ARROW+'</button>'+
        '</div>'+
        '<button class="fjt-accom-viewbtn" data-modal="accom" data-day="'+day+'" data-idx="'+idx+'">View accommodation details</button>'+
      '</div>'+
    '</div>';
  }

  function render(mount){
    var day = mount.getAttribute('data-day');
    var list = DATA[day];
    if(!list){ return; }
    var cards = list.map(function(a,i){ return cardHTML(day,i,a); }).join('');
    mount.innerHTML =
      '<div class="fjt-accom-wrap">'+
        '<div class="fjt-accom-toggle">'+
          '<span class="fjt-accom-toggle-label">🏕 Accommodation Options '+
            '<span class="fjt-accom-toggle-count">'+list.length+' lodges for this night</span>'+
          '</span>'+
          '<span class="fjt-accom-toggle-chevron">'+ARROW+'</span>'+
        '</div>'+
        '<div class="fjt-accom-panel">'+
          '<div class="fjt-accom-hint">A default lodge is pre-selected and already included in your quoted price. Tap any other lodge to swap it into your journey — you\'ll see whether it\'s a premium upgrade or a lower-cost option.</div>'+
          '<div class="fjt-accom-grid">'+cards+'</div>'+
          '<div class="fjt-accom-confirm" data-confirm="'+day+'"></div>'+
        '</div>'+
      '</div>';
  }

  // ── Modal ──
  function ensureModal(){
    if(document.getElementById('fjtAccomModal')) return;
    var o = document.createElement('div');
    o.className = 'fjt-modal-overlay'; o.id = 'fjtAccomModal';
    o.innerHTML = '<div class="fjt-modal"><button class="fjt-modal-close" aria-label="Close">×</button><div id="fjtAccomModalInner"></div></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function(e){ if(e.target===o) closeModal(); });
    o.querySelector('.fjt-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });
  }
  function openModal(html){
    ensureModal();
    document.getElementById('fjtAccomModalInner').innerHTML = html;
    var o = document.getElementById('fjtAccomModal');
    o.classList.add('open');
    o.querySelector('.fjt-modal').scrollTop = 0;
  }
  function closeModal(){
    var o = document.getElementById('fjtAccomModal');
    if(o) o.classList.remove('open');
  }

  function accomModalHTML(a){
    var facts = a.facts.map(function(f){ return '<li><strong style="color:var(--gold)">'+f[0]+':</strong> '+f[1]+'</li>'; }).join('');
    return '<img class="fjt-modal-img" src="'+a.img+'" alt="'+esc(a.name)+'">'+
      '<div class="fjt-modal-body">'+
        '<span class="fjt-modal-eyebrow">Accommodation</span>'+
        '<h3 class="fjt-modal-title">'+a.name+'</h3>'+
        '<div class="fjt-modal-sub">'+a.type+'</div>'+
        '<p class="fjt-modal-p">'+a.desc+'</p>'+
        '<div class="fjt-modal-divider"></div>'+
        '<span class="fjt-modal-eyebrow">At a Glance</span>'+
        '<ul class="fjt-modal-list">'+facts+'</ul>'+
      '</div>';
  }
  function gettingModalHTML(a){
    return '<img class="fjt-modal-img" src="'+a.img+'" alt="'+esc(a.name)+'">'+
      '<div class="fjt-modal-body">'+
        '<span class="fjt-modal-eyebrow">Getting There</span>'+
        '<h3 class="fjt-modal-title">'+a.name+'</h3>'+
        '<div class="fjt-modal-sub">How you arrive</div>'+
        '<p class="fjt-modal-p">'+a.gettingFull+'</p>'+
      '</div>';
  }
  function actsModalHTML(a){
    var items = a.actsFull.map(function(x){ return '<li>'+x+'</li>'; }).join('');
    return '<img class="fjt-modal-img" src="'+a.img+'" alt="'+esc(a.name)+'">'+
      '<div class="fjt-modal-body">'+
        '<span class="fjt-modal-eyebrow">Activity Highlights</span>'+
        '<h3 class="fjt-modal-title">'+a.name+'</h3>'+
        '<div class="fjt-modal-sub">What you\'ll do</div>'+
        '<ul class="fjt-modal-list">'+items+'</ul>'+
      '</div>';
  }

  function selectCard(day, idx){
    var grid = document.querySelector('.fjt-accom-mount[data-day="'+day+'"] .fjt-accom-grid');
    if(!grid) return;
    grid.querySelectorAll('.fjt-accom-card').forEach(function(c){ c.classList.remove('selected'); });
    var card = grid.querySelector('.fjt-accom-card[data-idx="'+idx+'"]');
    if(card) card.classList.add('selected');
    var a = DATA[day][idx];
    var conf = document.querySelector('[data-confirm="'+day+'"]');
    if(conf){
      if(a.delta==='flat') conf.innerHTML = '<strong>'+a.name+'</strong> is your default lodge for this night — included in your quoted price.';
      else if(a.delta==='up') conf.innerHTML = 'Selected <strong>'+a.name+'</strong> — a premium upgrade. Your concierge will confirm the adjusted quote.';
      else conf.innerHTML = 'Selected <strong>'+a.name+'</strong> — a lower-cost option. Your concierge will confirm the adjusted quote.';
    }
  }

  function init(){
    var mounts = document.querySelectorAll('.fjt-accom-mount');
    mounts.forEach(render);

    document.addEventListener('click', function(e){
      var toggle = e.target.closest('.fjt-accom-toggle');
      if(toggle){
        toggle.closest('.fjt-accom-wrap').classList.toggle('open');
        return;
      }
      var link = e.target.closest('[data-modal]');
      if(link){
        e.stopPropagation();
        var day = link.getAttribute('data-day');
        var idx = +link.getAttribute('data-idx');
        var a = DATA[day][idx];
        var type = link.getAttribute('data-modal');
        if(type==='accom') openModal(accomModalHTML(a));
        else if(type==='getting') openModal(gettingModalHTML(a));
        else if(type==='acts') openModal(actsModalHTML(a));
        return;
      }
      var card = e.target.closest('.fjt-accom-card');
      if(card){
        selectCard(card.getAttribute('data-day'), +card.getAttribute('data-idx'));
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
