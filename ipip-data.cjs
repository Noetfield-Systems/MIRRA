'use strict';
// Public domain: International Personality Item Pool, Goldberg (1992), IPIP 50-item Big Five markers.
// https://ipip.ori.org/new_ipip-50-item-scale.htm
// E=Extraversion, A=Agreeableness, C=Conscientiousness, S=Emotional Stability, I=Intellect/Imagination.
// Key: [text, dimension, reverse]. Reversed items use 6-response.
const data = [
['Am the life of the party.','E',0],
['Feel little concern for others.','A',1],
['Am always prepared.','C',0],
['Get stressed out easily.','S',1],
['Have a rich vocabulary.','I',0],
["Don't talk a lot.",'E',1],
['Am interested in people.','A',0],
['Leave my belongings around.','C',1],
['Am relaxed most of the time.','S',0],
['Have difficulty understanding abstract ideas.','I',1],
['Feel comfortable around people.','E',0],
['Insult people.','A',1],
['Pay attention to details.','C',0],
['Worry about things.','S',1],
['Have a vivid imagination.','I',0],
['Keep in the background.','E',1],
["Sympathize with others' feelings.",'A',0],
['Make a mess of things.','C',1],
['Seldom feel blue.','S',0],
['Am not interested in abstract ideas.','I',1],
['Start conversations.','E',0],
["Am not interested in other people's problems.",'A',1],
['Get chores done right away.','C',0],
['Am easily disturbed.','S',1],
['Have excellent ideas.','I',0],
['Have little to say.','E',1],
['Have a soft heart.','A',0],
['Often forget to put things back in their proper place.','C',1],
['Get upset easily.','S',1],
['Do not have a good imagination.','I',1],
['Talk to a lot of different people at parties.','E',0],
['Am not really interested in others.','A',1],
['Like order.','C',0],
['Change my mood a lot.','S',1],
['Am quick to understand things.','I',0],
["Don't like to draw attention to myself.",'E',1],
['Take time out for others.','A',0],
['Shirk my duties.','C',1],
['Have frequent mood swings.','S',1],
['Use difficult words.','I',0],
["Don't mind being the center of attention.",'E',0],
["Feel others' emotions.",'A',0],
['Follow a schedule.','C',0],
['Get irritated easily.','S',1],
['Spend time reflecting on things.','I',0],
['Am quiet around strangers.','E',1],
['Make people feel at ease.','A',0],
['Am exacting in my work.','C',0],
['Often feel blue.','S',1],
['Am full of ideas.','I',0]
];
const ITEMS = data.map(([text,dimension,reverse],index)=>({id:index+1,text,dimension,reverse:Boolean(reverse)}));
const NAMES={E:'Extraversion',A:'Agreeableness',C:'Conscientiousness',S:'Emotional Stability',I:'Intellect & Imagination'};
function scoreIPIP(answers){
 if(!Array.isArray(answers)||answers.length!==50||answers.some(a=>!Number.isInteger(a)||a<1||a>5))throw Error('Expected 50 answers scored 1 to 5');
 const groups=Object.fromEntries(Object.keys(NAMES).map(k=>[k,[]]));
 ITEMS.forEach((item,index)=>groups[item.dimension].push(item.reverse?6-answers[index]:answers[index]));
 const dimensions=Object.entries(groups).map(([id,scores])=>({id,name:NAMES[id],rawMean:Number((scores.reduce((s,n)=>s+n,0)/10).toFixed(2)),index:Math.round((scores.reduce((s,n)=>s+n,0)/10-1)*25)}));
 return {instrument:'IPIP Big Five 50-item markers',method:'Mean of ten items per domain, reverse-keyed as published; transformed 0–100 is a scale index, not a population percentile.',dimensions,exploratory:false,clinical:false};
}
module.exports={ITEMS,NAMES,scoreIPIP};
