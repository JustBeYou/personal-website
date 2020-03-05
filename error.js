async function safeResponse(res, callback) {
    try {
        await callback();
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({
            message: JSON.stringify(err, ["message", "arguments", "type", "name", "stack"])
        });
    }
}

module.exports = {
    safeResponse,
}