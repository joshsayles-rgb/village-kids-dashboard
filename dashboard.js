'use strict';

// --- CONSTANTS ---
const WORKER_URL    = VKShared.CONFIG.WORKER_URL;
const ALERTS_REFRESH_MS = 5000;
const REFRESH_MS    = 30000;
const CLASS_ORDER   = ['Nursery','Toddler/Wobbler','Preschool','Kindergarten - 1st Grade','2nd-3rd Grade','4th-6th Grade'];
const ANN_COLORS    = { Info:{bar:'#5d8da1',bg:'rgba(93,141,161,.1)',text:'#3a7490'}, Urgent:{bar:'#954a4b',bg:'rgba(149,74,75,.1)',text:'#7a2e2f'}, Event:{bar:'#a0b46a',bg:'rgba(160,180,106,.12)',text:'#608030'}, Prayer:{bar:'#a9794d',bg:'rgba(169,121,77,.1)',text:'#7a5030'} };
const LS            = { DARK:'vk_dark', CD:'vk_cd', PIN_EXPIRE:'vk_pin_exp' };

const NCC = [
  ['What is our only hope in life and death?','That we are not our own but belong, body and soul, in life and in death, to God and to our Savior Jesus Christ.','That we are not our own but belong to God.','Romans 14:7\\u20138'],
  ['What is God?','God is the creator and sustainer of everyone and everything. He is eternal, infinite, and unchangeable in his power and perfection, goodness and glory, wisdom, justice, and truth. Nothing happens except through him and by his will.','God is the creator of everyone and everything.','Psalm 86:15'],
  ['How many persons are there in God?','There are three persons in the one true and living God: the Father, the Son, and the Holy Spirit. They are the same in substance, equal in power and glory.','There are three persons in one God: the Father, the Son, and the Holy Spirit.','Matthew 28:19'],
  ['How and why did God create us?','God created us male and female in his own image to know him, love him, live with him, and glorify him. And it is right that we who were created by God should live to his glory.','God created us male and female in his own image to glorify him.','Genesis 1:27'],
  ['What else did God create?','God created all things by his powerful Word, and all his creation was very good; everything flourished under his loving rule.','God created all things and all his creation was very good.','Genesis 1:31'],
  ['How can we glorify God?','We glorify God by enjoying him, loving him, trusting him, and by obeying his will, commands, and law.','By loving him and by obeying his commands and law.','1 Corinthians 10:31'],
  ['What does the law of God require?','Personal, perfect, and perpetual obedience; that we love God with all our heart, soul, mind, and strength; and love our neighbor as ourselves. What God forbids should never be done and what God commands should always be done.','That we love God with all our heart, soul, mind, and strength; and love our neighbor as ourselves.','Matthew 22:37\\u201340'],
  ['What is the law of God stated in the Ten Commandments?','You shall have no other gods before me. You shall not make idols. You shall not take the name of the Lord your God in vain. Remember the Sabbath day. Honor your father and your mother. You shall not murder. You shall not commit adultery. You shall not steal. You shall not bear false witness. You shall not covet.','You shall have no other gods before me. You shall not make for yourself an idol. You shall not misuse the name of the Lord your God. Remember the Sabbath day by keeping it holy. Honor your father and your mother. You shall not murder. You shall not commit adultery. You shall not steal. You shall not give false testimony. You shall not covet.','Exodus 20:1\\u201317'],
  ['What does God require in the fourth and fifth commandments?','Fourth, that on the Sabbath day we rest from our daily work and attend the church of God. Fifth, that we love and honor our father and our mother, submitting to their godly discipline and direction.','First, that we know God as the only true God. Second, that we avoid all idolatry. Third, that we treat God\'s name with fear and reverence.','Exodus 20:8'],
  ['What does God require in the sixth, seventh, and eighth commandments?','Sixth, that we do not hurt, or hate, or be hostile to our neighbor, but be patient and peaceful, pursuing even our enemies with love. Seventh, that we live purely and faithfully in marriage, or in singleness, avoiding all unchaste actions, desires, words, looks, and thoughts. Eighth, that we do not take without permission that which belongs to someone else, but further the financial interests of our neighbor wherever we can and may.','Fourth, that on the Sabbath day we spend time in worship of God. Fifth, that we love and honor our father and our mother.','Matthew 5:44'],
  ['What does God require in the ninth and tenth commandments?','Ninth, that we do not lie or deceive, but speak the truth in love. Tenth, that we are content, not envying anyone or resenting what God has given them or us.','Sixth, that we do not hurt or hate our neighbor. Seventh, that we live purely and faithfully. Eighth, that we do not take without permission that which belongs to someone else.','Ephesians 4:25'],
  ['Can anyone keep the law of God perfectly?','Since the fall, no mere human has been able to keep the law of God perfectly, but consistently breaks it in thought, word, and deed.','Ninth, that we do not lie or deceive. Tenth, that we are content, not envying anyone.','Ecclesiastes 7:20'],
  ['Since no one can keep the law, what is its purpose?','That we may know the holy nature and will of God, and the sinful nature and disobedience of our hearts; and thus our need of a Savior. The law also teaches and exhorts us to live a life worthy of our Savior.','Since the fall, no human has been able to keep the law of God perfectly.','Romans 3:20'],
  ['What is sin?','Sin is rejecting or ignoring God in the world he created, rebelling against him by living without reference to him, not being or doing what he requires in his law \\u2014 resulting in our death and the disintegration of all creation.','No, but because of the disobedience of Adam and Eve we are all born in sin and guilt, unable to keep God\'s law.','1 John 3:4'],
  ['What is idolatry?','Idolatry is trusting in created things rather than the Creator for our hope and happiness, significance and security.','That we may know the holy nature of God, and the sinful nature of our hearts; and thus our need of a Savior.','Galatians 5:19\\u201321'],
  ['Will God allow our disobedience and idolatry to go unpunished?','No, every sin is against the sovereignty, holiness, and goodness of God, and against his righteous law, and God is righteously angry with our sins and will punish them in his just judgment both in this life, and in the life to come.','Sin is rejecting or ignoring God in the world he created, not being or doing what he requires in his law.','Hebrews 10:31'],
  ['Is there any way to escape punishment and be reconciled to God?','Yes, to satisfy his justice, God himself, out of mere mercy, reconciles us to himself and delivers us from sin and its punishment through a Redeemer.','Idolatry is trusting in created things rather than the Creator.','John 3:16'],
  ['Who is the Redeemer?','The only Redeemer is the Lord Jesus Christ, the eternal Son of God, in whom God became man and bore the penalty for sin himself.','No, God is righteously angry with our sins and will punish them both in this life, and in the life to come.','1 Timothy 2:5'],
  ['What sort of Redeemer is needed to bring us back to God?','One who is truly human and also truly God.','Yes, God reconciles us to himself by a Redeemer.','Romans 1:3\\u20134'],
  ['Why must the Redeemer be truly human?','That in human nature he might on our behalf perfectly obey the whole law and suffer the punishment for human sin; and also that he might sympathize with our weaknesses.','The only Redeemer is the Lord Jesus Christ.','Hebrews 2:17'],
  ['Why must the Redeemer be truly God?','That because of his divine nature his obedience and suffering would be perfect and effective; and also that he would be able to bear the righteous anger of God against sin and yet overcome death.','One who is truly human and also truly God.','Isaiah 53:11'],
  ['Why was it necessary for Christ to die?','Because the justice and truth of God required that satisfaction for our sins could be made in no other way than by the death of the Son of God.','That in human nature he might on our behalf perfectly obey the whole law and suffer the punishment for human sin.','Romans 3:25\\u201326'],
  ['How is the grace of God made effective for us?','By the work of the Holy Spirit, who applies to us all that Christ has done.','That because of his divine nature his obedience and suffering would be perfect and effective.','Titus 3:5\\u20136'],
  ['How can we be saved?','Only by faith in Jesus Christ and in his substitutionary atoning death on the cross; so even though I deserve divine judgment, Christ merited salvation for me through his sinless life, death, resurrection, and ascension.','Christ died willingly in our place to deliver us from the power and penalty of sin and bring us back to God.','Ephesians 2:8'],
  ['What is faith in Jesus Christ?','Faith in Jesus Christ is acknowledging the truth of everything that God has revealed in his Word, and also receiving and resting on him alone for salvation as he is offered to us in the gospel.','Yes, because Christ\'s death on the cross fully paid the penalty for our sin, God will remember our sins no more.','John 3:36'],
  ['Should those who have faith in Christ seek their salvation through their own works?','No, they should not, as the best human works cannot earn anything before God, though a life of good works is the natural response of a believing heart.','Every part of fallen creation.','Galatians 2:16'],
  ['Since we are redeemed by grace alone, through faith alone, do we have to keep the law of God?','Yes, because Christ has taken away the curse of the law, we are free from its condemnation and are enabled through the Spirit to live according to it as the loving expression of our gratitude to God.','No, only those who are elected by God and united to Christ by faith.','Romans 8:4'],
  ['What do we believe about the Holy Spirit?','That he is God, coeternal with the Father and the Son, and that God grants him without measure to all who believe.','They will be cast out from the presence of God, into hell, to be justly punished, forever.','Acts 5:3\\u20134'],
  ['What is prayer?','Prayer is pouring out our hearts to God in praise, petition, confession of sin, and thanksgiving.','Only by faith in Jesus Christ and in his substitutionary atoning death on the cross.','1 Thessalonians 5:16\\u201318'],
  ['With what attitude should we pray?','With love, perseverance, and gratefulness; in a humble, sincere manner, from a deep sense of our need, with faith that God will listen because of Christ alone and not because of our own merits.','Receiving and resting on him alone for salvation as he is offered to us in the gospel.','Romans 8:26'],
  ['How is the Word of God to be read and heard?','With diligence, preparation, and prayer; so that we may accept it with faith, store it in our hearts, and practice it in our lives.','We believe in God the Father Almighty, Maker of heaven and earth; and in Jesus Christ his only Son our Lord, who was conceived by the Holy Spirit, born of the virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell. The third day he rose again from the dead. He ascended into heaven, and is seated at the right hand of God the Father Almighty. We believe in the Holy Spirit, the holy catholic church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting.','Colossians 3:16'],
  ['What is baptism?','Baptism is the washing with water in the name of the Father, the Son, and the Holy Spirit; it signifies and seals our adoption into Christ, our cleansing from sin, and our commitment to belong to God and to his people.','Justification means our declared righteousness before God. Sanctification means our gradual, growing righteousness.','Romans 6:3\\u20134'],
  ['Is baptism with water the washing away of sin itself?','No, only the blood of Christ and the renewal of the Holy Spirit can cleanse us from sin.','No, everything necessary to salvation is found in Christ.','Mark 1:8'],
  ['What is the church?','God chooses and preserves for himself a community elected for eternal life and united by faith, who love, follow, learn from, and worship God together. God sends out this community to proclaim the gospel and prefigure his kingdom by the quality of their life together and their love for one another.','Yes, so that our lives may show love and gratitude to God; and so that by our godly behavior others may be won to Christ.','Ephesians 1:22\\u201323'],
  ['Where is Christ now?','Christ rose bodily from the grave on the third day after his death and is seated at the right hand of the Father, ruling his kingdom and interceding for us, until he returns to judge the living and the dead.','From the Holy Spirit.','Romans 8:34'],
  ['What hope does everlasting life hold for us?','It reminds us that this present fallen world is not all there is; soon we will live with and enjoy God forever in the new city, in the new heaven and the new earth, where we will be fully and forever freed from all sin and will inhabit renewed, resurrection bodies in a renewed, restored creation.','That he is God, coeternal with the Father and the Son.','Revelation 21:1\\u20134']
];

