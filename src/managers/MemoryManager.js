class MemoryManager {
constructor(){
this.users=new Map();}

get(uid){
if(!this.users.has(uid)){
this.users.set(uid,{
profile:{},
skills:[],
projects:[],
languages:[],
history:[]
});
}
return this.users.get(uid);
}

addHistory(uid,data){
const memory = this.get(uid);
memory.history.push({
...data,
date:new Date()
});

if(memory.history.length>20){
memory.history.shift();
}
}

update(uid,data){
const memory=this.get(uid);
Object.assign(
memory,data);
}
}

export default new MemoryManager();