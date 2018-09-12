import { NestFactory } from "@nestjs/core";
import * as bodyParser from "body-parser";
import { ApplicationModule } from "./application.module";
import "./vendor";

/**
 * 跨域问题
 * @param req
 * @param res
 * @param next
 */
const cross = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,Content-Length,X-Requested-With");
    if ("OPTIONS" === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);
    app.use(cross);
    await app.listen(3001);
}

bootstrap().then(() => console.log("Application is listening on port 3001"));
