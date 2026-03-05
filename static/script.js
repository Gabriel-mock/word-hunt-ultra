let board=[]
let size=4

let selecting=false
let path=[]
let currentWord=""

let score=0
let combo=1

let found=new Set()

function start(){

size=parseInt(document.getElementById("grid").value)

fetch("/board?size="+size)
.then(r=>r.json())
.then(data=>{
board=data
draw()
})

score=0
combo=1
found.clear()

document.getElementById("score").innerText="Score: 0"
document.getElementById("words").innerHTML=""

}

function draw(){

let b=document.getElementById("board")

b.innerHTML=""

b.style.gridTemplateColumns=`repeat(${size},65px)`

for(let r=0;r<size;r++){
for(let c=0;c<size;c++){

let tile=document.createElement("div")

tile.className="tile"

tile.innerText=board[r][c]

tile.dataset.r=r
tile.dataset.c=c

tile.onmousedown=startSelect
tile.onmouseenter=dragSelect
tile.onmouseup=endSelect

tile.ontouchstart=startSelect
tile.ontouchmove=touchDrag
tile.ontouchend=endSelect

b.appendChild(tile)

}
}

}

function startSelect(e){

selecting=true
path=[]
currentWord=""

selectTile(e.target)

}

function dragSelect(e){

if(!selecting) return

selectTile(e.target)

}

function touchDrag(e){

let touch=document.elementFromPoint(
e.touches[0].clientX,
e.touches[0].clientY
)

if(touch && touch.classList.contains("tile")){
selectTile(touch)
}

}

function selectTile(tile){

let r=parseInt(tile.dataset.r)
let c=parseInt(tile.dataset.c)

for(let p of path){
if(p[0]==r && p[1]==c) return
}

if(path.length>0){

let pr=path[path.length-1][0]
let pc=path[path.length-1][1]

if(Math.abs(pr-r)>1 || Math.abs(pc-c)>1) return

}

path.push([r,c])

tile.classList.add("active")

currentWord+=board[r][c]

}

function endSelect(){

selecting=false

document.querySelectorAll(".tile")
.forEach(t=>t.classList.remove("active"))

submitWord(currentWord)

}

function submitWord(word){

if(word.length<3) return

if(found.has(word)) return

fetch("/check",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
board:board,
word:word
})

})

.then(r=>r.json())
.then(res=>{

if(res.valid){

found.add(word)

let points=calculatePoints(word.length)

score+=points*combo

combo++

let div=document.createElement("div")

div.innerText=word+" +"+points

document.getElementById("words")
.appendChild(div)

document.getElementById("score")
.innerText="Score: "+score

animateScore()

}else{

combo=1

}

})

}

function calculatePoints(length){

if(length==3) return 300
if(length==4) return 700
if(length==5) return 1600
if(length==6) return 3000

return 5000

}

function animateScore(){

let s=document.getElementById("score")

s.style.transform="scale(1.2)"

setTimeout(()=>{
s.style.transform="scale(1)"
},150)

}

start()