const ENCOURAGEMENT = [
  // Jokes
  {type:'joke', setup:'Why did the Sunday school teacher bring a ladder to class?', punchline:'Because the lesson was on going to new heights with God.'},
  {type:'joke', setup:'What kind of car did the disciples drive?', punchline:'A Honda -- because the disciples were all in one Accord.'},
  {type:'joke', setup:'Why did Noah have to punish the chickens on the ark?', punchline:'Because they were using fowl language.'},
  {type:'joke', setup:'What do you call a sleeping dinosaur at Bible camp?', punchline:'A dino-snore.'},
  {type:'joke', setup:'Why couldn\'t Jonah trust the ocean?', punchline:'Because he knew there was something fishy going on.'},
  {type:'joke', setup:'What do you call a group of kids who love Bible trivia?', punchline:'A quiz-tian fellowship.'},
  {type:'joke', setup:'Why did Moses cross the Red Sea?', punchline:'To get to the other side -- obviously. He was kind of committed at that point.'},
  {type:'joke', setup:'What\'s a kids\' ministry volunteer\'s favorite kind of music?', punchline:'Soul music. Obviously.'},
  {type:'joke', setup:'How do angels greet each other?', punchline:'Halo there.'},
  {type:'joke', setup:'Why did the kids\' ministry volunteer bring a map to church?', punchline:'Because they heard the sermon was going to cover a lot of ground.'},
  {type:'joke', setup:'What did the grape say when it got stepped on?', punchline:'Nothing. It just let out a little wine. (You earned this one.)'},
  {type:'joke', setup:'How many kids\' ministry volunteers does it take to change a lightbulb?', punchline:'One to change it and five to bring snacks for the occasion.'},
  // Verses
  {type:'verse', text:'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.', ref:'Zephaniah 3:17'},
  {type:'verse', text:'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.', ref:'Colossians 3:17'},
  {type:'verse', text:'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.', ref:'Galatians 6:9'},
  {type:'verse', text:'Jesus said, "Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these."', ref:'Matthew 19:14'},
  {type:'verse', text:'Whoever welcomes one of these little children in my name welcomes me.', ref:'Mark 9:37'},
  {type:'verse', text:'He gives strength to the weary and increases the power of the weak.', ref:'Isaiah 40:29'},
  {type:'verse', text:'I can do all this through him who gives me strength.', ref:'Philippians 4:13'},
  {type:'verse', text:'Start children off on the way they should go, and even when they are old they will not turn from it.', ref:'Proverbs 22:6'},
  {type:'verse', text:'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.', ref:'Ephesians 2:10'},
  {type:'verse', text:'Being confident of this, that he who began a good work in you will carry it on to completion.', ref:'Philippians 1:6'},
  // More classics
  {type:'joke', setup:'Why did the kids\' ministry volunteer drink decaf?', punchline:'Because they already had enough Holy Spirit energy for the whole building.'},
  {type:'joke', setup:'Why don\'t kids\' ministry volunteers ever get lost?', punchline:'Because they always follow the Way.'},
  {type:'joke', setup:'Why did the kid bring a ladder to worship?', punchline:'He heard the praise was going through the roof.'},
  {type:'joke', setup:'What\'s a kids\' ministry volunteer\'s superpower?', punchline:'The ability to hear a whisper from across a loud room while also leading a craft, answering a theology question, and locating a missing shoe.'},
  {type:'joke', setup:'How does Moses make his coffee?', punchline:'He brews it.'},
  {type:'joke', setup:'Why did Samson never use social media?', punchline:'He didn\'t want anyone cutting his followers.'},
  {type:'joke', setup:'Chuck Norris memorized the entire New Testament.', punchline:'The New Testament then memorized Chuck Norris, just to be safe.'},
  {type:'joke', setup:'Chuck Norris once played freeze tag with a group of kindergartners.', punchline:'The kindergartners are still frozen.'},
  {type:'joke', setup:'What did the Bible say to the pencil?', punchline:'You\'ve got a point.'},
  {type:'joke', setup:'Why did the church musician get locked out?', punchline:'They lost their keys. All of them. Even the one in G.'},
  // Chuck Norris approved
  {type:'joke', setup:'Chuck Norris once taught a Sunday school class.', punchline:'The kids still haven\'t stopped memorizing Scripture.'},
  {type:'joke', setup:'Chuck Norris doesn\'t use a Bible bookmark.', punchline:'The pages are too afraid to move.'},
  {type:'joke', setup:'Chuck Norris can recite the entire book of Psalms.', punchline:'Backwards. In Hebrew. While doing push-ups.'},
  {type:'joke', setup:'How did Chuck Norris part the Red Sea?', punchline:'He just stared at it. The water left voluntarily.'},
  {type:'joke', setup:'Chuck Norris once volunteered in kids\' ministry.', punchline:'The children behaved perfectly. Even the ones in the parking lot.'},

  // Theologian quotes -- verified, focused on children, teaching, and the gospel
  {type:'verse', text:'The opinion that children cannot receive the whole truth of the gospel is a great mistake, for their childlikeness is a help rather than a hindrance; older people must become as little children before they can enter the kingdom.', ref:'C.H. Spurgeon, Come Ye Children'},
  {type:'verse', text:'Teaching is poor work when love is gone; it is like a smith working without a hammer, or a builder without mortar. Where there is no love, there will be no life.', ref:'C.H. Spurgeon, Come Ye Children'},
  {type:'verse', text:'Youth is susceptible to evil doctrine. The only way to keep chaff out of the child\'s little measure is to fill it brimful with good wheat. Oh, that the Spirit of God may help us to do this!', ref:'C.H. Spurgeon, Come Ye Children'},
  {type:'verse', text:'First be fed, and then feed. You cannot feed lambs unless you are first fed yourself.', ref:'C.H. Spurgeon, Come Ye Children'},
  {type:'verse', text:'Do not sin against the child by coming to your class with a chilly heart. Why should you make your children cold toward divine truths?', ref:'C.H. Spurgeon'},
  {type:'verse', text:'He that has trained his children for heaven, rather than for earth -- for God rather than for man -- he is the parent who will be called wise at the last.', ref:'J.C. Ryle, The Duties of Parents'},
  {type:'verse', text:'If you train your children to anything, train them, at least, to a habit of prayer.', ref:'J.C. Ryle, The Duties of Parents'},
  {type:'verse', text:'If you would train your children rightly, train them in the way they should go -- and not in the way that they would.', ref:'J.C. Ryle, The Duties of Parents'},
  {type:'verse', text:'We are not asking our young children to leap in the dark. Real light is shining when you tell the story of the gospel. Your job is to present the truth and pray.', ref:'John Piper'},
  {type:'verse', text:'The gospel is not a way to get people to heaven; it is a way to get people to God. It is a way of overcoming every obstacle to everlasting joy in God.', ref:'John Piper, God Is the Gospel'},
  {type:'verse', text:'God is most glorified in us when we are most satisfied in him.', ref:'John Piper, Desiring God'},
  {type:'verse', text:'Grace is not simply leniency when we have sinned. Grace is the enabling gift of God not to sin. Grace is power, not just pardon.', ref:'John Piper, The Pleasures of God'},
  {type:'verse', text:'The gospel is this: We are more sinful and flawed in ourselves than we ever dared believe, yet at the very same time we are more loved and accepted in Jesus Christ than we ever dared hope.', ref:'Tim Keller, The Prodigal God'},
  {type:'verse', text:'It is not the strength of your faith but the object of your faith that actually saves you. Strong faith in a weak branch is fatally inferior to weak faith in a strong branch.', ref:'Tim Keller, The Reason for God'},

];

