import { inspect } from "util"

console.log(inspect((() => {console.log("hello")}).toString(), {showHidden: true}))