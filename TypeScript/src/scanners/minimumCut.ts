interface edge{
    top: {x:number,y:number},
    bottom: {x:number,y:number},
    capacity: number

}
interface terminalEdge{
    pos: {x:number,y:number}
    capacity:number
}
interface vertice{
    pos: {x:number,y:number}
}
interface Graph {
    vertices: Array<vertice>,
    edges: Array<edge>
    terminalEdges: Array<terminalEdge>
}

export function minimumCut(room:Room){

    let roomArea = room.lookAtArea(0,0,50,50,true)
    let notWalls = roomArea.filter((i)=>!(i.terrain == 'wall'))
    let exits = room.find(FIND_EXIT)

    let Inf = 10 ** 4
    let graph:Graph={vertices:[],edges:[],terminalEdges:[]}

    let graphHeight = notWalls.length * 2
    let graphwidth = notWalls.length

    let topVerticies = Array.from(roomArea,(i)=>{return [i.x,i.y]})
    let bottomVerticies = Array.from(roomArea,(i)=>{return [i.x,i.y]})
    // add all verticies to graph
    for( let i in topVerticies){
        let x=topVerticies[i]
        graph.vertices.push({pos:{x:x[0],y:x[1]}})
    }
    for( let i in bottomVerticies){
        let x=bottomVerticies[i]
        graph.vertices.push({pos:{x:x[0],y:x[1]}})
    }
    // Add edges to graph
    for (let a = 0; a < 50; a++) {
        for (let b = 0; b < 50; b++) {
            // ignore the square if its not passable
            let ignore = graph.vertices.find((i)=>{
                return i.pos.x == a && i.pos.y == b
            });
            if(ignore == undefined) continue;
            // add top to bottom edges
            graph.edges.push({
                top:{x:a,y:b},
                bottom:{x:a,y:b},
                capacity:1
            })

            // add top to top edgges to the neighbours
            for(let [da,db] of [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]]){
                let a2 = a + da
                let b2 = b + db

                let check = graph.vertices.find((i)=>{
                    return i.pos.x == a2 && i.pos.y == b2
                });
                if ((0 <= a2 && 50 < a2) && (0 <= b2 && 50 < b2 )){
                    graph.edges.push({
                        top:{x:a,y:b},
                        bottom:{x:a2,y:b2},
                        capacity:Inf
                    })                  
                }
            }
        }
    }
    // mark a point as being unavailable for removal
    function disable(a:number,b:number){
        graph.edges.push({
            top:{x:a,y:b},
            bottom:{x:a,y:b},
            capacity:Inf
        })
    }
    // mark a point as being a potential entrance
    function add_sink(a:number,b:number){
        let index = graph.vertices.find((i)=>{
            return i.pos.x == a && i.pos.y == b
        });
        if(!index == undefined){
            graph.terminalEdges.push(
                {
                    pos:{x:a,y:b},
                    capacity:Inf
                }
            )
            disable(a,b)
        }
    }
    // mark a point as needing to be protected
    function add_source(a:number,b:number){
        let index = graph.vertices.find((i)=>{
            return i.pos.x == a && i.pos.y == b
        });
        if(!index == undefined){
            graph.terminalEdges.push(
                {
                    pos:{x:a,y:b},
                    capacity:Inf
                }
            )
        }
    }
    
}