// --- STATE ---
const State = {
  data:             null,
  volunteers:       {},
  roomMode:         null, // set by RoomSelect.init()
  isAdminMode:      new URLSearchParams(location.search).get('mode') === 'admin',
  alertDismissed:   false,
  alertCurrentMsg:  '',
  seenAlertIds:     [],
  catMode:          'kids',
  catNum:           0,
  catSettings:      {},

  dismissUrgentAlert() {
    this.alertDismissed = true;
    document.getElementById('alertOverlay').classList.remove('active');
  }
};

// --- UTILITIES ---
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function el(id) { return document.getElementById(id); }
function nowMins() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function parseTimeMins(str) {
  if (!str) return null;
  const m = String(str).match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1]); const min = parseInt(m[2]); const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}
function fmtSecs(s) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// --- CLOCK ---
(function initClock() {
  const DA = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MO_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function tick() {
    const d = new Date();
    const h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    const hh = (h % 12) || 12;
    const mm = String(m).padStart(2, '0');
    el('hclock').textContent = hh + ':' + mm + ' ' + ap;
    el('hdate').textContent  = DA[d.getDay()] + ' ' + d.getDate();
    el('dateBig').textContent  = DA[d.getDay()] + ', ' + MO[d.getMonth()] + ' ' + d.getDate();
    el('dateFull').textContent = MO_FULL[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  tick();
  setInterval(tick, 15000);
})();

// --- SYNC ---
const Sync = {
  fullTimer:  null,
  alertTimer: null,

  // Full sync — all data, slow interval
  async fetch() {
    const dot = el('syncDot');
    dot.className = 'sync-dot loading';
    el('statusText').textContent = 'Syncing\u2026';
    try {
      const data = await VKShared.api.read();
      State.data = data;
      Render.all(data);
      dot.className = 'sync-dot';
      const t = new Date();
      el('lastSync').textContent = 'Synced ' + t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      el('statusText').textContent = 'Live';
    } catch (err) {
      dot.className = 'sync-dot error';
      el('statusText').textContent = 'Error -- ' + err.message;
    }
  },

  // Fast alerts-only poll — no full re-render
  async fetchAlerts() {
    try {
      const data = await VKShared.api.readAlerts();
      if (data && data.alerts && State.data) {
        State.data.alerts = data.alerts;
        Render.alerts(data.alerts);
      }
    } catch (err) {
      // Silent fail on alerts poll — full sync will catch it
    }
  },

  start() {
    this.fetch();
    this.fullTimer  = setInterval(() => this.fetch(),       REFRESH_MS);
    this.alertTimer = setInterval(() => this.fetchAlerts(), ALERTS_REFRESH_MS);
  },

  stop() {
    clearInterval(this.fullTimer);
    clearInterval(this.alertTimer);
  }
};

// --- RENDER ---
const Render = {
  all(data) {
    State.volunteers = data.volunteers || {};
    this.ticker(data.ticker || []);
    this.announcements(data.announcements || []);
    this.classes(data.classes || []);
    this.settings(data.settings || {});
    this.alerts(data.alerts || []);
    CD.update(data.classes || []);
    Vol.render();
    CheckIn.render(data.checkIns || null);
  },

  ticker(items) {
    const wrap  = el('tickerWrap');
    const track = el('tickerTrack');
    const msgs  = items.filter(t => t.message).map(t => esc(t.message));
    if (!msgs.length) { wrap.classList.add('hidden'); return; }
    wrap.classList.remove('hidden');
    const html = msgs.map(m => '<span class="ticker-item">' + m + '</span>').join('');
    // Duplicate for seamless loop, then set animation speed based on content width
    track.innerHTML = html + html;
    // Reset then start -- double rAF ensures layout is complete before measuring
    track.style.animation = 'none';
    track.style.transform = 'translateX(0)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const totalW = track.scrollWidth / 2; // half because content is doubled
        const speed  = 80; // px per second -- adjust for faster/slower
        const dur    = Math.max(8, totalW / speed);
        track.style.animation = 'tickerScroll ' + dur.toFixed(1) + 's linear infinite';
      });
    });
  },

  announcements(items) {
    const isS1 = s => ['1st service','1st','first','1','service1'].includes((s||'').toLowerCase().trim());
    const isS2 = s => ['2nd service','2nd','second','2','service2'].includes((s||'').toLowerCase().trim());
    const global = items.filter(a => !isS1(a.scope) && !isS2(a.scope));
    const s1     = items.filter(a => isS1(a.scope));
    const s2     = items.filter(a => isS2(a.scope));
    this._annList(global, 'annGlobal');
    this._annList(s1,     'annS1');
    this._annList(s2,     'annS2');
  },

  _annList(items, elId) {
    const c = ANN_COLORS;
    el(elId).innerHTML = items.length
      ? items.map(a => {
          const col = c[a.tag] || c.Info;
          return '<div class="ann-item">'
            + '<div class="ann-bar" style="background:' + col.bar + '"></div>'
            + '<div class="ann-body">'
            + '<div class="ann-title">' + esc(a.title) + '</div>'
            + (a.detail ? '<div class="ann-detail">' + esc(a.detail) + '</div>' : '')
            + '<span class="ann-tag" style="background:' + col.bg + ';color:' + col.text + '">' + esc(a.tag || 'Info') + '</span>'
            + '</div></div>';
        }).join('')
      : '<p class="ann-empty">No announcements.</p>';
  },

  classes(rows) {
    const tabBar = el('classTabBar');
    const panels = el('classPanels');

    // Group data
    const groups = {};
    const curriculum = {};
    const notes = {};
    rows.forEach(r => {
      const cls = r.class || '';
      if (!cls) return;
      if (!groups[cls]) groups[cls] = { '1st': [], '2nd': [] };
      const svc = (r.service || '').toLowerCase();
      const key = (svc === '2nd' || svc === 'second') ? '2nd' : '1st';
      groups[cls][key].push(r);
      if (r.curriculum_link && !curriculum[cls]) curriculum[cls] = r.curriculum_link;
      if (r.notes && !notes[cls]) notes[cls] = r.notes;
    });

    const order = [...CLASS_ORDER, ...Object.keys(groups).filter(c => !CLASS_ORDER.includes(c))];

    tabBar.innerHTML = '';
    panels.innerHTML = '';

    order.forEach((cls, i) => {
      if (!groups[cls]) return;
      const isFirst    = i === 0;
      const isRoomMatch = State.roomMode && State.roomMode.toLowerCase() === cls.toLowerCase();
      const active     = State.roomMode ? isRoomMatch : isFirst;

      // Tab
      const btn = document.createElement('button');
      btn.className = 'class-tab' + (active ? ' active' : '');
      btn.textContent = cls;
      btn.addEventListener('click', () => UI.switchClassTab(cls, btn));
      tabBar.appendChild(btn);

      // Panel
      const panel = document.createElement('div');
      panel.className = 'class-panel' + (active ? ' active' : '') + (isRoomMatch ? ' room-active' : '');
      panel.dataset.cls = cls;

      if (curriculum[cls]) {
        const a = document.createElement('a');
        a.className = 'curriculum-btn';
        a.href = curriculum[cls];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Open curriculum folder';
        panel.appendChild(a);
      }
      if (notes[cls]) {
        const nd = document.createElement('div');
        nd.className = 'vol-notes';
        nd.innerHTML = '<div class="vol-notes-label">Volunteer notes</div><div class="vol-notes-text">' + esc(notes[cls]) + '</div>';
        panel.appendChild(nd);
      }

      const grid = document.createElement('div');
      grid.className = 'sched-grid';
      ['1st','2nd'].forEach((svc, si) => {
        const col  = document.createElement('div');
        const lbl  = document.createElement('div');
        lbl.className = 'svc-label svc-label-' + (si + 1);
        lbl.textContent = svc + ' Service';
        col.appendChild(lbl);
        col.innerHTML += this._schedRows(groups[cls][svc] || []);
        grid.appendChild(col);
      });
      panel.appendChild(grid);
      panels.appendChild(panel);
    });
  },

  _schedRows(rows) {
    if (!rows.length) return '<p class="no-sched">No schedule.</p>';
    const now       = nowMins();
    const autoIdx   = (() => {
      let cur = -1;
      rows.forEach((r, i) => { const t = parseTimeMins(r.time); if (t !== null && t <= now) cur = i; });
      return cur;
    })();

    return rows.map((r, i) => {
      const isNow = i === autoIdx;
      let progress = '';
      if (isNow && i + 1 < rows.length) {
        const s = parseTimeMins(r.time) || 0;
        const e = parseTimeMins(rows[i+1].time) || s + 30;
        const pct = Math.min(100, Math.max(0, Math.round((now - s) / (e - s) * 100)));
        progress = '<div class="sched-progress"><div class="sched-progress-fill" style="width:' + pct + '%"></div></div>';
      }
      const isPickup = (r.event || '').toLowerCase().includes('pickup') || (r.event || '').toLowerCase().includes('pick up');
      const dot = isNow ? 'var(--red)' : isPickup ? 'var(--tan)' : 'var(--faint)';
      return '<div class="sched-row' + (isNow ? ' now' : '') + '">'
        + '<span class="sched-time">' + esc(r.time) + '</span>'
        + '<div class="sched-dot" style="background:' + dot + '"></div>'
        + '<div class="sched-info">'
        + '<span class="sched-event">' + esc(r.event) + (isNow ? '<span class="now-pill">Now</span>' : '') + '</span>'
        + (r.detail ? '<div class="sched-detail">' + esc(r.detail) + '</div>' : '')
        + progress
        + '</div></div>';
    }).join('');
  },

  settings(s) {
    if (s.service1_time) el('svc1Label').textContent = s.service1_time;
    if (s.service2_time) el('svc2Label').textContent = s.service2_time;
    el('svcNote').textContent = s.service_note || '';
    Cat.render(s);
    this.verse(s);
  },

  verse(s) {
    const card = el('verseCard');
    const text = s.verse_full || '';
    const ref  = s.verse_ref  || '';
    if (!text) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    el('verseText').textContent = text;
    el('verseRef').textContent  = ref;
  },

  alerts(alerts) {
    // Urgent broadcast alerts
    const urgent = alerts.find(a => a.type === 'Urgent');
    const msg    = urgent ? urgent.message : '';
    if (msg && msg !== State.alertCurrentMsg) {
      State.alertCurrentMsg = msg;
      State.alertDismissed  = false;
      el('alertTitle').textContent = 'Urgent Alert';
      el('alertMsg').textContent   = msg;
      el('alertOverlay').classList.add('active');
      Audio.playAlarm();
    } else if (!msg) {
      State.alertCurrentMsg = '';
      el('alertOverlay').classList.remove('active');
    } else if (msg === State.alertCurrentMsg && !State.alertDismissed) {
      el('alertOverlay').classList.add('active');
    }

    // Room alerts (admin mode only)
    if (!State.isAdminMode) return;
    const roomAlerts = alerts.filter(a => a.type === 'Room alert');
    if (!roomAlerts.length) { el('iaBanner').classList.remove('active'); return; }
    let hasNew = false;
    const list = el('iaList');
    list.innerHTML = '';
    roomAlerts.forEach(a => {
      if (!State.seenAlertIds.includes(a.id)) { hasNew = true; State.seenAlertIds.push(a.id); }
      list.innerHTML += '<div class="ia-alert-item">'
        + '<span class="ia-msg">' + esc(a.message) + '</span>'
        + '<span class="ia-time">' + esc(a.time) + '</span>'
        + '</div>';
    });
    if (hasNew && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    if (hasNew) Audio.playChime();
    el('iaBanner').classList.add('active');
  }
};

