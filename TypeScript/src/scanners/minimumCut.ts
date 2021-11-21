import { minimumCut } from "./StoerWagnerMinCut"
import { Graph } from "./StoerWagnerMinCut"
import { vertice } from "./StoerWagnerMinCut"
import { edge } from "./StoerWagnerMinCut"
/**
export function MakeRoomGraph(room:Room){

    let roomArea = room.lookAtArea(0,0,50,50,true)
    let notWalls = roomArea.filter((i)=>!(i.terrain == 'wall'))
    let exits = room.find(FIND_EXIT)

    let Inf = 10 ** 4
    let graph=new Graph()

    let graphHeight = notWalls.length * 2
    let graphwidth = notWalls.length

    let Verticies = Array.from(roomArea,(i)=>{return [i.x,i.y]})
    // add all verticies to graph
    for( let i in Verticies){
        let x=Verticies[i]
        graph.addVertice(new vertice("T"+x[0]+","+x[1],x[0]+","+x[1]))
        graph.addVertice(new vertice("B"+x[0]+","+x[1],x[0]+","+x[1]))
    }
    // Add edges to graph
    let VerticeID =Array.from(graph.getVerticeIDSet())

    for (let a = 0; a < 50; a++) {
        for (let b = 0; b < 50; b++) {
            // ignore the square if its not passable
            let ignore = VerticeID.includes("")
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
}
 */
export function MakeRoomGraph2(room:Room){
    let roomArea = room.lookAtArea(0,0,50,50,true)
    let notWalls = roomArea.filter((i)=>!(i.terrain == 'wall'))
    let exits = room.find(FIND_EXIT)
    let graph=new Graph()

    for (let square of notWalls){
        
        
        let vertname=square.x+','+square.y
        graph.addVertice(new vertice(
            vertname,vertname))
        }
        let e:Array<edge>=[]
        

    
    let vSet=graph.getVerticeIDSet()


    for(let v of vSet){
        let pos = v.split(',')
        room.visual.text(v,parseInt(pos[0]),parseInt(pos[1]),{font:0.2})       
    }
}