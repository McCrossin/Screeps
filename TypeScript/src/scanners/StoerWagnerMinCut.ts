// Adapted from https://github.com/thomasjungblut/tjungblut-graph/
export class vertice {
    private id:string
    private value:string

    constructor(id:string,value:string){
        this.id = id
        this.value = value
    }
    public getId(){
        return this.id
    }
    public getValue(){
        return this.value
    }
    public equals(obj:vertice){
        if(this == obj){
            return true
        }
        if(obj == null){
            return false
        }
        let other:vertice = obj
        if (this.id ==null && other.id != null){
            return false
        }else if(this.id != obj.id){
            return false
        }
        return true
    }
}

export class edge {
    private dst:string
    private weight:number

    constructor(dst:string,weight:number){
        this.dst = dst
        this.weight = weight
    }

    public getDst(){
        return this.dst
    }

    public getWeight(){
        return this.weight
    }

    public equals(obj:edge){
        if(this == obj){
            return true
        }
        if(obj == null){
            return false
        }
        if (this.dst ==null && obj.dst != null){
            return false
        }else if(this.dst != obj.dst){
            return false
        }
        return true
    }
}

export class Graph {
    private verticeSet:Set<vertice> = new Set()
    private verticeMap:Map<string,vertice> = new Map()
    private adjacencyMap:Map<string,Array<string>> = new Map()
    private edgeMap:Map<string,Array<edge>> = new Map()

    public getVerticeSet(){
        return this.verticeSet
    }
    public getVerticeIDSet(){
        return this.verticeMap.keys()
    }

    public addVertice(v:vertice,... e:edge[]){
        this.verticeSet.add(v)
        this.verticeMap.set(v.getId(),v)

        e.forEach((e)=>{
            this.addEdge(v.getId(),e)
        })
    }

    public addEdge(vId:string,e:edge){

        let currentEdges = this.edgeMap.get(vId)
        if(currentEdges){
                currentEdges.push(e)
            this.edgeMap.set(vId,currentEdges)
        }else{
            this.edgeMap.set(vId,[e])
        }

        let currentAdjEdges = this.adjacencyMap.get(vId)
        if(currentAdjEdges){
            currentAdjEdges.push(e.getDst())
            this.adjacencyMap.set(vId,currentAdjEdges)
        }else{
            this.adjacencyMap.set(vId,[e.getDst()])
        }

    }

    public getEdges(vId:string){
        return this.edgeMap.get(vId)
    }
    public getEdge(src:string,dst:string):edge|null{
        let set = this.edgeMap.get(src)
        let result = null;
        if(set != undefined){
            set.forEach((e)=>{
                if(e.getDst() == dst)
                    result =  e
            })
        }
        return result
    }
    public getVertice(vId:string){
        return this.verticeMap.get(vId)
    }

    public getNumVertices(){
        return this.verticeSet.size
    }
}

export interface cutOfThePhase {
    t:string,
    s:string,
    w:number
}

export interface MinCutResult {
    first:Graph,
    second:Graph,
    edgesOnTheCut:Array<[string,edge]>,
    cutWeight:number
}

let graph = new Graph()
graph.addVertice(new vertice('1', "1"),
new edge('2', 2),
new edge('5', 3));
graph.addVertice(new vertice('2', "2"),
new edge('1', 2),
new edge('3', 3),
new edge('5', 2),
new edge('6', 2));
graph.addVertice(new vertice('3', "3"),
new edge('2', 3),
new edge('4', 4),
new edge('7', 2));
graph.addVertice(new vertice('4', "4"),
new edge('3', 4),
new edge('7', 2),
new edge('8', 2));
graph.addVertice(new vertice('5', "5"),
new edge('1', 3),
new edge('6', 3),
new edge('2', 2));
graph.addVertice(new vertice('6', "6"),
new edge('2', 2),
new edge('5', 3),
new edge('7', 1));
graph.addVertice(new vertice('7', "7"),
new edge('6', 1),
new edge('3', 2),
new edge('4', 2),
new edge('8', 3));
graph.addVertice(new vertice('8', "8"),
new edge('4', 2),
new edge('7', 3));

function maxAdjacencySearch(g:Graph,s?:string){
    let start = ((s !=undefined) ? s : g.getVerticeIDSet().next().value)
    let foundSet:Array<string> = new Array(start)
    let cutWeight = new Array
    let candidates:Set<string> = new Set(g.getVerticeIDSet())
    while (candidates.size > 0) {
        let maxNextVertex:string='';
        let maxWeight = Number.MIN_VALUE
        candidates.forEach((next:string)=>{
            let weightSum:number = 0
            foundSet.forEach((s:string)=>{
                let edge = g.getEdge(s,next)
                if (edge != undefined)weightSum += edge.getWeight()
            })
            if(weightSum > maxWeight) {
                maxNextVertex = next
                maxWeight = weightSum
            }
        })
        candidates.delete(maxNextVertex)
        if(foundSet.includes(maxNextVertex) == false) foundSet.push(maxNextVertex)
        cutWeight.push(maxWeight)
    }

    let n = foundSet.length
    return {
        s:foundSet[n-2],
        t:foundSet[n-1],
        w:cutWeight[cutWeight.length-1]
    }
}

