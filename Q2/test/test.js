const { expect, assert } = require("chai"); // Include Chai module for assert and expect functionality.
const { ethers } = require("hardhat");      // Include Hardhat module for ethers functionality. 
const { groth16, plonk } = require("snarkjs");     // Include snarkjs module for groth16 and plonk proving system functionality.

const wasm_tester = require("circom_tester").wasm; // .wasm file will be required to test circuits.

const F1Field = require("ffjavascript").F1Field; // Includes finite field library for F1 Field functionality. 
const Scalar = require("ffjavascript").Scalar;   // Includes finite field library for Scalar functionality. 
// Converts big integer using fromString and Scalar functionalities. 
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p); // Creates new F1 field using bigint in line 10. 

describe("HelloWorld", function () { // Outputs header that reads string in quotes.
    this.timeout(100000000); // Will timeout after alotted time. 
    let Verifier; // Initializes 1st verifier.
    let verifier; // Initializes 2nd verifier. 

    beforeEach(async function () { // Before each test in a "describe", run the following commands.
        Verifier = await ethers.getContractFactory("HelloWorldVerifier"); // Waits for contract factory to be made. 
        verifier = await Verifier.deploy(); // Waits for deployment of 1st verifier.
        await verifier.deployed(); // Wait for 2nd verifier to be deployed. 
    }); // Ends beforeEach statement. 

    it("Circuit should multiply two numbers correctly", async function () { // Prints quoted string to console.
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom"); // Assigns variable to tested circuit.

        const INPUT = { // Defines input into HelloWorld circuit.
            "a": 2,     // Sets input signal a equal to 2.
            "b": 3      // Sets input signal b equal to 3.
        }               // Ends initialization.

        const witness = await circuit.calculateWitness(INPUT, true); // Generates a witness for proof given a certain input. 

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1))); // First digit in witness string should be 1. 
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(6))); // Second digit in witness string should be result of multiplication of two numbers.

    }); // Ends it statement.

    it("Should return true for correct proof", async function () { // Prints quoted string to console.
        // Proves HelloWorld circuit with given input and .wasm and .zkey filepaths.
        const { proof, publicSignals } = await groth16.fullProve({ "a": "2", "b": "3" }, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm", "contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('2x3 =', publicSignals[0]); // Prints "2x3 = 6"

        // Exports Solidity calldata and assigns it to variable.
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        // Replaces certain keyboard characters and formats calldata string. 
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];                       // First item listed in calldata should have this format.
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // Second item listed in calldata should have this format.
        const c = [argv[6], argv[7]];                       // Third item listed in calldata should have this format.
        const Input = argv.slice(8);                        // Slices calldata string into relevant arguments for proof below. 

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // Wait for proof to be verified, and expect the proof to be true.
    }); // Ends it statement.

    it("Should return false for invalid proof", async function () { // Prints quoted string to console.
        let a = [0, 0];           // This is an obvious mistatement on purpose as none of the values in callback should be equal to 0.
        let b = [[0, 0], [0, 0]]; // None of the arguments in callback should be 0. 
        let c = [0, 0];           // None of the arguments in callback should be 0. 
        let d = [0]               // Input shouldn't be 0.
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false; // Wait for proof to be verified, and expect the proof to be false. 
    }); // Ends it statement.
});


