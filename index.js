const path = require("path");
const { json, send, serve } = require("micri");

const TIMEOUT = process.env.TIMEOUT === undefined ? 5_000 : +process.env.TIMEOUT;

const server = serve(async (req, res) => {
    const body = await json(req);

    const request = {
        env: body.env ?? {},
        headers: body.headers ?? {},
        payload: body.payload ?? {},
    };

    const response = {
        send: (text, status = 200) => send(res, status, text),
        json: (json, status = 200) => send(res, status, json),
    };
    try {
        let userFunction = require(path.join(body.path, body.file));

        if (!(userFunction || userFunction.constructor || userFunction.call || userFunction.apply)) {
            throw new Error("User function is not valid.")
        }

        const timer = setTimeout(() => {
            send(res, 500, {
                code: 500,
                message: `Function timed out after ${TIMEOUT}ms.`
            });
            process.exit();
        }, TIMEOUT);

        await userFunction(request, response);
        clearTimeout(timer);
    } catch (error) {
        send(res, 500, {
            code: 500,
            message: error.code === 'MODULE_NOT_FOUND' ? "Code file not found." : error.message
        });
    }
});

server.listen(3000);