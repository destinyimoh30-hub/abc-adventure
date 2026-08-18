const express=require("express"), path=require("path"), Database=require("better-sqlite3"), cors=require("cors");
const app=express(), db=new Database(path.join(__dirname,"game.db"));
app.use(cors()); app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));

db.exec(`CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS questions(id INTEGER PRIMARY KEY AUTOINCREMENT,letter TEXT NOT NULL,emoji TEXT NOT NULL,word TEXT NOT NULL,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS scores(id INTEGER PRIMARY KEY AUTOINCREMENT,player_id INTEGER,score INTEGER,rounds INTEGER,created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

const defaults={rounds:"10",points:"10",timer:"0"};
for(const [k,v] of Object.entries(defaults)) db.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)").run(k,v);
if(db.prepare("SELECT COUNT(*) n FROM questions").get().n===0){
 const data=[["A","🍎","APPLE"],["B","🦋","BUTTERFLY"],["C","🐱","CAT"],["D","🐶","DOG"],["E","🐘","ELEPHANT"],["F","🐟","FISH"],["G","🍇","GRAPES"],["H","🏠","HOUSE"],["I","🍦","ICE CREAM"],["J","🧃","JUICE"],["K","🦘","KANGAROO"],["L","🦁","LION"],["M","🌙","MOON"],["N","👃","NOSE"],["O","🍊","ORANGE"],["P","🐼","PANDA"],["Q","👑","QUEEN"],["R","🌈","RAINBOW"],["S","☀️","SUN"],["T","🐯","TIGER"],["U","☂️","UMBRELLA"],["V","🌋","VOLCANO"],["W","🐋","WHALE"],["X","🎸","XYLOPHONE"],["Y","🧶","YARN"],["Z","🦓","ZEBRA"]];
 const ins=db.prepare("INSERT INTO questions(letter,emoji,word) VALUES(?,?,?)"); const tx=db.transaction(a=>a.forEach(x=>ins.run(...x))); tx(data);
}
app.get("/api/questions",(req,res)=>res.json(db.prepare("SELECT * FROM questions WHERE active=1 ORDER BY letter").all()));
app.post("/api/questions",(req,res)=>{let {letter,emoji,word}=req.body;if(!letter||!emoji||!word)return res.status(400).json({error:"All fields required"});let r=db.prepare("INSERT INTO questions(letter,emoji,word) VALUES(?,?,?)").run(letter.toUpperCase(),emoji,word.toUpperCase());res.json({id:r.lastInsertRowid})});
app.put("/api/questions/:id",(req,res)=>{let {letter,emoji,word,active}=req.body;db.prepare("UPDATE questions SET letter=?,emoji=?,word=?,active=? WHERE id=?").run(letter.toUpperCase(),emoji,word.toUpperCase(),active?1:0,req.params.id);res.json({ok:true})});
app.delete("/api/questions/:id",(req,res)=>{db.prepare("DELETE FROM questions WHERE id=?").run(req.params.id);res.json({ok:true})});
app.get("/api/settings",(req,res)=>res.json(Object.fromEntries(db.prepare("SELECT key,value FROM settings").all().map(x=>[x.key,x.value]))));
app.put("/api/settings",(req,res)=>{for(const [k,v] of Object.entries(req.body)){db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(k,String(v))}res.json({ok:true})});
app.post("/api/players",(req,res)=>{let name=String(req.body.name||"").trim();if(!name)return res.status(400).json({error:"Name required"});let r=db.prepare("INSERT INTO players(name) VALUES(?)").run(name);res.json({id:r.lastInsertRowid,name})});
app.post("/api/scores",(req,res)=>{let {playerId,score,rounds}=req.body;if(!playerId)return res.status(400).json({error:"playerId required"});db.prepare("INSERT INTO scores(player_id,score,rounds) VALUES(?,?,?)").run(playerId,score||0,rounds||0);res.json({ok:true})});
app.get("/api/leaderboard",(req,res)=>res.json(db.prepare(`SELECT p.name,MAX(s.score) score,COUNT(s.id) games FROM players p JOIN scores s ON s.player_id=p.id GROUP BY p.id ORDER BY score DESC LIMIT 20`).all()));
app.get("/api/stats",(req,res)=>res.json({players:db.prepare("SELECT COUNT(*) n FROM players").get().n,games:db.prepare("SELECT COUNT(*) n FROM scores").get().n,questions:db.prepare("SELECT COUNT(*) n FROM questions WHERE active=1").get().n}));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public/admin.html")));
app.listen(process.env.PORT||3000,()=>console.log("ABC Adventure running on http://localhost:"+ (process.env.PORT||3000)));