const expect = require("chai").expect;
const assert = require("chai").assert;

describe(
    'usherJs module', () => {
        it(
            "1+1=2", () => {
                console.log("foo: $npm_config_foo")                  
                expect(1+1).to.equal(2);
            }
        ) 

    }
)