// --- CATECHISM ---
const Cat = {
  render(s) {
    State.catSettings = s;
    const num = parseInt(s.catechism_number || '0', 10);
    State.catNum = num;
    const q  = el('catQ');
    const a  = el('catA');
    const sc = el('catS');
    const n  = el('catNum');
    const btn = el('catBtn');
    if (num >= 1 && num <= 52) {
      const entry = NCC[num - 1];
      q.textContent  = entry[0];
      sc.textContent = entry[3];
      a.textContent  = State.catMode === 'kids' ? entry[2] : entry[1];
      n.textContent  = 'Q' + num;
      btn.style.display = 'inline-flex';
      a.classList.remove('revealed');
      el('catBtnLabel').textContent = 'Reveal answer';
      this._syncBtns();
    } else {
      q.innerHTML = '<span style="font-family:DM Sans,sans-serif;font-size:12px;color:rgba(255,255,255,.3);font-style:normal">Set Catechism Number in Weekly Settings.</span>';
      btn.style.display = 'none';
    }
  },
  setMode(mode) {
    State.catMode = mode;
    this._syncBtns();
    const num = State.catNum;
    if (num >= 1 && num <= 52) {
      const entry = NCC[num - 1];
      const a = el('catA');
      a.textContent = mode === 'kids' ? entry[2] : entry[1];
      a.classList.remove('revealed');
      el('catBtnLabel').textContent = 'Reveal answer';
    }
  },
  toggle() {
    const a = el('catA');
    const showing = a.classList.toggle('revealed');
    el('catBtnLabel').textContent = showing ? 'Hide answer' : 'Reveal answer';
  },
  _syncBtns() {
    el('catKids').className  = 'dc-mode-btn' + (State.catMode === 'kids'  ? ' active' : '');
    el('catAdult').className = 'dc-mode-btn' + (State.catMode === 'adult' ? ' active' : '');
  }
};

