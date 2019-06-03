'use strict'

const axios = require('axios')
const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const sha1 = require('sha1')
const FormData = require('form-data')
const cesar = require('./cesar')

async function start() {

    const userToken = '292910eb690404a729526a24d7454667b753861e'
    const challengeFile = path.join(os.homedir(), '.codenation/frontend-react/challenge1/answer.json')

    const challenge = await downloadChallenge(userToken)

    await solveChallenge(challenge)
    await saveChallenge(challenge, challengeFile)
    await uploadChallenge(challenge, challengeFile, userToken)

    return challenge
}

async function downloadChallenge(userToken) {

    const url = `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${userToken}`
    const response = await axios.get(url)

    return response.data
}

async function solveChallenge(challenge) {

    const places = challenge.numero_casas
    const encryptedMessage = challenge.cifrado
    const decryptedMessage = cesar.decode(encryptedMessage, places)

    challenge.decifrado = decryptedMessage
    challenge.resumo_criptografico = sha1(decryptedMessage)
}

async function saveChallenge(challenge, destinationFile) {

    const challengeJson = JSON.stringify(challenge)
    const destinationFolder = path.dirname(destinationFile)

    await fs.mkdir(destinationFolder, { recursive: true })
    await fs.writeFile(destinationFile, challengeJson)
}

async function uploadChallenge(challenge, challengeFile, userToken) {

    const url = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${userToken}`
    const form = new FormData()

    form.append('answer', fs.createReadStream(challengeFile))

    const headers = { 'content-type': `multipart/form-data; boundary=${form._boundary}` }
    const response = await axios.post(url, form, { headers: headers })

    challenge.score = response.data.score
}

start().then(challenge => {
    console.log(`Challenge completed with score ${challenge.score}`)
    console.log()
    console.log(challenge)
}).catch(error => {
    console.error(error)
})
