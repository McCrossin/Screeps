import { builderPramga } from "./BuilderPragma";
import { Pragma, Pragmas } from "./pragma";
import { upgradePramga } from "./UpgradePragma";

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
    new builderPramga(4)
)
global.Pragmas = Pragmas