// --- COUNTDOWN ---
const CD = {
  service:    localStorage.getItem(LS.CD + '_svc') || '1st',
  cls:        localStorage.getItem(LS.CD + '_cls') || '',
  allRows:    [],
  timer:      null,

  update(rows) {
    this.allRows = rows;
    // Auto-detect service based on room mode or current time
    this.service = this.detectService();
    // Auto-select class based on room mode
    if (State.roomMode) {
      this.cls = State.roomMode;
    } else if (!this.cls) {
      for (const c of CLASS_ORDER) {
        if (this.getRows(c, this.service).length) { this.cls = c; break; }
      }
    }
    this.tick();
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 1000);
  },

  detectService() {
    const now = nowMins();
    // Get last 1st service time and first 2nd service time
    const times1st = this.allRows
      .filter(r => (r.service||'').toLowerCase() !== '2nd' && r.time)
      .map(r => parseTimeMins(r.time)).filter(t => t !== null).sort((a,b)=>a-b);
    const times2nd = this.allRows
      .filter(r => (r.service||'').toLowerCase() === '2nd' && r.time)
      .map(r => parseTimeMins(r.time)).filter(t => t !== null).sort((a,b)=>a-b);
    // No 2nd service data -- always use 1st
    if (!times2nd.length) return '1st';
    const start2nd = times2nd[0];
    const end1st   = times1st.length ? times1st[times1st.length - 1] : 0;
    // Use 2nd only if we're past the midpoint between end of 1st and start of 2nd
    const midpoint = end1st + (start2nd - end1st) / 2;
    if (now >= midpoint) return '2nd';
    return '1st';
  },

  getRows(cls, svc) {
    return this.allRows.filter(r => {
      const rc  = r.class || '';
      const rs  = (r.service || '').toLowerCase();
      const is2 = rs === '2nd' || rs === 'second';
      return rc === cls && (svc === '2nd' ? is2 : !is2);
    });
  },

  tick() {
    // Re-detect service on every tick so it switches automatically
    this.service = this.detectService();
    if (State.roomMode) this.cls = State.roomMode;
    const bar = el('countdownBar');
    const rows = this.getRows(this.cls, this.service);
    if (!rows.length) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';

    const now    = nowMins();
    const nowSec = new Date().getSeconds();
    let curIdx = -1;
    rows.forEach((r, i) => { const t = parseTimeMins(r.time); if (t !== null && t <= now) curIdx = i; });

    const evtEl   = el('cdEvent');
    const rightEl = el('cdRight');
    const hint    = el('cdHint');
    hint.textContent = (this.cls || 'All') + ' \u2022 ' + this.service;

    // Pickup detection
    const pickup = el('pickupBanner');
    const isPickup = curIdx >= 0 && ((rows[curIdx].event || '').toLowerCase().includes('pickup') || (rows[curIdx].event || '').toLowerCase().includes('pick up'));
    if (pickup) pickup.classList.toggle('hidden', !isPickup);

    const nextIdx = curIdx + 1;

    if (curIdx === -1) {
      const first = rows[0]; const fm = parseTimeMins(first.time);
      if (fm !== null) {
        const sl = (fm - now) * 60 - nowSec;
        evtEl.textContent = '\u2018' + (first.event || '') + '\u2019 coming up';
        Flap.render(rightEl, Math.max(0, sl), false);
      }
      return;
    }
    if (nextIdx >= rows.length) {
      // Last event in schedule \u2014 show it as current with Now pill
      evtEl.textContent = rows[curIdx].event || '';
      rightEl.innerHTML = '<span class="cd-pill">Now</span>';
      return;
    }
    const next = rows[nextIdx]; const nm = parseTimeMins(next.time);
    if (nm !== null) {
      const sl2 = (nm - now) * 60 - nowSec;
      const isPickupNext = (next.event || '').toLowerCase().includes('pickup') || (next.event || '').toLowerCase().includes('pick up');
      if (sl2 <= 0) {
        // Next event has already started \u2014 show it as current
        evtEl.textContent = next.event || '';
        rightEl.innerHTML = '<span class="cd-pill">Now</span>';
      } else {
        // Count down to next event
        evtEl.textContent = '\u2018' + (next.event || '') + '\u2019 coming up';
        Flap.render(rightEl, sl2, isPickupNext);
      }
    }
  },

};

// --- ROOM ALERTS ---
const RoomAlert = {
  async send(type) {
    const room = State.roomMode || 'Unknown';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = { operation: 'create', database: 'alerts', data: {
      Message: [{ text: { content: room + ': ' + type } }],
      Type:    { name: 'Room alert' },
      Room:    { name: room },
      Time:    [{ text: { content: time } }],
      Active:  true,
    }};
    try {
      await fetch(WORKER_URL + '?action=write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
    } catch (e) { /* fire and forget */ }
    el('raSent').style.display = 'block';
    setTimeout(() => { UI.closeRoomAlert(); el('raSent').style.display = 'none'; }, 2000);
  }
};

async function clearRoomAlerts() {
  const data = State.data;
  if (!data) return;
  const roomAlerts = (data.alerts || []).filter(a => a.type === 'Room alert');
  await Promise.all(roomAlerts.map(a =>
    fetch(WORKER_URL + '?action=write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'delete', pageId: a.id }),
      cache: 'no-store',
    }).catch(() => {})
  ));
  State.seenAlertIds = [];
  el('iaBanner').classList.remove('active');
  Sync.fetch();
}

// --- ENCOURAGEMENT ---
const Enc = {
  idx: -1,
  next() {
    let i;
    do { i = Math.floor(Math.random() * ENCOURAGEMENT.length); } while (i === this.idx && ENCOURAGEMENT.length > 1);
    this.idx = i;
    const item = ENCOURAGEMENT[i];
    const body = el('encBody');
    if (item.type === 'joke') {
      body.innerHTML = '<span class="enc-type-badge enc-type-joke">Joke</span>'
        + '<div class="enc-setup">' + esc(item.setup) + '</div>'
        + '<div class="enc-punchline">' + esc(item.punchline) + '</div>';
    } else {
      body.innerHTML = '<span class="enc-type-badge enc-type-verse">Quote</span>'
        + '<div class="enc-verse-text">' + esc(item.text) + '</div>'
        + '<div class="enc-verse-ref">' + esc(item.ref) + '</div>';
    }
  }
};

// --- UI ---
const UI = {
  toggleDark() {
    VKShared.toggleDark({ key: LS.DARK });
  },

  switchSvcTab(n) {
    el('tab1').className = 'svc-tab' + (n === 1 ? ' s1' : '');
    el('tab2').className = 'svc-tab' + (n === 2 ? ' s2' : '');
    el('panelS1').className = 'svc-panel' + (n === 1 ? ' active' : '');
    el('panelS2').className = 'svc-panel' + (n === 2 ? ' active' : '');
  },

  switchClassTab(cls, btn) {
    document.querySelectorAll('.class-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.class-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.class-panel').forEach(p => {
      if (p.dataset.cls === cls) p.classList.add('active');
    });
  },

  openRoomAlert() {
    el('raSent').style.display = 'none';
    el('raTitle').textContent = State.roomMode ? 'Alert from ' + State.roomMode : 'Send alert';
    el('raOverlay').classList.add('open');
  },
  closeRoomAlert() { el('raOverlay').classList.remove('open'); },

  openEnc() { Enc.next(); el('encOverlay').classList.add('open'); },
  closeEnc() { el('encOverlay').classList.remove('open'); },
};

