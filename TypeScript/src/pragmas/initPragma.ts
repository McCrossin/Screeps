import { builderPramga } from "./builderPragma";
import { basicDefenderPramga } from "./basicDefenderPragma";
import { Pragma, Pragmas } from "./pragma";
import { upgradePramga } from "./upgradePragma";

declare global {
    namespace NodeJS {
        interface Global {
            Pragmas: Record<string, Pragma>
        }
    }
}

export const PriorityPragmas: Pragma[] = [];

/**
 * Init Pragmas
 * add pragmas to global list and populate priority pragmas list
 * @param args pragmas to add to list
 */
export function init(...args:Pragma[]){
    for (let pragma of args){
        if (!Pragmas[pragma.id]){
            Pragmas[pragma.id] = pragma;
            PriorityPragmas.push(pragma)
        }
    }
    PriorityPragmas.sort((a,b)=> b.priority - a.priority)
}

// load the constant pragmas with priority
init(
    new upgradePramga(5),
    new builderPramga(4),
    /**TODO Initialize defenders when have more energy
    Basic defenders will not kill the Source Defenders
    new basicDefenderPramga(2)
    */
)
global.Pragmas = Pragmas