import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { AppDataSource } from './Services/Database/Connection/createConnection';
import logger from './Logs/logger';
import { middleWareError } from './Error/MidleWareError';

//action imports
import mangaRouter from './Services/Routes/MangasRouter';
import coverRouter from './Services/Routes/CoverRouter';
import authorRouter from './Services/Routes/AuthorRouter';
import genresRouter from './Services/Routes/GenresRouter';
import trandingTitles from './Services/Routes/getTranding';
import search from './Services/Routes/SearchRouter';
import * as process from "node:process";

const app = new Koa();
const router = new Router();

AppDataSource.initialize()
    .then(() => {
        logger.info('AppDataSource initialized');
    })
    .catch((err) => {
        logger.error('Error during AppDataSource initialization:', err);
        process.exit(1);
    });

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        const error = err as middleWareError;
        logger.error('Server error', error);
        ctx.status = error.status || 500;
        ctx.body = error.message || 'Internal Server Error';
    }
});


app
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

router.use('/api', mangaRouter.routes(), mangaRouter.allowedMethods());
router.use('/api', coverRouter.routes(), coverRouter.allowedMethods());
router.use('/api', authorRouter.routes(), authorRouter.allowedMethods());
router.use('/api', genresRouter.routes(), genresRouter.allowedMethods());
router.use('/api', trandingTitles.routes(), trandingTitles.allowedMethods());
router.use('/api', search.routes(), search.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server init listening on ${PORT}`);
});