// \u2500\u2500 ROOM SELECT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const RoomSelect = {
  LS_KEY: 'vk_room',

  init() {
    const urlRoom = new URLSearchParams(location.search).get('room');
    if (urlRoom) { this.apply(urlRoom); return; }
    const urlMode = new URLSearchParams(location.search).get('mode');
    if (urlMode === 'admin') { this.applyAdmin(); return; }
    const saved = localStorage.getItem(this.LS_KEY);
    if (saved === '__none__') return;
    if (saved === '__admin__') { this.applyAdmin(); return; }
    if (saved) { this.apply(saved); return; }
    this.open(false);
  },

  open(isChange) {
    const list = document.getElementById('roomSelectList');
    const current = localStorage.getItem(this.LS_KEY) || State.roomMode || '';
    list.innerHTML = CLASS_ORDER.map(function(cls) {
      return '<button class="room-btn' + (cls === current ? ' selected' : '') + '" onclick="RoomSelect.pick(this)">' + cls + '</button>';
    }).join('');
    // Admin option at bottom
    list.innerHTML += '<button class="room-btn" style="margin-top:4px;background:var(--tan-l);color:var(--tan);border-color:rgba(169,121,77,.25);font-weight:600" onclick="RoomSelect.pickAdmin()">\u2699\ufe0f Admin</button>';
    if (isChange) {
      list.innerHTML += '<button class="room-btn" onclick="RoomSelect.clear()" style="margin-top:4px;border-style:dashed;color:var(--muted)">No specific room \u2014 show everything</button>';
    }
    document.getElementById('roomSelectOverlay').classList.add('open');
  },

  pick(btn) {
    const room = btn.textContent.trim();
    localStorage.setItem(this.LS_KEY, room);
    document.getElementById('roomSelectOverlay').classList.remove('open');
    this.apply(room);
  },

  pickAdmin() {
    document.getElementById('roomSelectOverlay').classList.remove('open');
    const pin = prompt('Enter admin PIN:');
    if (pin === '2024') {
      this.applyAdmin();
    } else if (pin !== null) {
      alert('Incorrect PIN.');
    }
  },

  applyAdmin() {
    State.roomMode   = null;
    State.isAdminMode = true;
    localStorage.setItem(this.LS_KEY, '__admin__');
    document.body.classList.remove('room-mode');
    document.getElementById('roomBar').classList.add('visible');
    document.getElementById('roomBarName').textContent = 'Admin';
    document.getElementById('annSection').style.display   = '';
    document.getElementById('faithSection').style.display = '';
    document.getElementById('roomAlertSection').style.display = 'none';
    // Show admin FAB
    const fab = document.getElementById('cpFab');
    if (fab) fab.style.display = 'flex';
    if (State.data) Render.all(State.data);
  },

  clear() {
    localStorage.setItem(this.LS_KEY, '__none__');
    document.getElementById('roomSelectOverlay').classList.remove('open');
    State.roomMode    = null;
    State.isAdminMode = false;
    document.body.classList.remove('room-mode');
    document.getElementById('roomBar').classList.remove('visible');
    document.getElementById('annSection').style.display = '';
    document.getElementById('faithSection').style.display = '';
    document.getElementById('roomAlertSection').style.display = 'none';
    const fab = document.getElementById('cpFab');
    if (fab) fab.style.display = 'none';
    if (State.data) Render.classes(State.data.classes || []);
    Vol.render();
  },

  skip() { this.clear(); },

  apply(room) {
    State.roomMode = room;
    document.body.classList.add('room-mode');
    document.getElementById('roomBar').classList.add('visible');
    document.getElementById('roomBarName').textContent = room;
    // Announcements and catechism/verse always visible in all modes
    document.getElementById('annSection').style.display   = '';
    document.getElementById('faithSection').style.display = '';
    document.getElementById('roomAlertSection').style.display = 'block';
    document.getElementById('raTitle').textContent = 'Alert from ' + room;
    if (State.data) Render.classes(State.data.classes || []);
    Vol.render();
  }
};


// \u2500\u2500 PWA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PWA = {
  deferredPrompt: null,
  LS_KEY: 'vk_pwa_dismissed',

  init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js', {
        scope: '/village-kids-dashboard/'
      }).then(reg => {
        console.log('SW registered:', reg.scope);
      }).catch(err => {
        console.warn('SW registration failed:', err);
      });
    }

    // Android install prompt
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (!localStorage.getItem(this.LS_KEY)) {
        this.showBanner();
      }
    });

    // iOS: show manual instructions if not already installed and not dismissed
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    if (isIOS && !isStandalone && !localStorage.getItem(this.LS_KEY)) {
      // Show after a short delay so it doesn't flash on load
      setTimeout(() => this.showBanner(), 3000);
    }
  },

  showBanner() {
    document.getElementById('installBanner').classList.add('show');
  },

  async install() {
    if (this.deferredPrompt) {
      // Android: trigger native install
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      if (result.outcome === 'accepted') {
        this.dismiss();
      }
    } else {
      // iOS: can't trigger natively, banner already shows instructions
      this.dismiss();
    }
  },

  dismiss() {
    localStorage.setItem(this.LS_KEY, '1');
    document.getElementById('installBanner').classList.remove('show');
  }
};


// \u2500\u2500 FLAP DISPLAY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Flap = {
  prev: {},

  render(container, totalSecs, isPickup) {
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    // Only show days if > 0
    const units = d > 0
      ? [['D', d], ['H', h], ['M', m], ['S', s]]
      : [['H', h], ['M', m], ['S', s]];

    const key = units.map(u => u[1]).join('-');
    if (key === this.prev.key && container.children.length > 0) {
      // Just flip changed digits
      this._updateDigits(container, units);
      this.prev.key = key;
      return;
    }
    this.prev.key = key;

    // Build HTML
    let html = '<div class="flap-wrap">';
    units.forEach(([label, val], i) => {
      const str = String(val).padStart(2, '0');
      html += '<div class="flap-unit">';
      html += '<div class="flap-card">';
      for (const ch of str) {
        html += '<div class="flap-digit" data-val="' + ch + '">' + ch + '</div>';
      }
      html += '</div>';
      html += '<div class="flap-label">' + label + '</div>';
      html += '</div>';
      // Add separator between units (not after last)
      if (i < units.length - 1) {
        html += '<div class="flap-sep">:</div>';
      }
    });

    // Pickup encouragement
    if (isPickup) {
      html += '<div class="cd-pickup-msg">\u2014 Finish well!</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  },

  _updateDigits(container, units) {
    const digits = container.querySelectorAll('.flap-digit');
    const vals = units.reduce((acc, [, v]) => {
      const s = String(v).padStart(2, '0');
      acc.push(...s);
      return acc;
    }, []);
    digits.forEach((el, i) => {
      if (el.dataset.val !== vals[i]) {
        el.dataset.val = vals[i];
        el.textContent = vals[i];
        el.classList.remove('flip');
        void el.offsetWidth; // reflow
        el.classList.add('flip');
      }
    });
  }
};


// \u2500\u2500 AUDIO \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Audio = {
  ctx: null,
  unlocked: false,

  // Call once on any user gesture to unlock iOS audio
  unlock() {
    if (this.unlocked) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Play a silent buffer to unlock
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(0);
      this.unlocked = true;
    } catch (e) {}
  },

  // Play urgent alarm -- three short rising tones
  playAlarm() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this._alarm());
    } else {
      this._alarm();
    }
  },

  _alarm() {
    const now = this.ctx.currentTime;
    const tones = [
      { freq: 880,  start: 0,    dur: 0.18 },
      { freq: 1100, start: 0.22, dur: 0.18 },
      { freq: 1320, start: 0.44, dur: 0.28 },
      { freq: 880,  start: 0.9,  dur: 0.18 },
      { freq: 1100, start: 1.12, dur: 0.18 },
      { freq: 1320, start: 1.34, dur: 0.28 },
    ];
    tones.forEach(({ freq, start, dur }) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.6, now + start + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + start + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  },

  // Play a softer chime for room alerts
  playChime() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this._chime());
    } else {
      this._chime();
    }
  },

  _chime() {
    const now = this.ctx.currentTime;
    const tones = [
      { freq: 660, start: 0,    dur: 0.3 },
      { freq: 880, start: 0.18, dur: 0.4 },
    ];
    tones.forEach(({ freq, start, dur }) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.35, now + start + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + start + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  }
};


