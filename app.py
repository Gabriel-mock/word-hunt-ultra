
from flask import Flask, render_template, jsonify, request
import random, sqlite3, datetime

app = Flask(__name__)

LETTER_FREQ=list("EEEEEEEEEEEEAAAAAAAIIIIIIIOOOOOONNNNNRRRRRTTTTTLLLLSSSSUUUDDDGGBCMPFHVWYKJXQZ")

def init_db():
    conn=sqlite3.connect("scores.db")
    c=conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS scores(name TEXT, score INT)")
    conn.commit()
    conn.close()

init_db()

def load_words():
    with open("words.txt") as f:
        return [w.strip().upper() for w in f if len(w.strip())>=3]

DICTIONARY=set(load_words())

def generate_board(size):
    return [[random.choice(LETTER_FREQ) for _ in range(size)] for _ in range(size)]

def generate_daily_board(size):
    seed=datetime.date.today().isoformat()
    random.seed(seed)
    return generate_board(size)

def neighbors(r,c,size):
    for rr in range(r-1,r+2):
        for cc in range(c-1,c+2):
            if 0<=rr<size and 0<=cc<size and (rr,cc)!=(r,c):
                yield rr,cc

def search(board,word,r,c,visited):
    if (r,c) in visited: return False
    if board[r][c]!=word[0]: return False
    visited.add((r,c))
    if len(word)==1: return True
    for nr,nc in neighbors(r,c,len(board)):
        if search(board,word[1:],nr,nc,visited):
            return True
    visited.remove((r,c))
    return False

def word_exists(board,word):
    for r in range(len(board)):
        for c in range(len(board)):
            if search(board,word,r,c,set()):
                return True
    return False

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/board")
def board():
    size=int(request.args.get("size",4))
    return jsonify(generate_board(size))

@app.route("/daily")
def daily():
    size=int(request.args.get("size",4))
    return jsonify(generate_daily_board(size))

@app.route("/check",methods=["POST"])
def check():
    data=request.json
    word=data["word"].upper()
    board=data["board"]

    if word not in DICTIONARY:
        return jsonify({"valid":False})

    if not word_exists(board,word):
        return jsonify({"valid":False})

    return jsonify({"valid":True})

@app.route("/solve",methods=["POST"])
def solve():
    board=request.json["board"]
    results=[]
    for w in DICTIONARY:
        if word_exists(board,w):
            results.append(w)
    return jsonify(results[:300])

@app.route("/submit",methods=["POST"])
def submit():
    data=request.json
    conn=sqlite3.connect("scores.db")
    c=conn.cursor()
    c.execute("INSERT INTO scores VALUES (?,?)",(data["name"],data["score"]))
    conn.commit()
    conn.close()
    return jsonify({"ok":True})

@app.route("/leaderboard")
def leaderboard():
    conn=sqlite3.connect("scores.db")
    c=conn.cursor()
    rows=c.execute("SELECT name,score FROM scores ORDER BY score DESC LIMIT 10").fetchall()
    conn.close()
    return jsonify(rows)

if __name__=="__main__":
    app.run(debug=True)
