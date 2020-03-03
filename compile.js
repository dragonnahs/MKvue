class Compile{
    constructor(el,vm){
        this.$el = document.querySelector(el)
        this.$vm = vm
        if(this.$el){
            // 将元素转化为片段
            this.$fragment = this.node2Fragment(this.$el)
            // 编译元素片段
            this.compile(this.$fragment)
            // 将编译后端片段加入到el中去
            this.$el.append(this.$fragment)
        }
    }
    node2Fragment(node){
        // 该函数会创建一个元素片段，并将el中的元素清除并添加到该片段中，当编译完成之后在将片段加入到el中
        // 创建一个片段
        let frag = document.createDocumentFragment()
        let child;
        while(child = node.firstChild){
            frag.appendChild(child)
        }
        return frag
    }
    compile(el){
        const childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            if(this.isElement(node)){
                const nodeAttrs = node.attributes
                Array.from(nodeAttrs).forEach(attr => {
                    const attrName = attr.name
                    // 属性值
                    const exp = attr.value
                    if(this.isDirective(attrName)){
                        const dir = attrName.substring(2)
                        this[dir] && this[dir](node, exp)
                    }else if(this.isEvent(attrName)){
                        const dir = attrName.substring(1)
                        this.eventHandle(node,this.$vm,exp,dir)
                    }
                })
            }else if(this.isInterpolation(node)){
                this.compileText(node)
            }

            if(node.childNodes && node.childNodes.length > 0){
                this.compile(node)
            }
        })
    }
    html(node,exp){
        // k-html指令
        this.update(node, this.$vm,exp,'html')
    }
    htmlUpdater(node,value){
        // html指令更新器(update函数是总管理函数)
        node.innerHTML = value
    }
    model(node,exp){
        // k-model指令
        this.update(node,this.$vm,exp,'model')
        node.addEventListener('input', (e) => {
            this.$vm[exp] = e.target.value
        })
    }
    modelUpdater(node,value){
        // model指令更新器
        node.value = value
    }
    text(node,exp){
        // k-text指令
        this.update(node,this.$vm,exp,'text')
    }
    textUpdater(node,value){
        node.textContent = value
    }
    compileText(node){
        this.update(node,this.$vm, RegExp.$1,'text')
    }
    update(node,vm,exp,dir){
        // 更新函数
        const updateFun = this[dir + 'Updater']
        // 初始化
        updateFun && updateFun(node, vm[exp])

        // 建立监视对象，并在监视对象中传入回调函数，更新数据的时候调用updateFun函数更新视图
        new Watcher(vm, exp, function(value){
            updateFun && updateFun(node,value)
        })
    }
    
    eventHandle(node,vm,exp,dir){
        // 事件处理函数
        let fn = vm.$options.methods && vm.$options.methods[exp] 
        if(dir && fn){
            node.addEventListener(dir,fn.bind(vm))
        }
    }
    isDirective(attr){
        // 判断属性是不是指令，以k-开头
        return attr.indexOf('k-') === 0
    }
    isEvent(attr){
        // 判断是不是事件以@开头
        return attr.indexOf('@') === 0
    }
    isElement(node){
        // 判断是不是元素
        return node.nodeType === 1
    }
    isInterpolation(node){
        // 插值文本{{name}}
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
}