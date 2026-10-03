const words=[
"The best way to improve your typing is to practice regularly and focus on accuracy before speed. Keep your hands relaxed and let your fingers move naturally across the keyboard.",
"A clear goal makes practice easier. Start slowly, type each word carefully, and build speed as your accuracy becomes consistent. Small improvements add up over time.",
"Good typing skills can make everyday computer work faster and less tiring. Practice common words, punctuation, and numbers so that your keyboard feels familiar."
];

const nums="482 719 305 664 218 907 531 846 290 175 638 402 951 327 760 184 593 816 245 670 318 904 562 137 829 450 716 283 605 941";

let duration=30,remaining=30,mode='words',text='',started=false,done=false,timer;

const $=s=>document.querySelector(s);
const input=$('#input');

function buildText(){
    if(mode==='numbers'){
        return Array(20).fill(nums).join(' ');
    }

    return Array(10).fill(null)
        .map(()=>words[Math.floor(Math.random()*words.length)])
        .join(' ');
function render(){
    let v=input.value;
    const display=$('#display');

    display.innerHTML=[...text].map((c,i)=>
        `<span class="${i<v.length?(v[i]===c?'correct':'wrong'):(i===v.length?'current':'')}">${c}</span>`
    ).join('');

    const current=display.querySelector('.current');

    if(current){
        current.scrollIntoView({
            block:'center',
            behavior:'smooth'
        });
    }
}

function calc(){
    let v=input.value,c=0,e=0;

    for(let i=0;i<v.length;i++){
        v[i]===text[i]?c++:e++;
    }

    let mins=Math.max((duration-remaining)/60,1/60);
    let w=Math.round(c/5/mins);
    let a=v.length?Math.round(c/v.length*100):100;

    $('#wpm').textContent=w;
    $('#accuracy').textContent=a+'%';
    $('#errors').textContent=e;

    return{w,a,e,n:v.length};
}

function reset(){
    clearInterval(timer);

    started=false;
    done=false;
    remaining=duration;

    $('#time').textContent=remaining;
    $('#wpm').textContent=0;
    $('#accuracy').textContent='100%';
    $('#errors').textContent=0;

    input.value='';
    input.disabled=false;

    $('#results').classList.add('hidden');

    text=buildText();

    render();
    input.focus();
}

function finish(){
    if(done)return;

    done=true;
    clearInterval(timer);
    input.disabled=true;

    let s=calc();

    $('#fwpm').textContent=s.w;
    $('#facc').textContent=s.a+'%';
    $('#ferr').textContent=s.e;
    $('#fchars').textContent=s.n;
    $('#fdur').textContent=duration>=60?duration/60+' min':duration+'s';

    $('#results').classList.remove('hidden');

    $('#results').scrollIntoView({
        behavior:'smooth',
        block:'center'
    });
}

input.addEventListener('input',()=>{
    if(done)return;

    if(!started){
        started=true;

        timer=setInterval(()=>{
            remaining--;

            $('#time').textContent=remaining;
            calc();

            if(remaining<=0){
                finish();
            }
        },1000);
    }

    render();
    calc();
});

input.addEventListener('paste',e=>e.preventDefault());

document.querySelectorAll('.dur button').forEach(b=>
    b.onclick=()=>{
        document.querySelector('.dur .active').classList.remove('active');
        b.classList.add('active');

        duration=+b.dataset.time;
        reset();
    }
);

document.querySelectorAll('.tabs button').forEach(b=>
    b.onclick=()=>{
        document.querySelector('.tabs .active').classList.remove('active');
        b.classList.add('active');

        mode=b.dataset.mode;
        reset();
    }
);

$('#restart').onclick=reset;
$('#again').onclick=reset;

$('#theme').onclick=()=>{
    document.body.classList.toggle('dark');
    $('#theme').textContent=
        document.body.classList.contains('dark')?'☀':'☾';
};

reset();
