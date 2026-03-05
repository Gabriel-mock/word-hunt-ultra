let board=[]
let size=4

function start(){

size=parseInt(document.getElementById("grid").value)

fetch("/board?size="+size)
.then(r=>r.json())
.then(data=>{
board=data
draw()
})

}

function draw(){

let b=document.getElementById("board")
b.innerHTML=""
b.style.gridTemplateColumns=`repeat(${size},65px)`

for(let r=0;r<size;r++){
for(let c=0;c<size;c++){

let t=document.createElement("div")
t.className="tile"
t.innerText=board[r][c]

b.appendChild(t)

}
}

}

start()
