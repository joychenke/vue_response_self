class observer{
  constructor(data){
    this.data = data
    // 初始化observer时，就执行walk，给data的属性加set和get方法
    this.walk(data)
  }
  // tip : 给data每个对象执行一次defineReactive方法
  walk(data){
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive(data, key, val){
    observers(val)
    let dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get(){
        // 如果是watcher触发的get，则将watcher添加到订阅器        
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set(newVal){
        if(val === newVal){
          return;
        }
        val = newVal
        dep.notify()
      }
    })
  }
}

function observers(data){
  if(!data || typeof data !== "object"){
    return 
  }
  return new observer(data)
}

class Dep{
  constructor(){
    this.subs = []
    this.target = null
  }
  addSub(sub){
    this.subs.push(sub)
  }
  notify(){
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}