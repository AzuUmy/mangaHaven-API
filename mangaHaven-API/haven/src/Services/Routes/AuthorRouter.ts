import Router from "koa-router";
import { getAllAuthors } from "../Controller/Author_Controller/Author_controller";

const router = new Router();

router.get("/getAllAuthors", getAllAuthors );

export default router;