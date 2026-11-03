function entierPositif(value){
    const result = value && isFinite(value) && value > 0 && value == parseInt(value)

    return result
}

module.exports = entierPositif