describe("Multiplier3 with Groth16", function () { // Outputs header that reads string in quotes.

    beforeEach(async function () { // Before each test in a "describe", run the following commands.
        Verifier = await ethers.getContractFactory("HelloWorldVerifier"); // Waits for contract factory to be made. 
        verifier = await Verifier.deploy(); // Waits for deployment of 1st verifier.
        await verifier.deployed(); // Wait for 2nd verifier to be deployed. 
    }); // Ends beforeEach statement. 

    it("Circuit should multiply three numbers correctly", async function () { // Prints quoted string to console.
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom"); // Assigns variable to tested circuit.

        const INPUT = { // Defines input into Multiplier3 circuit.
            "a": 2,     // Sets 1st input signal equal to 2.
            "b": 3,     // Sets 2nd input signal equal to 3.
            "c": 4      // Sets 3rd input signal equal to 4.
        }               // Ends initialization.

        const witness = await circuit.calculateWitness(INPUT, true); // Generates a witness for proof given a certain input. 

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1))); // First digit in witness string should be 1. 
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(24))); // Second digit in witness string should be result of multiplication of three numbers.
    });

    it("Should return true for correct proof", async function () { // Prints quoted string to console.
        // Proves HelloWorld circuit with given input and .wasm and .zkey filepaths.
        const { proof, publicSignals } = await groth16.fullProve({ "a": "2", "b": "3", "c": "4" }, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('2x3x4 =', publicSignals[1]); // Prints "2x3x4 = 24"

        // Exports Solidity calldata and assigns it to variable.
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        // Replaces certain keyboard characters and formats calldata string. 
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];                       // First item listed in calldata should have this format.
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // Second item listed in calldata should have this format.
        const c = [argv[6], argv[7]];                       // Third item listed in calldata should have this format.
        const Input = argv.slice(8);                        // Slices calldata string into relevant arguments for proof below. 

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // Wait for proof to be verified, and expect the proof to be true.
    }); // Ends it statement.

    it("Should return false for invalid proof", async function () {
        let a = [0, 0];           // This is an obvious mistatement on purpose as none of the values in callback should be equal to 0.
        let b = [[0, 0], [0, 0]]; // None of the arguments in callback should be 0. 
        let c = [0, 0];           // None of the arguments in callback should be 0. 
        let d = [0]               // Input shouldn't be 0.

        expect(await verifier.verifyProof(a, b, c, d)).to.be.false; // Wait for proof to be verified, and expect the proof to be false. 
    }); // Ends it statement.
});


describe("Multiplier3 with PLONK", function () { // Outputs header that reads string in quotes.

    beforeEach(async function () { // Before each test in a "describe", run the following commands.
        Verifier = await ethers.getContractFactory("Multiplier3_plonkVerifier"); // Waits for contract factory to be made. 
        verifier = await Verifier.deploy(); // Waits for deployment of 1st verifier.
        await verifier.deployed();          // Wait for 2nd verifier to be deployed. 
    }); // Ends beforeEach statement. 

    it("Should return true for correct proof", async function () { // Prints quoted string to console.
        const { proof, publicSignals } = await plonk.fullProve({ "a": "2", "b": "3", "c": "4" }, "contracts/circuits/Multiplier3_plonk/Multiplier3_plonk_js/Multiplier3_plonk.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('2x3x4 =', publicSignals[1]); // Prints "2x3x4 = 24"

        // Exports Solidity calldata and assigns it to variable.
        const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

        // Replaces certain keyboard characters and formats calldata string. 
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        console.log(calldata);
        console.log(argv);

        const a = [argv[0], argv[1]];                       // First item listed in calldata should have this format.
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // Second item listed in calldata should have this format.
        const c = [argv[6], argv[7]];                       // Third item listed in calldata should have this format. 
        const Input = argv.slice(8);                        // Slices calldata string into relevant arguments for proof below. 

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // Wait for proof to be verified, and expect the proof to be true.
    });

    it("Should return false for invalid proof", async function () {

        let a = [0, 0];           // This is an obvious mistatement on purpose as none of the values in callback should be equal to 0.
        let b = [[0, 0], [0, 0]]; // None of the arguments in callback should be 0. 
        let c = [0, 0];           // None of the arguments in callback should be 0. 
        let d = [0]               // Input shouldn't be 0.

        expect(await verifier.verifyProof(a, b, c, d)).to.be.false; // Wait for proof to be verified, and expect the proof to be false. 
    }); // Ends it statement.

});