import { stringify } from "querystring"
import { minimumCut } from "./stoerWagnerMinCut"
import { Graph } from "./stoerWagnerMinCut"
import { vertice } from "./stoerWagnerMinCut"
import { edge } from "./stoerWagnerMinCut"

 
export function new_graph_from_area(area: LookAtResultWithPos<LookConstant>[],room:Room) {
    
    const infinity = 10 ** 8
    let out_graph = new Graph()
    let terrain_and_not_walls = area.filter((a) => ( a.type == 'terrain' && a.terrain != 'wall')).sort((a, b) => { return a.y == b.y ? a.x - b.x : a.y - b.y; })
    let structures = area.filter((a) => ( a.type == 'structure' ))
    let resources = area.filter((a) => ( a.type == 'resource' ))

    let terrain_lookup: Map<string, {index:number,x:number,y:number}> = new Map()
    let structure_lookup: Map<string, {index:number,x:number,y:number}> = new Map()
    let resource_lookup: Map<string, {index:number,x:number,y:number}> = new Map()
    let directions = [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]]
    for (let i in terrain_and_not_walls) {
        let e = terrain_and_not_walls[i]
        let v = `${e.x},${e.y}`
        terrain_lookup.set(v, {index:parseInt(i),x:e.x,y:e.y})
        out_graph.addVertice(new vertice(v, v))
    }

    for(let i in structures){
        let e = structures[i]
        let v = `${e.x},${e.y}`
        if(e.structure?.structureType){
            structure_lookup.set(v, {index:parseInt(i),x:e.x,y:e.y})
            out_graph.addVertice(new vertice(v, v))
        }
    }

    for(let i in resources){
        let e = resources[i]
        let v = `${e.x},${e.y}`
        if(out_graph.getVertice(v)){
            resource_lookup.set(v,{index:parseInt(i),x:e.x,y:e.y})
        }
    }

    function check_edge(x: number, y: number) {
        if (x == 0 || x == 49 || y == 0 || y == 49) return true
        return false
    }
    
    let vertex = out_graph.getVerticeIDSet()
    
    for (let vId of vertex) {
        let src_lookup_index = terrain_lookup.get(vId) == undefined ? structure_lookup.get(vId) : terrain_lookup.get(vId)
        if (src_lookup_index == undefined)continue
        // iterate around the x y position
        for (let d of directions) {
            // calculate the new coordinate
            let x2: number = src_lookup_index.x + d[0]
            let y2: number = src_lookup_index.y + d[1]
            let dst_vertice = x2 + ',' + y2
            // check it exists in the graph
            if (out_graph.getVertice(dst_vertice) != undefined) {
                let w = 1
                room.visual.line(src_lookup_index.x,src_lookup_index.y,x2,y2,{lineStyle:'dotted'})
                out_graph.addEdge(vId, new edge(dst_vertice, w))
            }
        }
    }

    let v2 = out_graph.getVerticeIDSet()

    for (let vId of v2) {
        let terrain = terrain_lookup.get(vId)
        let structure = structure_lookup.get(vId)

        let src_lookup_index = terrain ==undefined ? structure : terrain
        if(src_lookup_index == undefined) continue

        let is_edge = check_edge(src_lookup_index.x,src_lookup_index.y)

        if(src_lookup_index != undefined && terrain == undefined || is_edge != false){
            out_graph.SetVerticeIncomingWeight(vId,infinity)
            out_graph.SetVerticeOutgoingWeight(vId,infinity)
            room.visual.text(`${src_lookup_index.x},${src_lookup_index.y}`,src_lookup_index.x,src_lookup_index.y,{color:"#FF0000",font:0.4})         
        }
    }
    
    let result = minimumCut(out_graph)?.edgesOnTheCut

    if(result){
        for(let v of result){
            let pos = v[0].split(',')
            let x = parseInt(pos[0])
            let y = parseInt(pos[1])
            let pos2 = v[1].getDst().split(',')
            let x2 = parseInt(pos2[0])
            let y2 = parseInt(pos2[1])
            room.visual.line(x,y,x2,y2,{color:"#FF0000"})
        }
    }    
}