function mergeVerticesFromCut(g:Graph,c:cutOfThePhase){
    let result = new Graph()
    let set = Array.from(g.getVerticeIDSet())
    set.forEach((v)=>{
        let isS = c.s == v
        let isT = c.t == v
        let vObj = g.getVertice(v)
        if(!isS && !isT){
            result.addVertice(vObj as vertice)
            let edges = g.getEdges(v)
            if (edges){
                edges.forEach((e)=>{
                    if(e.getDst() != c.s && e.getDst() != c.t){
                        result.addEdge(v,new edge(e.getDst(),e.getWeight()))
                    }
                })
            }
        }

        if(isS){
            result.addVertice(vObj as vertice)
            let edges = g.getEdges(v)
            if (edges){
                for(let e of edges){
                    if(e.getDst() == c.t){
                        continue
                    }
                    let mergableEdge = g.getEdge(c.t,e.getDst())
                    if(mergableEdge != null){
                        result.addEdge(v,new edge(e.getDst(),e.getWeight()+mergableEdge.getWeight()))
                        result.addEdge(e.getDst(),new edge(v,e.getWeight()+mergableEdge.getWeight()))
                    } else{
                        result.addEdge(v,new edge(e.getDst(),e.getWeight()))
                        result.addEdge(e.getDst(),new edge(v,e.getWeight()))
                    }
                }
            }
        }
    })
    let tEdges = g.getEdges(c.t)
    if(tEdges){
        for(let e of tEdges){
            if(e.getDst() == c.s){
                continue
            }
            let transferEdge = g.getEdge(c.s,e.getDst())
            if(transferEdge==null){
                result.addEdge(c.s,new edge(e.getDst(),e.getWeight()))
                result.addEdge(e.getDst(),new edge(c.s,e.getWeight()))
                
            }
        }
    }
    return result
}

function minimumCutResult(g:Graph,partition:Set<string>|null,bestcut:cutOfThePhase|null){
    if (partition == null || bestcut == null) return
    let first = new Graph()
    let second = new Graph()
    let cuttingEdges: Array<[string,edge]>=new Array
    let cutWeight = 0
    let vSet = Array.from(g.getVerticeIDSet())
    for(let v of vSet){
        if(partition.has(v)) {
            first.addVertice(g.getVertice(v) as vertice)
        } else {
            second.addVertice(g.getVertice(v) as vertice)
        }
    }
    let edgeSet:Map<string,string> = new Map()
    for(let v of vSet){
        let edges = g.getEdges(v)
        if(edges !=undefined){
            for(let e of edges){
                let fVSet=Array.from(first.getVerticeIDSet())
                let sVSet=Array.from(second.getVerticeIDSet())
                
                if(fVSet.includes(v) && fVSet.includes(e.getDst())){
                    first.addEdge(v,new edge(e.getDst(),e.getWeight()))
                } else if (sVSet.includes(v) && sVSet.includes(e.getDst())){
                    second.addEdge(v,new edge(e.getDst(),e.getWeight()))
                } else {
                    cuttingEdges.push([v,new edge(e.getDst(),e.getWeight())])
                    let r = [v,e.getDst()].sort((a,b) =>  (a > b ? 1 : -1))
                    if(!edgeSet.has(r[0])){
                        edgeSet.set(r[0],r[1])
                        cutWeight += e.getWeight()
                    }
                }
            }
        }
    }
    let r:MinCutResult = {
        first:first,
        second:second,
        edgesOnTheCut:cuttingEdges,
        cutWeight:cutWeight
    }
    return r
}

export function minimumCut(g:Graph){
    let originalGraph = g
    let currentPartition: Set<string> = new Set()
    let currentBestPartition:Set<string> | null = null
    let currentBestCut:cutOfThePhase | null = null

    while (g.getNumVertices() > 1) {
        let cutOfThePhase = maxAdjacencySearch(g)
        if (currentBestCut == null || cutOfThePhase.w < currentBestCut.w) {
           currentBestCut = cutOfThePhase
           currentBestPartition = new Set(currentPartition)
           currentBestPartition.add(cutOfThePhase.t)
        }
        currentPartition.add(cutOfThePhase.t)
        g = mergeVerticesFromCut(g, cutOfThePhase)
    }
    console.log(currentBestPartition)
    return minimumCutResult(originalGraph,currentBestPartition,currentBestCut)
    
}