// \u2500\u2500 VOLUNTEERS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Vol = {
  activeTab: null,

  render() {
    const vols = State.volunteers || {};
    const card = el('volCard');
    const tabBar = el('volTabBar');
    const panels = el('volPanels');
    console.log('[Vol] render called, card:', !!card, 'vols keys:', Object.keys(vols));
    if (!card || !tabBar || !panels) { console.warn('[Vol] missing DOM elements'); return; }

    // Check if we have any volunteer data
    const classes = CLASS_ORDER.filter(cls => vols[cls] && (vols[cls].first?.length || vols[cls].second?.length));
    console.log('[Vol] classes with volunteers:', classes);
    if (!classes.length) { card.style.display = 'none'; console.log('[Vol] no volunteer data, hiding card'); return; }

    card.style.display = 'block';
    tabBar.innerHTML = '';
    panels.innerHTML = '';

    // In room mode, show only that room's volunteers (no tabs)
    if (State.roomMode) {
      const roomVols = vols[State.roomMode];
      if (!roomVols) { card.style.display = 'none'; return; }
      panels.appendChild(this.buildPanel(roomVols));
      tabBar.style.display = 'none';
      return;
    }

    // No room mode -- show tabs for all classes with volunteers
    tabBar.style.display = '';
    const defaultTab = this.activeTab && classes.includes(this.activeTab) ? this.activeTab : classes[0];

    classes.forEach(cls => {
      const tab = document.createElement('button');
      tab.className = 'class-tab' + (cls === defaultTab ? ' active' : '');
      tab.textContent = this.shortName(cls);
      tab.addEventListener('click', () => {
        this.activeTab = cls;
        tabBar.querySelectorAll('.class-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.innerHTML = '';
        panels.appendChild(this.buildPanel(vols[cls]));
      });
      tabBar.appendChild(tab);
    });

    this.activeTab = defaultTab;
    panels.appendChild(this.buildPanel(vols[defaultTab]));
  },

  buildPanel(volData) {
    const wrap = document.createElement('div');
    if (!volData || (!volData.first?.length && !volData.second?.length)) {
      wrap.innerHTML = '<div class="vol-empty">No volunteers scheduled</div>';
      return wrap;
    }
    const renderGroup = (vols, label, labelClass) => {
      if (!vols?.length) return;
      const lbl = document.createElement('div');
      lbl.className = 'vol-svc-label ' + labelClass;
      lbl.textContent = label + ' Service';
      wrap.appendChild(lbl);
      const roster = document.createElement('div');
      roster.className = 'vol-roster';
      vols.forEach(v => {
        const chip = document.createElement('div');
        chip.className = 'vol-chip';
        chip.innerHTML = '<span class="vol-chip-name">' + esc(v.name) + '</span>'
          + (v.role ? '<span class="vol-chip-role">&nbsp;\u00b7 ' + esc(v.role) + '</span>' : '');
        roster.appendChild(chip);
      });
      wrap.appendChild(roster);
    };
    renderGroup(volData.first,  '1st', 'vol-svc-label-1');
    renderGroup(volData.second, '2nd', 'vol-svc-label-2');
    return wrap;
  },

  shortName(cls) {
    const map = {
      'Nursery':                 'Nursery',
      'Toddler/Wobbler':         'Toddler',
      'Preschool':               'Preschool',
      'Kindergarten - 1st Grade':'K\u20131st',
      '2nd-3rd Grade':           '2nd\u20133rd',
      '4th-6th Grade':           '4th\u20136th',
    };
    return map[cls] || cls;
  }
};


// \u2500\u2500 CONTROL PANEL \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const CP = {
  PIN:     '2024',
  PIN_KEY: 'vk_cp_pin_exp',
  PIN_TTL: 4 * 60 * 60 * 1000,
  pinEntry: '',
  unlocked: false,
  cpData: { announcements: [], ticker: [], settings: {}, alerts: [] },

  open() {
    el('cpOverlay').classList.add('open');
    el('cpDrawer').classList.add('open');
    const exp = parseInt(localStorage.getItem(this.PIN_KEY) || '0');
    if (Date.now() < exp) { this.unlocked = true; this._showContent(); }
    else { this._showPin(); }
  },

  close() {
    el('cpOverlay').classList.remove('open');
    el('cpDrawer').classList.remove('open');
  },

  key(k) {
    if (this.pinEntry.length >= 4) return;
    this.pinEntry += k;
    this._syncDots();
    if (this.pinEntry.length === 4) setTimeout(() => this._checkPin(), 120);
  },

  del() { this.pinEntry = this.pinEntry.slice(0,-1); this._syncDots(); },

  _syncDots() {
    for (let i = 0; i < 4; i++) {
      el('cpd' + i).classList.toggle('filled', i < this.pinEntry.length);
    }
  },

  _checkPin() {
    if (this.pinEntry === this.PIN) {
      localStorage.setItem(this.PIN_KEY, (Date.now() + this.PIN_TTL).toString());
      this.unlocked = true;
      this.pinEntry = '';
      this._syncDots();
      this._showContent();
    } else {
      el('cpPinError').textContent = 'Incorrect PIN';
      this.pinEntry = '';
      this._syncDots();
      setTimeout(() => { el('cpPinError').textContent = ''; }, 1500);
    }
  },

  _showPin() {
    el('cpPin').style.display = '';
    el('cpContent').style.display = 'none';
  },

  async _showContent() {
    el('cpPin').style.display = 'none';
    el('cpContent').style.display = '';
    await this._loadData();
  },

  async _loadData() {
    try {
      const res  = await fetch(WORKER_URL + '?action=read', { cache: 'no-store' });
      const data = await res.json();
      this.cpData.announcements = data.announcements || [];
      this.cpData.ticker        = data.ticker        || [];
      this.cpData.settings      = data.settings      || {};
      this.cpData.alerts        = data.alerts        || [];
      this._renderAll();
    } catch (err) { this._status('err', 'Load failed: ' + err.message); }
  },

  _renderAll() {
    this._renderAlertActive();
    this._renderAnnList();
    this._renderTickerList();
    this._renderSettings();
  },

  _renderAlertActive() {
    const urgent = this.cpData.alerts.find(a => a.type === 'Urgent');
    const sec = el('cpAlertActive');
    if (urgent) {
      sec.innerHTML = '';
      const alertDiv = document.createElement('div');
      alertDiv.className = 'cp-alert-active';
      alertDiv.innerHTML = '<span class="cp-alert-active-text">\u26a0\ufe0f ' + esc(urgent.message) + '</span>'
        + '<button class="cp-btn cp-btn-red">Clear</button>';
      alertDiv.querySelector('button').addEventListener('click', () => CP.Alert.clear(urgent.id));
      sec.appendChild(alertDiv);
    } else { sec.innerHTML = ''; }
  },

  _renderAnnList() {
    const list = el('cpAnnList');
    list.innerHTML = '';
    if (!this.cpData.announcements.length) {
      list.innerHTML = '<div style="font-size:12px;color:var(--muted);font-style:italic;padding:4px 0">No announcements</div>';
      return;
    }
    const ANN_COLORS = { Info:'#5d8da1', Urgent:'#954a4b', Event:'#a0b46a', Prayer:'#a9794d' };
    this.cpData.announcements.forEach(a => {
      const div = document.createElement('div');
      div.className = 'cp-list-item';
      div.style.borderLeft = '3px solid ' + (ANN_COLORS[a.tag] || '#5d8da1');
      const inner = document.createElement('div');
      inner.innerHTML = '<div style="font-weight:500">' + esc(a.title) + '</div>'
        + '<div style="font-size:11px;color:var(--muted)">' + esc(a.scope||'All') + ' \u00b7 ' + esc(a.tag||'Info') + '</div>';
      const btn = document.createElement('button');
      btn.className = 'cp-list-del';
      btn.textContent = '\u00d7';
      btn.addEventListener('click', () => CP.Announcements.remove(a.id));
      div.appendChild(inner);
      div.appendChild(btn);
      list.appendChild(div);
    });
  },

  _renderTickerList() {
    const list = el('cpTickerList');
    list.innerHTML = '';
    if (!this.cpData.ticker.length) {
      list.innerHTML = '<div style="font-size:12px;color:var(--muted);font-style:italic;padding:4px 0">No ticker messages</div>';
      return;
    }
    this.cpData.ticker.forEach(t => {
      const div = document.createElement('div');
      div.className = 'cp-list-item';
      const span = document.createElement('span');
      span.textContent = t.message;
      const btn = document.createElement('button');
      btn.className = 'cp-list-del';
      btn.textContent = '\u00d7';
      btn.addEventListener('click', () => CP.Ticker.remove(t.id));
      div.appendChild(span);
      div.appendChild(btn);
      list.appendChild(div);
    });
  },

  _renderSettings() {
    const s = this.cpData.settings;
    el('cpWs1').value    = s.service1_time    || '';
    el('cpWs2').value    = s.service2_time    || '';
    el('cpWsNote').value = s.service_note     || '';
    el('cpWsCat').value  = s.catechism_number || '';
    el('cpWsVerse').value= s.verse_full       || '';
    el('cpWsRef').value  = s.verse_ref        || '';
  },

  _status(type, msg) {
    const s = el('cpStatus');
    s.className = 'cp-status ' + (type || '');
    s.textContent = msg;
    if (type === 'ok') setTimeout(() => { s.textContent = ''; s.className = 'cp-status'; }, 3000);
  },

  async _write(payload) {
    const data = await VKShared.api.write(payload);
    return data;
  },

  Alert: {
    async send() {
      const msg = el('cpAlertMsg').value.trim();
      if (!msg) { el('cpAlertMsg').focus(); return; }
      const existing = CP.cpData.alerts.find(a => a.type === 'Urgent');
      if (existing) await this.clear(existing.id, true);
      CP._status('', 'Sending...');
      try {
        await CP._write({
          operation: 'create', database: 'alerts',
          data: { Message: [{ text: { content: msg } }], Type: { name: 'Urgent' }, Active: true }
        });
        el('cpAlertMsg').value = '';
        CP._status('ok', 'Alert sent');
        await CP._loadData();
        await syncNow();
      } catch (err) { CP._status('err', err.message); }
    },
    async clear(id, silent) {
      if (!silent) CP._status('', 'Clearing...');
      try {
        await CP._write({ operation: 'delete', pageId: id });
        if (!silent) { CP._status('ok', 'Cleared'); await CP._loadData(); await syncNow(); }
      } catch (err) { if (!silent) CP._status('err', err.message); }
    }
  },

  Announcements: {
    async add() {
      const title  = el('cpAnnTitle').value.trim();
      const detail = el('cpAnnDetail').value.trim();
      const scope  = el('cpAnnScope').value;
      const tag    = el('cpAnnTag').value;
      if (!title) { el('cpAnnTitle').focus(); return; }
      CP._status('', 'Saving...');
      try {
        await CP._write({
          operation: 'create', database: 'announcements',
          data: {
            Title:  [{ text: { content: title } }],
            Detail: [{ text: { content: detail } }],
            Scope:  { name: scope }, Tag: { name: tag }, Active: true,
          }
        });
        el('cpAnnTitle').value = '';
        el('cpAnnDetail').value = '';
        CP._status('ok', 'Saved');
        await CP._loadData();
        await syncNow();
      } catch (err) { CP._status('err', err.message); }
    },
    async remove(id) {
      CP._status('', 'Removing...');
      try {
        await CP._write({ operation: 'delete', pageId: id });
        CP._status('ok', 'Removed');
        await CP._loadData();
        await syncNow();
      } catch (err) { CP._status('err', err.message); }
    }
  },

  Ticker: {
    async add() {
      const msg = el('cpTickerMsg').value.trim();
      if (!msg) { el('cpTickerMsg').focus(); return; }
      CP._status('', 'Saving...');
      try {
        await CP._write({
          operation: 'create', database: 'ticker',
          data: { Message: [{ text: { content: msg } }], Active: true }
        });
        el('cpTickerMsg').value = '';
        CP._status('ok', 'Saved');
        await CP._loadData();
        await syncNow();
      } catch (err) { CP._status('err', err.message); }
    },
    async remove(id) {
      CP._status('', 'Removing...');
      try {
        await CP._write({ operation: 'delete', pageId: id });
        CP._status('ok', 'Removed');
        await CP._loadData();
        await syncNow();
      } catch (err) { CP._status('err', err.message); }
    }
  },

  Settings: {
    async save() {
      const s = CP.cpData.settings;
      if (!s.id) { CP._status('err', 'No settings found'); return; }
      CP._status('', 'Saving...');
      try {
        await CP._write({
          operation: 'update', pageId: s.id,
          data: {
            '1st Service Time': [{ text: { content: el('cpWs1').value.trim() } }],
            '2nd Service Time': [{ text: { content: el('cpWs2').value.trim() } }],
            'Service Note':     [{ text: { content: el('wsNote') ? el('wsNote').value.trim() : el('cpWsNote').value.trim() } }],
            'Catechism Number': parseFloat(el('cpWsCat').value) || null,
            'Memory Verse':     [{ text: { content: el('cpWsVerse').value.trim() } }],
            'Verse Reference':  [{ text: { content: el('cpWsRef').value.trim() } }],
          }
        });
        CP._status('ok', 'Settings saved');
        await syncNow();
      } catch (err) { CP._status('err', err.message); }
    }
  }
};


