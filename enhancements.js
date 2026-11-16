'use strict';
/* MIRRA content and art direction, edition 2027. All new journeys are reflective, not diagnostic. */
(() => {
  const portraits = {
    woman: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85',
    man: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85',
    womanTwo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85',
    manTwo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=900&q=85',
    olderWoman: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85',
    manThree: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=900&q=85',
    womanThree: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85'
  };
  const p=(title,...options)=>({t:title,o:options});
  /* Add more balanced reflection items. The scores remain exploratory and are not normed. */
  [
    ['O','I like finding more than one way to approach a familiar problem.',0],
    ['C','I make time for the things I say matter to me.',0],
    ['E','Meeting new people feels more exciting than draining.',0],
    ['A','I can disagree with someone and still make them feel respected.',0],
    ['S','I can usually put a difficult moment into perspective.',0],
    ['O','I have little interest in learning about unfamiliar cultures or ideas.',1],
    ['C','I postpone ordinary responsibilities until they become urgent.',1],
    ['E','I tend to avoid even casual opportunities for social connection.',1],
    ['A','I rarely consider how my words may land with other people.',1],
    ['S','I replay minor worries long after the moment has passed.',1]
  ].forEach(([dim,title,reverse],i)=>prompts.push({id:21+i,dim,title,reverse:!!reverse}));
  variants.relationships.questions.push(
    p('When you need something from someone, you are most likely to…','Ask clearly and directly.','Think about it before bringing it up.','Start by sharing how it feels.','Ask how they see the situation.'),
    p('When a relationship feels distant, you first look for…','A conversation about what changed.','A moment to understand yourself.','A small act of warmth.','A question neither of you has asked.'),
    p('During a disagreement, what is hardest to let go of?','An issue that still feels unresolved.','The need for time to process.','A feeling of disconnection.','Not fully understanding the other person.'),
    p('When someone sets a boundary, you tend to…','Ask what it means in practice.','Respect the request for space.','Offer reassurance without pushing.','Stay curious about their needs.'),
    p('What makes you feel appreciated?','Words that acknowledge your effort.','Respect for your independence.','Warmth shown in everyday moments.','Someone taking a genuine interest in you.'),
    p('If a loved one is overwhelmed, you usually…','Offer to work through the problem.','Give them room and remain available.','Help them feel held and supported.','Ask what kind of help would matter.'),
    p('The most meaningful kind of honesty is…','Clear, even when it is uncomfortable.','Shared at a pace both people can hold.','Kind and conscious of feelings.','Open to more than one perspective.'),
    p('A healthy relationship needs plenty of…','Trustworthy communication.','Room for two whole individuals.','Gentleness and affection.','Fresh conversations and curiosity.')
  );
  variants.decisions.questions.push(
    p('You are offered a new role. What comes first?','Understanding expectations and tradeoffs.','Imagining how it fits your future.','Talking with people who know you.','Trying a small part of the work.'),
    p('When a plan stops working, your instinct is to…','Revisit the evidence.','Check whether the goal still feels right.','Invite other people into the problem.','Change one thing and observe.'),
    p('A great idea becomes more convincing when…','Its logic holds up to scrutiny.','You can see what it could become.','It resonates with people affected.','A first experiment shows promise.'),
    p('What makes an important choice difficult?','Missing information.','Not feeling personally aligned.','Competing needs and perspectives.','Not knowing what will happen until you try.'),
    p('When advice conflicts with your own view, you…','Check the assumptions behind both.','Listen to your sense of purpose.','Ask more people with different experience.','Find a low-risk way to compare.'),
    p('When learning something unfamiliar, you prefer…','A clear explanation of the principles.','A compelling picture of the possibilities.','A conversation with a knowledgeable person.','A hands-on attempt.'),
    p('You feel most at ease after a decision when…','You understand why it makes sense.','It feels true to you.','You have considered others well.','You are already learning from the outcome.'),
    p('If you could strengthen one skill, it would be…','Seeing important details clearly.','Trusting your personal direction.','Making room for more voices.','Acting sooner on useful ideas.')
  );
  const specs={
    emotions:{
      title:'The Emotional Landscape',eyebrow:'EMOTIONAL AWARENESS',note:'Explore how you notice, name, and respond to your feelings.',statement:'Feelings are information. They are not the whole story.',
      labels:['The Reflective Observer','The Open Expressor','The Quiet Processor','The Practical Regulator'],
      descriptions:['You often look for the meaning behind a feeling before acting on it.','You tend to find clarity by putting your emotions into words.','You often need a little privacy to make sense of what you feel.','You tend to settle difficult feelings by doing something constructive.'],
      image:portraits.womanTwo,tag:'THE INNER WORLD',line:'Notice what moves you.',questions:[
      p('A difficult emotion arrives unexpectedly. You tend to…','Ask what may have triggered it.','Talk about what you feel.','Sit with it privately.','Do something that helps you steady yourself.'),
      p('When you feel proud, you are most likely to…','Reflect on what the moment means.','Tell someone close to you.','Enjoy it quietly.','Use the momentum for your next step.'),
      p('After a stressful conversation, you prefer to…','Consider why it affected you.','Share the experience with someone.','Spend time alone and reset.','Walk, move, or return to a simple routine.'),
      p('What helps you recognize a feeling?','Tracing the thought underneath it.','Saying it out loud.','Noticing it in a quiet moment.','Seeing how it affects what I do.'),
      p('When something beautiful moves you, you…','Wonder why it resonates so deeply.','Want to share it immediately.','Keep the moment to yourself.','Capture it in a small gesture or action.'),
      p('If you feel misunderstood, you usually…','Explain the context behind your reaction.','Talk openly about the hurt.','Pull back until you are ready.','Focus on what could improve the situation.'),
      p('When worry appears, you find relief by…','Understanding what you can and cannot know.','Getting reassurance through conversation.','Finding somewhere quiet to think.','Taking one manageable action.'),
      p('A good day feels even better when you…','Take a moment to appreciate it.','Celebrate with someone.','Have time to enjoy it in peace.','Make something of the energy it gives you.'),
      p('When a feeling lasts longer than expected, you…','Look for patterns in it.','Find words to describe it.','Give yourself time and solitude.','Change something about your environment.'),
      p('What makes a conversation emotionally safe?','Being understood without assumptions.','Being able to speak freely.','Not being pushed to share too soon.','Leaving with a useful next step.'),
      p('When a friend is emotional, you first…','Help them explore what is happening.','Invite them to tell the full story.','Respect their pace and silence.','Offer something tangible that could help.'),
      p('A healthy relationship with feelings means…','Understanding them with curiosity.','Expressing them honestly.','Allowing them space without pressure.','Responding to them with care.')]
    },
    boundaries:{
      title:'The Art of Boundaries',eyebrow:'PERSONAL SPACE',note:'Consider how you balance kindness, independence, and the things that matter to you.',statement:'A good boundary makes room for a better relationship.',
      labels:['The Clear Advocate','The Thoughtful Negotiator','The Gentle Protector','The Independent Spirit'],
      descriptions:['You often feel most comfortable with direct, specific boundaries.','You tend to seek a workable arrangement where needs can coexist.','You often use warmth and tact when protecting your limits.','You value having space to choose how and when you participate.'],
      image:portraits.manTwo,tag:'THE SPACE WE KEEP',line:'Make room for yourself.',questions:[
      p('A colleague asks for a favor when your day is full. You…','Say what you can realistically do.','Explore another way to help.','Decline kindly and acknowledge their need.','Protect the time you had already set aside.'),
      p('A friend repeatedly arrives late. You…','Tell them directly how it affects you.','Suggest a practical agreement.','Share how it makes you feel.','Change how you plan your time together.'),
      p('When someone disagrees with your limits, you…','Restate them calmly.','Try to find common ground.','Stay kind but hold firm.','Step away if needed.'),
      p('A relaxing weekend suddenly fills with plans. You…','Explain what you can commit to.','Choose the plans that work for everyone.','Let people know you need rest.','Keep the quiet time you wanted.'),
      p('When you need privacy, it helps to…','Say exactly what you need.','Agree on expectations together.','Ask gently for understanding.','Create uninterrupted space.'),
      p('What makes saying no easier?','Knowing the reason is sound.','Offering another option.','Remembering that kindness includes honesty.','Knowing I am allowed to choose.'),
      p('In close relationships, you appreciate…','Respect for clearly stated needs.','Flexibility when circumstances change.','A tender response to difficult requests.','Confidence in each other’s independence.'),
      p('A healthy request sounds like…','Here is what I need.','Can we find a way that works?','I care, and I need some space.','I will decide what I can take on.'),
      p('If you overcommit, you tend to…','Reset expectations as soon as possible.','Renegotiate a realistic plan.','Apologize and explain with care.','Remove commitments you do not need.'),
      p('When others are upset by your choice, you…','Stay clear about your reasons.','Listen for a compromise.','Acknowledge their disappointment.','Accept that not everyone will agree.'),
      p('The hardest boundary for you to protect is…','A clearly stated one that gets ignored.','A shared arrangement that stops working.','One that might hurt someone’s feelings.','Time that is meant to be yours.'),
      p('You feel respected when people…','Take your words seriously.','Consider both sides.','Respond with kindness.','Allow you autonomy.')]
    },
    values:{
      title:'What Matters Most',eyebrow:'PERSONAL VALUES',note:'Explore the principles that quietly shape your choices.',statement:'The life you build reflects what you choose to protect.',
      labels:['The Purpose Seeker','The Caring Builder','The Freedom Explorer','The Steady Steward'],
      descriptions:['You often feel guided by meaning and the contribution you want to make.','You place strong value on people, care, and what you build together.','You are drawn toward autonomy, possibility, and personal discovery.','You value responsibility, trust, and lasting commitments.'],
      image:portraits.olderWoman,tag:'THE INNER COMPASS',line:'What do you stand for?',questions:[
      p('A fulfilling year would include more…','Work that feels meaningful.','Time with people I love.','Freedom to try something different.','Progress on commitments I made.'),
      p('You admire someone most when they…','Stand for a belief with integrity.','Make others feel valued.','Follow their own path.','Keep their word through difficulty.'),
      p('When you imagine your ideal home, you picture…','A place that reflects what matters to me.','A welcoming space for connection.','Room to live on my terms.','Comfort, stability, and care.'),
      p('A difficult choice feels worthwhile when it…','Serves a larger purpose.','Strengthens an important relationship.','Opens up new possibilities.','Protects something lasting.'),
      p('Which compliment means the most?','You made a difference.','You made me feel seen.','You were brave enough to try.','I could always count on you.'),
      p('When faced with change, you want to preserve…','My sense of purpose.','The relationships I treasure.','My freedom to choose.','The foundations I have built.'),
      p('Time feels well spent when you…','Move closer to a meaningful goal.','Give someone your full attention.','Discover something new.','Take care of important responsibilities.'),
      p('You hope people remember your…','Conviction and contribution.','Care and generosity.','Curiosity and courage.','Reliability and integrity.'),
      p('In a new community, you look for…','A shared mission.','A sense of belonging.','Room for different perspectives.','Trustworthy people and traditions.'),
      p('What gives a hard day meaning?','Knowing why the work matters.','Being there for someone.','Learning something about myself.','Keeping a promise to myself.'),
      p('A gift you would love to give is…','An opportunity that changes a life.','A moment of genuine connection.','An experience they have never had.','Something useful that lasts.'),
      p('A life well lived is one that…','Reflects deep purpose.','Gives and receives love.','Keeps making space to grow.','Honors its commitments.')]
    },
    social:{
      title:'Your Social Rhythm',eyebrow:'SOCIAL ENERGY',note:'Look more closely at the company, pace, and spaces that bring out your best.',statement:'Connection is not a competition. Find your own rhythm.',
      labels:['The Intimate Conversationalist','The Energetic Connector','The Intentional Observer','The Flexible Companion'],
      descriptions:['You often prefer closeness and depth over a crowded room.','Shared energy and fresh company can be an important source of enjoyment.','You tend to take your time before moving into a social space.','You adapt your social pace depending on the people and the moment.'],
      image:portraits.man,tag:'BEING TOGETHER',line:'How do you connect?',questions:[
      p('At a gathering, your favorite moment is…','A genuine one-on-one conversation.','Meeting people I have not met.','Taking in the atmosphere quietly.','Moving between conversation and rest.'),
      p('After a busy social weekend, you want…','Time with one close friend.','Another activity with the right people.','A quiet day without plans.','A mix of company and solitude.'),
      p('You feel most yourself around…','People who know me deeply.','People who share my energy.','People who do not demand a performance.','People who accept my changing mood.'),
      p('When you join a new group, you…','Look for someone you can really talk to.','Introduce yourself to several people.','Listen and get a sense of the room.','Join whatever feels natural.'),
      p('A great conversation is…','Deep and personal.','Lively and full of ideas.','Thoughtful with room for silence.','Easy, spontaneous, and varied.'),
      p('If someone cancels your plans, you…','Call a close friend instead.','Find another person to meet.','Enjoy the unexpected free time.','See what you feel like doing.'),
      p('What makes a group feel welcoming?','A chance for real connection.','Warm introductions and participation.','Space to enter at my own pace.','Freedom to be involved or step back.'),
      p('Your ideal celebration would be…','A meaningful dinner with close people.','A room full of conversation.','Something small and peaceful.','An event with a few different moments.'),
      p('When you have a new idea, you…','Share it with someone close.','Talk it through with several people.','Think about it privately first.','Share it when the moment feels right.'),
      p('You connect best with someone who…','Enjoys deeper questions.','Brings energy and curiosity.','Respects silence.','Is comfortable with different social moods.'),
      p('At work, collaboration feels best when…','We have a trusted small team.','Ideas move through active conversation.','There is time to think independently.','People can switch between solo and group work.'),
      p('What does belonging feel like?','Being known deeply.','Being warmly included.','Being accepted without pressure.','Being free to participate as I am.')]
    },
    resilience:{
      title:'Finding Your Footing',eyebrow:'EVERYDAY RESILIENCE',note:'Discover the habits and perspectives you reach for when days become difficult.',statement:'Small ways of recovering can matter a great deal.',
      labels:['The Perspective Finder','The Connection Seeker','The Gentle Restorer','The Active Rebuilder'],
      descriptions:['You often regain balance by making sense of what happened.','Support and conversation can help you feel grounded.','You tend to recover through rest, patience, and self-compassion.','Practical actions often help you find your next foothold.'],
      image:portraits.womanThree,tag:'RETURNING TO CENTRE',line:'Begin again, gently.',questions:[
      p('When a difficult day ends, you usually want to…','Understand what made it hard.','Talk to someone who cares.','Rest and let the day settle.','Do one thing that feels manageable.'),
      p('A setback feels easier when you…','Put it in context.','Feel supported.','Give yourself permission to pause.','Make a fresh plan.'),
      p('When you feel uncertain, you…','Think through what you know.','Reach for trusted company.','Create a little calm.','Focus on the next task.'),
      p('What helps you recover after disappointment?','Finding a different perspective.','A meaningful conversation.','Time to be kind to myself.','Trying something new.'),
      p('If a goal becomes overwhelming, you…','Revisit what truly matters.','Ask someone to help think it through.','Reduce the pressure temporarily.','Break it into smaller steps.'),
      p('A comforting reminder is…','This moment is not the whole story.','I do not have to do everything alone.','Rest is part of moving forward.','One small step is enough for now.'),
      p('When a plan fails, your first instinct is…','Look for the lesson.','Find someone to share it with.','Let myself feel disappointed.','Build another version.'),
      p('You feel stronger after…','Making sense of a challenge.','Feeling understood.','Giving yourself proper recovery time.','Doing something useful despite uncertainty.'),
      p('When you have too much to do, you…','Clarify what really matters.','Ask for help where possible.','Make breathing room.','Choose the next concrete action.'),
      p('An encouraging friend would…','Help me see things clearly.','Stay present and listen.','Remind me to slow down.','Help me make a plan.'),
      p('You know you are recovering when…','Your thoughts become clearer.','You feel connected again.','Your body begins to settle.','Everyday tasks feel possible.'),
      p('Your preferred way to start again is…','With renewed perspective.','With someone alongside me.','With patience and gentleness.','With one small action.')]
    },
    habits:{
      title:'The Shape of Your Days',eyebrow:'HABITS AND MOTIVATION',note:'Explore what helps good intentions become part of everyday life.',statement:'A life is made in ordinary moments, not only big ones.',
      labels:['The Thoughtful Planner','The Inspired Starter','The Steady Ritualist','The Curious Improviser'],
      descriptions:['You often build momentum by making a clear plan.','Meaning and excitement can help you get started.','You tend to thrive when small actions become familiar rituals.','You make progress through flexibility and experimentation.'],
      image:portraits.woman,tag:'THE EVERYDAY SELF',line:'Find a rhythm that fits.',questions:[
      p('When starting a new habit, you prefer to…','Create a realistic plan.','Connect it to something exciting.','Attach it to a routine I already have.','Try a few approaches and learn.'),
      p('A productive morning begins with…','Knowing what matters most.','Having something to look forward to.','A familiar grounding ritual.','Freedom to follow my energy.'),
      p('When motivation fades, you…','Review your original goal.','Find new inspiration.','Return to a simple routine.','Change the way you approach it.'),
      p('What makes a commitment easier to keep?','A clear next step.','A meaningful reason.','A reliable time and place.','Room to adjust as I go.'),
      p('You feel satisfied at the end of a day when…','Important priorities are done.','I followed something I care about.','My routines helped me feel settled.','I discovered a better way to do something.'),
      p('If a week goes off track, you…','Replan the essentials.','Reconnect with what excites me.','Pick up my usual routine again.','Start with whatever is possible.'),
      p('A helpful reminder is…','Here is what comes next.','Remember why you began.','Keep showing up in small ways.','There are many ways forward.'),
      p('When learning a skill, you like…','A course with clear milestones.','A project that feels meaningful.','Regular practice sessions.','Experimenting with different techniques.'),
      p('The hardest part of consistency is…','Protecting time for a plan.','Staying interested after the beginning.','Recovering when a routine breaks.','Working within rigid rules.'),
      p('What helps you focus?','A prioritized list.','A strong sense of purpose.','A familiar environment.','Changing my setting when needed.'),
      p('A good personal goal feels…','Clear and achievable.','Personally exciting.','Easy to revisit daily.','Flexible enough to evolve.'),
      p('Progress means…','Following through on intentions.','Moving toward something meaningful.','Returning, even after a break.','Learning how to work better.')]
    }
  };
  const order=['emotions','boundaries','values','social','resilience','habits'];
  order.forEach((k)=>{variants[k]=specs[k];if(!Array.isArray(data.answers[k]))data.answers[k]=[];});
  const oldHome=homeHTML;
  const fallbackPortrait=document.querySelector('.hero-art img:nth-child(2)')?.src||'';
  const illustration=(src,alt)=>`<img loading="lazy" decoding="async" src="${src}" alt="${alt}" onerror="this.onerror=null;this.src='${document.querySelector('.hero-art img:nth-child(2)')?.src||''}'">`;
  homeHTML=function(){
    let html=oldHome();
    const exhibition=`<section class="editorial-exhibit container" aria-labelledby="people-heading"><div class="exhibit-heading"><div><span class="eyebrow">A STUDY IN BEING HUMAN</span><h2 id="people-heading">No two lives<br>feel quite <em>alike.</em></h2></div><div><p>We are shaped by memory, curiosity, the people we love, and the choices we make. MIRRA offers room to notice those patterns without reducing anyone to a single type.</p><a href="#explore-library">Meet the experiences ↗</a></div></div><div class="portrait-gallery"><figure class="portrait-card">${illustration(portraits.woman,'Editorial portrait of a young woman')}<figcaption>Different perspectives</figcaption></figure><figure class="portrait-card">${illustration(portraits.man,'Editorial portrait of an adult man')}<figcaption>Different rhythms</figcaption></figure><figure class="portrait-card">${illustration(portraits.olderWoman,'Editorial portrait of a mature woman')}<figcaption>Different chapters</figcaption></figure><figure class="portrait-card">${illustration(portraits.womanThree,'Editorial portrait of a woman')}<figcaption>Shared humanity</figcaption></figure></div></section>`;
    const library=`<section class="experience-library container" id="explore-library"><div class="library-kicker"><h2>Follow what interests <em>you.</em></h2><p>There is more to discover than a single personality score. Choose a closer look at the patterns you carry into everyday life.</p></div><div class="library-grid">${order.map((k,i)=>{const v=variants[k],length=v.questions.length,saved=data.answers[k].filter(Boolean).length;return `<article class="library-card" data-action="start-${k}" role="button" tabindex="0" aria-label="Explore ${v.title}"><div class="library-image">${illustration(v.image,`Editorial portrait for ${v.title}`)}<span class="library-index">${String(i+4).padStart(2,'0')} / MIRRA STUDIES</span></div><div class="library-copy"><span class="small-label">${v.eyebrow}</span><h3>${v.title}</h3><p>${v.note}</p></div><div class="library-meta"><b>${saved?`Continue from ${saved} of ${length}`:`${length} thoughtful questions`}</b><span aria-hidden="true">↗</span></div></article>`}).join('')}</div><p class="exhibit-footnote">Portrait photography is illustrative. No conclusions are drawn about the people pictured.</p></section>`;
    html=html.replace('<section class="overview container"',exhibition+'<section class="overview container"');
    html=html.replace('<section class="method-section container"',library+'<section class="method-section container"');
    html=html.replace('20 reflections · 4–6 min','30 reflections · around 7 min').replaceAll('8 scenarios · 3 min','16 scenarios · around 5 min');
    return html;
  };
  const oldAssessment=assessmentHTML;
  assessmentHTML=function(){
    let html=oldAssessment();
    if(mode==='personality')return html;
    if(specs[mode])return html.replace(/(<aside class="q-visual"><img src=")[^"]+/, '$1'+specs[mode].image);
    return html;
  };
  const oldJournal=journalHTML;
  journalHTML=function(){return oldJournal().replace('<div class="compose-foot">',`<div class="journal-prompts" aria-label="Journal prompts">${['What gave me energy today?','Where did I feel most like myself?','What would I like to do differently?'].map(t=>`<button type="button" data-prompt="${t}">${t}</button>`).join('')}</div><div class="compose-foot">`)};
  const oldRender=render;
  render=function(){oldRender();if(screen==='home'){const badge=document.querySelector('.hero-foot');if(badge&&data.results.personality)badge.innerHTML='<span>Your personality portrait is ready</span><span>Explore another perspective</span>';}const footer=document.querySelector('.site-footer .footer-left');if(footer&&!footer.querySelector('.footer-note'))footer.insertAdjacentHTML('beforeend','<p class="footer-note">Made for reflection and self-discovery. Not a clinical assessment or a substitute for professional care.</p>');};
  const dock=document.createElement('nav');dock.className='mobile-dock';dock.setAttribute('aria-label','Mobile navigation');dock.innerHTML='<button data-nav="discover"><strong>⌂</strong>Discover</button><button data-nav="method"><strong>○</strong>Method</button><button data-nav="journal"><strong>✎</strong>Journal</button><button data-nav="profile"><strong>◌</strong>Profile</button>';
  document.body.appendChild(dock);
  document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&el.dataset.action.startsWith('start-')){const key=el.dataset.action.slice(6);if(specs[key]){e.preventDefault();e.stopImmediatePropagation();startAssessment(key);return}}const prompt=e.target.closest('[data-prompt]');if(prompt){e.preventDefault();e.stopImmediatePropagation();const target=document.querySelector('#journal-text');if(target){target.value=prompt.dataset.prompt+'\n\n';target.focus();target.setSelectionRange(target.value.length,target.value.length)}return}},true);
  document.title='MIRRA | Discover more of who you are';
  const description=document.querySelector('meta[name=description]');if(description)description.content='A more thoughtful way to explore personality, relationships, emotions, values, and the everyday patterns that make you human.';
  render();
})();