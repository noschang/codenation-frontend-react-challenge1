'use strict'

function encode(message, places) {
    return processMessage(message, places, (charCode, places) => {
        return (charCode + places) % 26
    })
}

function decode(message, places) {
    return processMessage(message, places, (charCode, places) => {
        return (26 + charCode - places) % 26
    })
}

function processMessage(message, places, constrain) {

    let result = ''
    let charCode = ''

    for (let i = 0; i < message.length; i++) {

        charCode = message.charCodeAt(i)

        if (charIsNotReserved(charCode)) {

            // The char code for lowercase letters range from a = 97 to z = 122 as explained in 
            // https://pt.wikipedia.org/wiki/ASCII
            //
            // Before processing the message we subtract 97 from char code in order to remap the 
            // char codes to a = 0 and z = 25. This will simplify the calculations allowing us to
            // use the mod operation (%) to constrain the values between 0 and 25.
            //
            // After processing the message, we need to sum the 97 again to remap the char codes
            // back to a = 97 and z = 122

            charCode = charCode - 97
            charCode = constrain(charCode, places)
            charCode = charCode + 97
        }

        result = result + String.fromCharCode(charCode)
    }

    return result
}

function charIsNumber(charCode) {
    return charCode >= 48 && charCode <= 57
}

function charIsDot(charCode) {
    return charCode === 46
}

function charIsSpace(charCode) {
    return charCode === 32
}

function charIsNotReserved(charCode) {
    return !charIsReserved(charCode)
}

function charIsReserved(charCode) {
    return charIsNumber(charCode) || charIsDot(charCode) || charIsSpace(charCode)
}

module.exports = {
    encode, decode
}