// \u2500\u2500 CHECK-INS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const CheckIn = {
  render(data) {
    const card = el('checkinCard');
    const body = el('checkinBody');
    if (!card || !body) return;

    if (!data) {
      card.style.display = 'none';
      return;
    }

    card.style.display = '';

    // Update timestamp
    const upd = el('checkinUpdated');
    if (upd) {
      const now = new Date();
      upd.textContent = 'Updated ' + now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    const { byRoom, totals } = data;
    body.innerHTML = '';

    // If no event times found today, hide the card
    if (!data.eventTimes || !data.eventTimes.length) {
      card.style.display = 'none';
      return;
    }

    // Totals row
    const totalWrap = document.createElement('div');
    totalWrap.className = 'checkin-total';
    [
      { num: totals.first,   label: '1st Service' },
      { num: totals.second,  label: '2nd Service' },
      { num: totals.overall, label: 'Total Today'  },
    ].forEach(t => {
      const box = document.createElement('div');
      box.className = 'checkin-total-box';
      box.innerHTML = '<div class="checkin-total-num">' + t.num + '</div>'
        + '<div class="checkin-total-label">' + t.label + '</div>';
      totalWrap.appendChild(box);
    });
    body.appendChild(totalWrap);

    // Per-room grid
    const grid = document.createElement('div');
    grid.className = 'checkin-grid';

    const roomOrder = [
      'Nursery', 'Toddler/Wobbler', 'Preschool',
      'Kindergarten - 1st Grade', '2nd-3rd Grade', '4th-6th Grade'
    ];
    const shortNames = {
      'Nursery':                  'Nursery',
      'Toddler/Wobbler':          'Toddler',
      'Preschool':                'Preschool',
      'Kindergarten - 1st Grade': 'K\u20131st',
      '2nd-3rd Grade':            '2nd\u20133rd',
      '4th-6th Grade':            '4th\u20136th',
    };

    roomOrder.forEach(room => {
      const counts = byRoom[room] || { first: 0, second: 0 };
      const div = document.createElement('div');
      div.className = 'checkin-room';
      div.innerHTML = '<div class="checkin-room-name">' + (shortNames[room] || room) + '</div>'
        + '<div class="checkin-room-counts">'
        + '<div class="checkin-room-svc"><div class="checkin-room-num">' + counts.first + '</div><div class="checkin-room-svc-label s1">1st</div></div>'
        + '<div class="checkin-room-svc"><div class="checkin-room-num">' + counts.second + '</div><div class="checkin-room-svc-label s2">2nd</div></div>'
        + '</div>';
      grid.appendChild(div);
    });
    body.appendChild(grid);
  }
};


// --- INIT ---
(function init() {
  // Dark mode
  if (localStorage.getItem(LS.DARK) === '1') document.body.classList.add('dark');

  // Room mode - handled by RoomSelect module
  RoomSelect.init();

  // Admin mode
  if (State.isAdminMode) {
    el('roomBar').classList.add('visible');
    el('roomBarName').textContent = 'Admin view';
    document.body.classList.add('admin-mode');
  }

  // Admin access via Room picker

  // PWA
  PWA.init();

  // Unlock audio on first tap anywhere
  document.addEventListener('touchstart', () => Audio.unlock(), { once: true });
  document.addEventListener('click', () => Audio.unlock(), { once: true });

  // Wake on visibility
  document.addEventListener('visibilitychange', () => { if (!document.hidden) Sync.fetch(); });
  window.addEventListener('focus', () => Sync.fetch());

  // Start
  Sync.start();
})();

VKShared.bindDeclarativeActions(document);
